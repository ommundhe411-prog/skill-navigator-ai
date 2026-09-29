# AI Skill-Gap Assessment

## What will be built
- Add a prominent **Build my roadmap** action to the existing learner dashboard.
- Open a focused assessment flow where learners enter a target job role and add their current skills with self-rated proficiency.
- Send the assessment securely through Lovable AI Gateway using the required `openai/gpt-6-astra` model.
- Return a personalized result containing an overall readiness score, prioritized skill gaps, a concise rationale, and a sequenced learning roadmap.
- Replace the dashboard's sample target role, skill-gap chart, recommendation, and roadmap with the generated result for the current session.
- Include clear generating, validation, empty, retryable, credit/configuration, and success states while preserving the learner's entries if generation fails.

## Experience
- Keep the approved black, sky-blue, frosted-glass bento direction and Space Grotesk / DM Sans typography.
- Use an accessible dialog with repeatable skill rows, proficiency controls, add/remove actions, and a clear generate action.
- Make generated results readable on desktop and mobile, with the existing Overview, Roadmap, and Skills views reflecting the new plan.
- Keep data session-only for now; accounts and saved assessments remain out of scope.

## Technical details
- Enable Lovable Cloud so the AI request and secret stay server-side.
- Add a TanStack server function and server-only Gateway client using the OpenAI Responses API, streamed internally and consumed as a final structured result.
- Validate inputs and model output with Zod; ask for compact JSON in the prompt, parse defensively, and clamp numeric results in application code.
- Use the gateway-issued run ID, required reasoning options, and exact error semantics. Do not retry terminal failures or silently switch models.
- Add only the AI SDK packages needed for the supported Gateway integration.
- Update the project architecture note for the new server boundary, then verify the live Gateway response, desktop flow, mobile layout, and build health.
