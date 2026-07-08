import crypto from "crypto";

import { createRoom } from "@/lib/livekit/room";
import { createParticipantToken } from "@/lib/livekit/token";

import InterviewSessionRepository from "@/repositories/interview-session.repository";

class LiveKitService {
  async createInterviewSession(
    interviewId: string,
    userId: string
  ) {
    const roomName = `interview-${crypto.randomUUID()}`;

    const participantIdentity = `user-${userId}`;

    await createRoom(roomName);

    const session =
      await InterviewSessionRepository.create({
        interview: {
          connect: {
            id: interviewId,
          },
        },

        roomName,

        participantIdentity,
      });

    const token = await createParticipantToken(
      roomName,
      participantIdentity
    );

    return {
      session,
      roomName,
      token,
      url: process.env.LIVEKIT_URL,
    };
  }
}

export default new LiveKitService();