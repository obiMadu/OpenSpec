import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../validation/constants.js';

export const ScenarioSchema = z.object({
  given: z.string().min(1, VALIDATION_MESSAGES.GIVEN_EMPTY),
  when: z.string().min(1, VALIDATION_MESSAGES.WHEN_EMPTY),
  then: z.string().min(1, VALIDATION_MESSAGES.THEN_EMPTY),
});

export const RequirementSchema = z.object({
  text: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIREMENT_EMPTY)
    .refine(
      (text) => text.includes('SHALL') || text.includes('MUST'),
      VALIDATION_MESSAGES.REQUIREMENT_NO_SHALL
    ),
  scenarios: z.array(ScenarioSchema)
    .min(1, VALIDATION_MESSAGES.REQUIREMENT_NO_SCENARIOS),
});

export type Scenario = z.infer<typeof ScenarioSchema>;
export type Requirement = z.infer<typeof RequirementSchema>;