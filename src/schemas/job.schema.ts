import { z } from "zod";

export const JobSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  categoryId: z.string().optional(),
  mode: z.enum(["INSTANT", "QUOTE_BASED"]).default("INSTANT"),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  urgency: z.enum(["immediate", "this_week", "flexible"]).optional(),
  preferredTiming: z.string().optional(),
  location: z.string().optional(),
  materialsProvided: z.boolean().default(false),
  requiredSkills: z.array(z.string()).default([]),
  isRemote: z.boolean().default(false),
});

export type JobInput = z.infer<typeof JobSchema>;
