import UserRepository from "@/repositories/user.repository";
import { UpdateProfileSchema } from "@/lib/validations/profile";
import { z } from "zod";
import { uploadImage } from "@/lib/storage/upload";

type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

class UserService {
  async getProfile(userId: string) {
    const profile = await UserRepository.getProfile(userId);

    if (!profile) {
      throw new Error("User not found.");
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ) {
    const profileCompleted = this.isProfileComplete(data);

    return UserRepository.updateProfile(userId, {
      ...data,
      profileCompleted,
    });
  }
  async uploadAvatar(
  userId: string,
  fileBuffer: Buffer
) {
  const uploaded = await uploadImage(
    fileBuffer,
    "evalnyx/avatars"
  );

  return UserRepository.updateAvatar(
    userId,
    uploaded.secure_url
  );
}

  private isProfileComplete(data: UpdateProfileInput) {
    return Boolean(
      data.name &&
        data.headline &&
        data.bio &&
        data.jobRole &&
        data.experienceLevel &&
        data.yearsExperience !== undefined
    );
  }
}

export default new UserService();