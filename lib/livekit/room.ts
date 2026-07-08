import { roomService } from "./server";

export async function createRoom(roomName: string) {
  try {
    await roomService.createRoom({
      name: roomName,
      emptyTimeout: 60 * 10,
      maxParticipants: 5,
    });
  } catch {
    // Room may already exist
  }
}