import { NextRequest, NextResponse } from "next/server";
import integrityService from "@/services/integrity/integrity.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    await integrityService.create(body);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}