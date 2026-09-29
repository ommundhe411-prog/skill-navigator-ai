import { createServerFn } from "@tanstack/react-start";

import { generateSkillAssessment } from "./skill-assessment.server.ts";
import { skillAssessmentInputSchema } from "./skill-assessment.types.ts";

export const createSkillAssessment = createServerFn({ method: "POST" })
  .inputValidator((data) => skillAssessmentInputSchema.parse(data))
  .handler(async ({ data }) => generateSkillAssessment(data));