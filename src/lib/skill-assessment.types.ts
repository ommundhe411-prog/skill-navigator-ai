import { z } from "zod";

export const skillAssessmentInputSchema = z.object({
  targetRole: z.string().trim().min(2).max(100),
  skills: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        level: z.number().int().min(0).max(100),
      }),
    )
    .min(1)
    .max(12),
});

export const skillGapSchema = z.object({
  skill: z.string(),
  current: z.number(),
  target: z.number(),
  priority: z.enum(["High", "Medium", "Low"]),
  reason: z.string(),
});

export const roadmapStepSchema = z.object({
  title: z.string(),
  weeks: z.string(),
  duration: z.string(),
  impact: z.enum(["High", "Medium", "Low"]),
  outcome: z.string(),
});

export const skillAssessmentResultSchema = z.object({
  targetRole: z.string(),
  summary: z.string(),
  readinessScore: z.number(),
  estimatedWeeks: z.number(),
  gaps: z.array(skillGapSchema),
  roadmap: z.array(roadmapStepSchema),
  recommendation: z.object({
    title: z.string(),
    description: z.string(),
    readinessLift: z.number(),
  }),
});

export type SkillAssessmentInput = z.infer<typeof skillAssessmentInputSchema>;
export type SkillAssessmentResult = z.infer<typeof skillAssessmentResultSchema>;

export type SkillAssessmentResponse =
  | { ok: true; assessment: SkillAssessmentResult }
  | { ok: false; error: string; code: "validation" | "credits" | "configuration" | "denied" | "rate_limit" | "service" };