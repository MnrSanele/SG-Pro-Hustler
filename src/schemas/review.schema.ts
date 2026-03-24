import { z } from "zod";

export const ReviewSchema = z.object({
  jobId: z.string().min(1, "Job is required"),
  type: z.enum(["REQUESTER_TO_PROVIDER", "PROVIDER_TO_REQUESTER"]),
  overallRating: z.number().min(1).max(5),
  comment: z.string().max(2000).optional(),
  scoreBreakdown: z
    .object({
      quality: z.number().min(1).max(5).optional(),
      professionalism: z.number().min(1).max(5).optional(),
      punctuality: z.number().min(1).max(5).optional(),
      communication: z.number().min(1).max(5).optional(),
      valueForMoney: z.number().min(1).max(5).optional(),
      wouldHireAgain: z.boolean().optional(),
      clarityOfBrief: z.number().min(1).max(5).optional(),
      paymentReliability: z.number().min(1).max(5).optional(),
      conduct: z.number().min(1).max(5).optional(),
      worksiteReadiness: z.number().min(1).max(5).optional(),
      wouldWorkAgain: z.boolean().optional(),
    })
    .optional(),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;
