import { z } from "zod";
import {
  interviewDifficulty,
} from "@/app/generated/prisma/enums";

export const CreateInterviewSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(100),

  jobRole: z
    .string()
    .min(2)
    .max(100),

  company: z
    .string()
    .optional()
    .nullable(),

  description: z
    .string()
    .optional()
    .nullable(),

  difficulty: z.nativeEnum(
    interviewDifficulty
  ),

  duration: z
    .number()
    .min(15)
    .max(120),
});

export type CreateInterviewInput =
  z.infer<typeof CreateInterviewSchema>;