import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendVerificationEmail(
      "YOUR_EMAIL@gmail.com",
      "test-token-123"
    );

    return NextResponse.json({
      success: true,
      message: "Email sent successfully.",
    });
  } catch (error) {
  console.error("Email Error:", error);

  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    },
    { status: 500 }
  );
}
}