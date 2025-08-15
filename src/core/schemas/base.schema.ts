import { z } from 'zod';

export const ScenarioSchema = z.object({
  given: z.string().min(1, 'Given clause cannot be empty'),
  when: z.string().min(1, 'When clause cannot be empty'),
  then: z.string().min(1, 'Then clause cannot be empty'),
});

export const RequirementSchema = z.object({
  text: z.string()
    .min(1, 'Requirement text cannot be empty')
    .refine(
      (text) => text.includes('SHALL') || text.includes('MUST'),
      'Requirement must contain SHALL or MUST keyword'
    ),
  scenarios: z.array(ScenarioSchema)
    .min(1, 'Requirement must have at least one scenario'),
});

export type Scenario = z.infer<typeof ScenarioSchema>;
export type Requirement = z.infer<typeof RequirementSchema>;