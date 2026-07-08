"use client";

import { VideoOff } from "lucide-react";
import { Track } from "livekit-client";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";

interface Props {
  token: string;
  serverUrl: string;
  id?: string;
  micOn?: boolean;
  cameraOn?: boolean;
  screenShareOn?: boolean;
}

function LocalVideoView({ cameraOn }: { cameraOn: boolean }) {
  const tracks = useTracks([Track.Source.Camera]);
  const cameraTrack = tracks[0];

  if (!cameraOn || !cameraTrack) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-muted/20 gap-2">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <VideoOff className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Camera is turned off</span>
      </div>
    );
  }

  return (
    <VideoTrack
      trackRef={cameraTrack}
      className="h-full w-full object-cover"
    />
  );
}

export default function LiveInterview({
  token,
  serverUrl,
  id,
  micOn = true,
  cameraOn = true,
  screenShareOn = false,
}: Props) {
  console.log("===== LiveInterview =====");
  console.log("Token:", token);
  console.log("Server URL:", serverUrl);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      video={cameraOn}
      audio={micOn}
      screen={screenShareOn}
      onConnected={() => {
        console.log("✅ Connected to LiveKit");
      }}
      onDisconnected={() => {
        console.log("❌ Disconnected");
      }}
      onError={(err) => {
        console.error("❌ LiveKit Error:", err);
      }}
      onMediaDeviceFailure={(kind, error) => {
        console.error(`❌ ${kind} failed:`, error);
      }}
      data-lk-theme="default"
      style={{ height: "100%", width: "100%" }}
    >
      <LocalVideoView cameraOn={cameraOn} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}