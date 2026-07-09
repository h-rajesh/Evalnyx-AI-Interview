import prisma from "@/lib/prisma";

interface SnapshotInput {
  interviewId: string;

  second: number;

  attention: number;

  confidence: number;

  eyeContact: number;

  headDirection: string;

  emotion: string;

  blinkRate: number;

  speaking: boolean;

  voiceVolume: number;
}

class BehaviorSnapshotService {
  async create(data: SnapshotInput) {
    return prisma.behaviorSnapshot.create({
      data,
    });
  }
}

export default new BehaviorSnapshotService();