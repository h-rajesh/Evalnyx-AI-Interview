import { NextRequest, NextResponse } from "next/server";
import UserService from "@/services/user.service";
import { requireUser } from "@/lib/auth-user";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const result = await UserService.uploadAvatar(
      user.id,
      buffer
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
      },
      { status: 500 }
    );
  }
}