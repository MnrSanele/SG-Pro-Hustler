import { z } from "zod";

export const ProviderSkillSelectionSchema = z.object({
  skillId: z.string().min(1, "Skill is required"),
  proficiencyRank: z.number().int().min(1).max(5),
});

export const ProviderProfileSchema = z.object({
  image: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  bio: z.string().max(1000).optional(),
  tagline: z.string().max(200).optional(),
  mainTrade: z.string().max(100).optional(),
  pricingModel: z.enum(["HOURLY", "DAILY", "PROJECT_BASED", "NEGOTIABLE"]).default("NEGOTIABLE"),
  hourlyRate: z.number().positive().optional(),
  dailyRate: z.number().positive().optional(),
  availableNow: z.boolean().default(false),
  emergencyAvailable: z.boolean().default(false),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  serviceAreas: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(["English"]),
  selectedSkills: z.array(ProviderSkillSelectionSchema).default([]),
});

export const PortfolioProjectSchema = z.object({
  title: z.string().min(3, "Project title must be at least 3 characters").max(120),
  description: z.string().max(2000).optional(),
  area: z.string().max(120).optional(),
  budgetRange: z.string().max(120).optional(),
  dateCompleted: z.date().optional(),
  rolePerformed: z.string().max(120).optional(),
  mediaUrls: z.array(z.string().min(1)).min(1, "Upload at least one project image"),
  coverIndex: z.number().int().min(0),
});

export type ProviderProfileInput = z.infer<typeof ProviderProfileSchema>;
export type ProviderSkillSelectionInput = z.infer<typeof ProviderSkillSelectionSchema>;
export type PortfolioProjectInput = z.infer<typeof PortfolioProjectSchema>;
