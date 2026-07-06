import ResumeRepository from "@/repositories/resume.repository";
import { deleteFile, uploadPdf } from "@/lib/storage/upload";

class ResumeService {
  async uploadResume(
    userId: string,
    file: {
      buffer: Buffer;
      fileName: string;
      fileSize: number;
      mimeType: string;
    }
  ) {
    // Remove previous resume if you only allow one active resume
    const existing = await ResumeRepository.findByUserId(userId);

    if (existing) {
      await deleteFile(existing.publicId);
      await ResumeRepository.delete(existing.id);
    }

    const uploaded = await uploadPdf(
      file.buffer,
      "evalnyx/resumes"
    );

    return ResumeRepository.create({
      user: {
        connect: {
          id: userId,
        },
      },
      fileName: file.fileName,
      fileUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
    });
  }

  async getResume(userId: string) {
    return ResumeRepository.findByUserId(userId);
  }

  async deleteResume(userId: string) {
    const resume = await ResumeRepository.findByUserId(userId);

    if (!resume) {
      throw new Error("Resume not found");
    }

    await deleteFile(resume.publicId);
    await ResumeRepository.delete(resume.id);

    return true;
  }
}

export default new ResumeService();