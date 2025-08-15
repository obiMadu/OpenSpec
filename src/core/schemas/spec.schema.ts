import { z } from 'zod';
import { RequirementSchema } from './base.schema.js';

export const SpecSchema = z.object({
  name: z.string().min(1, 'Spec name cannot be empty'),
  overview: z.string().min(1, 'Overview section cannot be empty'),
  requirements: z.array(RequirementSchema)
    .min(1, 'Spec must have at least one requirement'),
  metadata: z.object({
    version: z.string().default('1.0.0'),
    format: z.literal('openspec'),
    sourcePath: z.string().optional(),
  }).optional(),
});

export type Spec = z.infer<typeof SpecSchema>;