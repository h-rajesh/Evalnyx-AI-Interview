import { NextResponse } from "next/server";
import dashboardService from "@/services/dashboard.service";

export async function GET() {
  try {
    const dashboard = await dashboardService.getDashboard();

    return NextResponse.json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard.",
      },
      {
        status: 500,
      }
    );
  }
}