import prisma from "@/lib/prisma";

export interface ChartPoint {
  x: number;
  y: number;
}

export interface AnalyticsCharts {
  attention: ChartPoint[];
  confidence: ChartPoint[];
  eyeContact: ChartPoint[];
  blinkRate: ChartPoint[];
  voiceVolume: ChartPoint[];
}

class ChartEngine {
  async generate(
    interviewId: string
  ): Promise<AnalyticsCharts> {
    const snapshots =
      await prisma.behaviorSnapshot.findMany({
        where: {
          interviewId,
        },
        orderBy: {
          second: "asc",
        },
      });

    return {
      attention:
        snapshots.map((s) => ({
          x: s.second,
          y: s.attention,
        })),

      confidence:
        snapshots.map((s) => ({
          x: s.second,
          y: s.confidence,
        })),

      eyeContact:
        snapshots.map((s) => ({
          x: s.second,
          y: s.eyeContact,
        })),

      blinkRate:
        snapshots.map((s) => ({
          x: s.second,
          y: s.blinkRate,
        })),

      voiceVolume:
        snapshots.map((s) => ({
          x: s.second,
          y: s.voiceVolume,
        })),
    };
  }
}

export default new ChartEngine();