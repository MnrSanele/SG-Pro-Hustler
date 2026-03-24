import { z } from "zod";

export const ProviderProfileSchema = z.object({
  slug: z.string().min(3).max(50),
  bio: z.string().max(1000).optional(),
  tagline: z.string().max(200).optional(),
  mainTrade: z.string().optional(),
  pricingModel: z.enum(["HOURLY", "DAILY", "PROJECT_BASED", "NEGOTIABLE"]).default("NEGOTIABLE"),
  hourlyRate: z.number().positive().optional(),
  dailyRate: z.number().positive().optional(),
  availableNow: z.boolean().default(false),
  emergencyAvailable: z.boolean().default(false),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  serviceAreas: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(["English"]),
});

export type ProviderProfileInput = z.infer<typeof ProviderProfileSchema>;
