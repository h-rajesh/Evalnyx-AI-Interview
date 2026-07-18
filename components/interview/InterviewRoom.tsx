"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import InterviewLayout from "./InterviewLayout";

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
  connect
  video
  audio
  data-lk-theme="default"
  style={{
    height: "100vh",
    width: "100%",
  }}
>
    <InterviewLayout>

        {/* Temporary */}

        <VideoConference />

    </InterviewLayout>

    <RoomAudioRenderer />

</LiveKitRoom>
  );
}