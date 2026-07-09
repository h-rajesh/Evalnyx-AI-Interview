import { NextRequest, NextResponse } from "next/server";

import behaviorSnapshotService from "@/services/behavior/behavior-snapshot.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      interviewId,
      second,
      attention,
      confidence,
      eyeContact,
      headDirection,
      emotion,
      blinkRate,
      speaking,
      voiceVolume,
    } = body;

    if (!interviewId) {
      return NextResponse.json(
        {
          success: false,
          message: "Interview ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    await behaviorSnapshotService.create({
      interviewId,
      second,
      attention,
      confidence,
      eyeContact,
      headDirection,
      emotion,
      blinkRate,
      speaking,
      voiceVolume,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Behavior Snapshot Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save behavior snapshot.",
      },
      {
        status: 500,
      }
    );
  }
}