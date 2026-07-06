import { z } from "zod";

export const ResumeUploadSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().max(5 * 1024 * 1024), // 5MB
  mimeType: z.literal("application/pdf"),
});