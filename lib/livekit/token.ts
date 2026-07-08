import { AccessToken } from "livekit-server-sdk";

export function createParticipantToken(
  roomName: string,
  participantIdentity: string
) {
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: participantIdentity,
    }
  );

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return token.toJwt();
}