import crypto from "crypto";

import prisma from "@/lib/prisma";
import { VerificationTokenType } from "@/app/generated/prisma/enums";

const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour

export async function generateVerificationToken(
  userId: string,
  type: VerificationTokenType
) {
  // Remove existing tokens of the same type
  await prisma.verificationToken.deleteMany({
     where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(
    Date.now() +
      (type === VerificationTokenType.EMAIL_VERIFICATION
        ? EMAIL_VERIFICATION_EXPIRY
        : PASSWORD_RESET_EXPIRY)
  );

  const verificationToken = await prisma.verificationToken.create({
    data: {
      token,
      type,
      userId,
      expiresAt,
    },
  });

  return verificationToken;
}

export async function validateToken(
  token: string,
  type: VerificationTokenType
) {
  // Lazy cleanup
  await prisma.verificationToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return prisma.verificationToken.findFirst({
    where: {
      token,
      type,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });
}

export async function deleteToken(token: string) {
  await prisma.verificationToken.deleteMany({
    where: {
      token,
    },
  });
}