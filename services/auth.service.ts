import bcrypt from "bcryptjs";

import userRepository from "@/repositories/user.repository";
import verificationTokenRepository from "@/repositories/verification-token.repository";
import { generateVerificationToken, validateToken } from "@/lib/token";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { VerificationTokenType } from "@/app/generated/prisma/enums";

// ---------------------------------------------------------------------------
// Result type — service methods never throw for expected errors.
// Routes read `ok` and branch accordingly.
// ---------------------------------------------------------------------------
export type ServiceResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string; status: number };

// ---------------------------------------------------------------------------
// register
// ---------------------------------------------------------------------------
interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

async function register(input: RegisterInput): Promise<ServiceResult> {
  const { name, password } = input;
  const email = input.email.toLowerCase().trim();

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    if (existingUser.emailVerified) {
      return {
        ok: false,
        error: "An account with this email already exists. Please sign in.",
        status: 409,
      };
    }

    // Unverified account exists — resend the verification email so the user
    // can complete registration without needing to re-register.
    try {
      const verificationToken = await generateVerificationToken(
        existingUser.id,
        VerificationTokenType.EMAIL_VERIFICATION
      );
      await sendVerificationEmail(existingUser.email, verificationToken.token);
    } catch {
      return {
        ok: false,
        error:
          "Your account exists but we could not send a verification email. Please try again shortly.",
        status: 500,
      };
    }

    return { ok: true };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
  });

  const verificationToken = await generateVerificationToken(
    user.id,
    VerificationTokenType.EMAIL_VERIFICATION
  );

  try {
    await sendVerificationEmail(user.email, verificationToken.token);
  } catch {
    // User is created but email delivery failed.
    // They can use the resend option on the verify page.
    return { ok: true, data: { emailFailed: true } };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// verifyEmail
// ---------------------------------------------------------------------------
async function verifyEmail(token: string): Promise<ServiceResult> {
  const verificationToken = await validateToken(
    token,
    VerificationTokenType.EMAIL_VERIFICATION
  );

  if (!verificationToken) {
    return { ok: false, error: "invalid-token", status: 400 };
  }

  await userRepository.verifyEmail(verificationToken.userId);
  await verificationTokenRepository.delete(token);

  return { ok: true };
}

// ---------------------------------------------------------------------------
// resendVerificationByEmail (unauthenticated — keyed by email)
// ---------------------------------------------------------------------------
async function resendVerificationByEmail(
  email: string
): Promise<ServiceResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await userRepository.findByEmail(normalizedEmail);

  // Return ok even when not found — avoids leaking account existence
  if (!user) return { ok: true };

  if (user.emailVerified) {
    return {
      ok: false,
      error: "This email is already verified. Please sign in.",
      status: 400,
    };
  }

  const verificationToken = await generateVerificationToken(
    user.id,
    VerificationTokenType.EMAIL_VERIFICATION
  );

  await sendVerificationEmail(user.email, verificationToken.token);

  return { ok: true };
}

// ---------------------------------------------------------------------------
// resendVerificationById (authenticated — keyed by user ID)
// ---------------------------------------------------------------------------
async function resendVerificationById(userId: string): Promise<ServiceResult> {
  const user = await userRepository.findById(userId);

  if (!user) {
    return { ok: false, error: "User not found.", status: 404 };
  }

  if (user.emailVerified) {
    return { ok: false, error: "Email already verified.", status: 400 };
  }

  const token = await generateVerificationToken(
    user.id,
    VerificationTokenType.EMAIL_VERIFICATION
  );

  await sendVerificationEmail(user.email, token.token);

  return { ok: true };
}

// ---------------------------------------------------------------------------
// forgotPassword
// ---------------------------------------------------------------------------
async function forgotPassword(email: string): Promise<ServiceResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await userRepository.findByEmail(normalizedEmail);

  // Always return ok — never reveal whether the account exists
  if (!user) return { ok: true };

  const token = await generateVerificationToken(
    user.id,
    VerificationTokenType.PASSWORD_RESET
  );

  await sendPasswordResetEmail(user.email, token.token);

  return { ok: true };
}

// ---------------------------------------------------------------------------
// resetPassword
// ---------------------------------------------------------------------------
async function resetPassword(
  token: string,
  password: string
): Promise<ServiceResult> {
  const verificationToken = await validateToken(
    token,
    VerificationTokenType.PASSWORD_RESET
  );

  if (!verificationToken) {
    return { ok: false, error: "Invalid or expired token.", status: 400 };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userRepository.resetPasswordTransaction(
    verificationToken.userId,
    verificationToken.id,
    hashedPassword
  );

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Export as named service object
// ---------------------------------------------------------------------------
const authService = {
  register,
  verifyEmail,
  resendVerificationByEmail,
  resendVerificationById,
  forgotPassword,
  resetPassword,
};

export default authService;
