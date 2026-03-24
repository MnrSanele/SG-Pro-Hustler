import { z } from "zod";

export const SquadSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(50),
  description: z.string().max(2000).optional(),
  tagline: z.string().max(200).optional(),
  serviceAreas: z.array(z.string()).default([]),
  maxCapacity: z.number().int().min(2).max(50).default(10),
  categoryIds: z.array(z.string()).default([]),
});

export type SquadInput = z.infer<typeof SquadSchema>;
