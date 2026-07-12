import { NextResponse } from "next/server";
import interviewService from "@/services/interview.service";

export async function GET() {
  try {
    const interviews = await interviewService.getHistory();

    return NextResponse.json({
      success: true,
      interviews,
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