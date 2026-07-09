import prisma from "@/lib/prisma";
import { IntegrityEventType } from "./integrity-events";

interface CreateIntegrityEvent {
  interviewId: string;

  type: IntegrityEventType;

  severity: number;

  second: number;

  metadata?: Record<string, any>;
}

class IntegrityService {
  async create(event: CreateIntegrityEvent) {
    return prisma.integrityEvent.create({
      data: {
        interviewId: event.interviewId,
        type: event.type,
        severity: event.severity,
        second: event.second,
        metadata: event.metadata,
      },
    });
  }

  async history(interviewId: string) {
    return prisma.integrityEvent.findMany({
      where: {
        interviewId,
      },
      orderBy: {
        second: "asc",
      },
    });
  }

  async delete(interviewId: string) {
    return prisma.integrityEvent.deleteMany({
      where: {
        interviewId,
      },
    });
  }
}

export default new IntegrityService();