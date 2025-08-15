import { z } from 'zod';
import { RequirementSchema } from './base.schema.js';

export const DeltaOperationType = z.enum(['ADDED', 'MODIFIED', 'REMOVED']);

export const DeltaSchema = z.object({
  spec: z.string().min(1, 'Spec name cannot be empty'),
  operation: DeltaOperationType,
  description: z.string().min(1, 'Delta description cannot be empty'),
  requirements: z.array(RequirementSchema).optional(),
});

export const ChangeSchema = z.object({
  name: z.string().min(1, 'Change name cannot be empty'),
  why: z.string()
    .min(50, 'Why section must be at least 50 characters')
    .max(1000, 'Why section should not exceed 1000 characters'),
  whatChanges: z.string().min(1, 'What Changes section cannot be empty'),
  deltas: z.array(DeltaSchema)
    .min(1, 'Change must have at least one delta')
    .max(10, 'Consider splitting changes with more than 10 deltas'),
  metadata: z.object({
    version: z.string().default('1.0.0'),
    format: z.literal('openspec-change'),
    sourcePath: z.string().optional(),
  }).optional(),
});

export type DeltaOperation = z.infer<typeof DeltaOperationType>;
export type Delta = z.infer<typeof DeltaSchema>;
export type Change = z.infer<typeof ChangeSchema>;