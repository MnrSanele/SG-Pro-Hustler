import { z } from "zod";

export const JobApplicationSchema = z.object({
  jobId: z.string().min(1, "Job is required"),
  message: z.string().max(2000, "Message must be 2000 characters or less").optional(),
  proposedBudget: z.number().positive("Quote must be greater than 0").optional(),
});

export type JobApplicationInput = z.infer<typeof JobApplicationSchema>;
