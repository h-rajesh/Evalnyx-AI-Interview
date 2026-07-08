import { RoomServiceClient } from "livekit-server-sdk";

const livekitUrl = process.env.LIVEKIT_URL || "";
const httpUrl = livekitUrl.startsWith("wss://")
  ? livekitUrl.replace(/^wss:\/\//, "https://")
  : livekitUrl.startsWith("ws://")
  ? livekitUrl.replace(/^ws:\/\//, "http://")
  : livekitUrl;

export const roomService = new RoomServiceClient(
  httpUrl,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);