"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";

interface InterviewRoomProps {
  token: string;
  serverUrl: string;
}

export default function InterviewRoom({
  token,
  serverUrl,
}: InterviewRoomProps) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={true}
      audio={true}
      data-lk-theme="default"
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}