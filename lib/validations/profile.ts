import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100),

  headline: z.string().max(120).optional(),

  bio: z.string().max(500).optional(),

  phone: z.string().max(20).optional(),

  location: z.string().max(120).optional(),

  linkedinUrl: z.string().url().optional().or(z.literal("")),

  githubUrl: z.string().url().optional().or(z.literal("")),

  websiteUrl: z.string().url().optional().or(z.literal("")),

  experienceLevel: z.string().optional(),

  jobRole: z.string().optional(),

  yearsExperience: z.number().min(0).max(50).optional(),

  avatarUrl: z.string().url().optional().or(z.literal("")),
});