import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // STARTTLS (Port 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const FROM_EMAIL = process.env.EMAIL_FROM!;

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verificationLink = `${APP_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your Evalnyx account",
    text: `
Welcome to Evalnyx!

Please verify your email by clicking the link below:

${verificationLink}

This verification link expires in 24 hours.

If you didn't create this account, you can safely ignore this email.
`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  const resetLink = `${APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your Evalnyx password",
    text: `
We received a request to reset your password.

Reset it using the link below:

${resetLink}

This link expires in 1 hour.

If you didn't request this, simply ignore this email.
`,
  });
}