import { z } from "zod";

export const ReviewSchema = z.object({
  jobId: z.string().optional(),
  subjectUserId: z.string().optional(),
  providerProfileId: z.string().optional(),
  squadId: z.string().optional(),
  overallRating: z.number().min(1).max(5),
  comment: z.string().max(2000).optional(),
  scoreBreakdown: z.object({
    quality: z.number().min(1).max(5).optional(),
    professionalism: z.number().min(1).max(5).optional(),
    punctuality: z.number().min(1).max(5).optional(),
    communication: z.number().min(1).max(5).optional(),
    valueForMoney: z.number().min(1).max(5).optional(),
    wouldHireAgain: z.boolean().optional(),
  }).optional(),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;
