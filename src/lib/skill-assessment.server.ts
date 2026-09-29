import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayRunIdFetch } from "./ai-gateway-run-id.server.ts";
import {
  skillAssessmentInputSchema,
  skillAssessmentResultSchema,
  type SkillAssessmentInput,
  type SkillAssessmentResponse,
  type SkillAssessmentResult,
} from "./skill-assessment.types.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function cleanJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return candidate.trim();
}

function normalizeAssessment(result: SkillAssessmentResult, targetRole: string): SkillAssessmentResult {
  return {
    ...result,
    targetRole,
    readinessScore: clamp(result.readinessScore, 0, 100),
    estimatedWeeks: clamp(result.estimatedWeeks, 1, 52),
    gaps: result.gaps.slice(0, 6).map((gap) => ({
      ...gap,
      current: clamp(gap.current, 0, 100),
      target: clamp(gap.target, 0, 100),
    })),
    roadmap: result.roadmap.slice(0, 6),
    recommendation: {
      ...result.recommendation,
      readinessLift: clamp(result.recommendation.readinessLift, 1, 25),
    },
  };
}

function getErrorDetails(error: unknown) {
  const candidate = error as { statusCode?: number; responseBody?: string; message?: string };
  let message = candidate?.message || "The AI service could not complete this assessment.";
  if (candidate?.responseBody) {
    try {
      const body = JSON.parse(candidate.responseBody) as { message?: string; error?: { message?: string } };
      message = body.message ?? body.error?.message ?? message;
    } catch {
      // Keep the SDK's safe message when the response body is not JSON.
    }
  }
  return { status: candidate?.statusCode, message };
}

export async function generateSkillAssessment(input: SkillAssessmentInput): Promise<SkillAssessmentResponse> {
  const parsedInput = skillAssessmentInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { ok: false, code: "validation", error: "Add a target role and at least one skill before generating your roadmap." };
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return { ok: false, code: "configuration", error: "AI generation is not configured for this workspace yet." };
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const openai = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch,
  });

  const skills = parsedInput.data.skills.map((skill) => `- ${skill.name}: ${skill.level}/100`).join("\n");
  const prompt = `Create a realistic skill-gap analysis for a learner targeting the role "${parsedInput.data.targetRole}".

Their self-rated current skills are:
${skills}

Return ONLY a JSON object with this exact shape:
{
  "targetRole": "string",
  "summary": "2 concise sentences",
  "readinessScore": 0,
  "estimatedWeeks": 0,
  "gaps": [{"skill":"string","current":0,"target":0,"priority":"High|Medium|Low","reason":"one concise sentence"}],
  "roadmap": [{"title":"string","weeks":"Week 1–2","duration":"3h / week","impact":"High|Medium|Low","outcome":"one measurable outcome"}],
  "recommendation": {"title":"string","description":"one concise sentence","readinessLift":0}
}

Requirements:
- Infer the core skills expected for the target role and include missing skills with current score 0.
- Return 4–6 prioritized gaps and 4–6 sequenced roadmap steps.
- Keep target scores realistic and between 60 and 95.
- Use the learner's self-ratings as provided; do not inflate them.
- Keep the roadmap practical, specific, and job-outcome oriented.
- Do not include markdown or commentary outside the JSON object.`;

  try {
    const result = streamText({
      model: openai.responses(MODEL),
      system: "You are an expert career coach and curriculum architect. Produce evidence-informed, concise learning plans without claiming guaranteed employment outcomes.",
      prompt,
      maxRetries: 2,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "medium",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = await result.text;
    const assessment = normalizeAssessment(skillAssessmentResultSchema.parse(JSON.parse(cleanJson(text))), parsedInput.data.targetRole);
    if (assessment.gaps.length === 0 || assessment.roadmap.length === 0) {
      throw new z.ZodError([]);
    }
    return { ok: true, assessment };
  } catch (error) {
    const { status, message } = getErrorDetails(error);
    console.error("Skill assessment generation failed", { status, message, runId: runIdFetch.getRunId() });
    if (status === 402) return { ok: false, code: "credits", error: message };
    if (status === 401) return { ok: false, code: "configuration", error: message };
    if (status === 403) return { ok: false, code: "denied", error: message };
    if (status === 429) return { ok: false, code: "rate_limit", error: message };
    if (status && status >= 500) return { ok: false, code: "service", error: message };
    return { ok: false, code: "service", error: "The AI response could not be turned into a roadmap. Your entries are still here—please try again." };
  }
}