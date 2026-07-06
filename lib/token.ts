import crypto from "crypto";
import { VerificationTokenType } from "@/app/generated/prisma/enums";
import verificationTokenRepository from "@/repositories/verification-token.repository";

const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000;

export async function generateVerificationToken(
  userId: string,
  type: VerificationTokenType
) {
  await verificationTokenRepository.deleteExpired();

  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(
    Date.now() +
      (type === VerificationTokenType.EMAIL_VERIFICATION
        ? EMAIL_VERIFICATION_EXPIRY
        : PASSWORD_RESET_EXPIRY)
  );

  return verificationTokenRepository.create({
    token,
    userId,
    type,
    expiresAt,
  });
}

export async function validateToken(
  token: string,
  type: VerificationTokenType
) {
  await verificationTokenRepository.deleteExpired();

  return verificationTokenRepository.find(token, type);
}

export async function deleteToken(token: string) {
  return verificationTokenRepository.delete(token);
}