"use client";

import { VideoOff } from "lucide-react";
import { Room, RoomEvent, Track, setLogLevel } from "livekit-client";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useTracks,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useMemo, useRef, useState } from "react";
import BehaviorAnalyzer from "./BehaviorAnalyzer";
import IntegrityMonitor from "./IntegrityMonitor";
import voiceEngine from "@/services/voice/voice-engine.service";
import snapshotService from "@/services/snapshot.service";
import interviewSessionService from "@/services/interview-session.service";
import { useInterviewStore } from "@/stores/interview-store";
import { useVoiceStore } from "@/stores/voice-store";

// Silence noisy LiveKit client SDK internal logs
try {
  setLogLevel("silent");
} catch (err) {
  console.warn("Failed to set LiveKit log level:", err);
}

interface Props {
  token: string;
  serverUrl: string;
  id?: string;
  micOn?: boolean;
  cameraOn?: boolean;
  screenShareOn?: boolean;
  onViolationLimitReached?: () => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
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
      id="local-video"
    />
  );
}

function MediaController({
  micOn,
  cameraOn,
}: {
  micOn: boolean;
  cameraOn: boolean;
}) {
  const room = useRoomContext();

  useEffect(() => {
    async function updateCamera() {
      try {
        await room.localParticipant.setCameraEnabled(cameraOn);

        console.log(
          "Camera:",
          cameraOn ? "Enabled" : "Disabled"
        );
      } catch (err) {
        console.error(err);
      }
    }

    updateCamera();
  }, [cameraOn, room]);

  useEffect(() => {
    async function updateMic() {
      try {
        await room.localParticipant.setMicrophoneEnabled(micOn);

        console.log(
          "Microphone:",
          micOn ? "Enabled" : "Disabled"
        );
      } catch (err) {
        console.error(err);
      }
    }

    updateMic();
  }, [micOn, room]);

  return null;
}

export default function LiveInterview({
  token,
  serverUrl,
  id,
  micOn = true,
  cameraOn = true,
  screenShareOn = false,
  onViolationLimitReached,
  onFullscreenChange,
}: Props) {
  console.log("===== LiveInterview =====");
  console.log("Token:", token);
  console.log("Server URL:", serverUrl);
  const room = useMemo(() => new Room(), []);
  const [connectError, setConnectError] = useState<Error | null>(null);
  const hasStartedInterview = useRef(false);
  const localTracksRef = useRef<any[]>([]);

  useEffect(() => {
    const handleLocalTrackPublished = (pub: any) => {
      if (pub.track) {
        console.log("Local track published, adding to ref:", pub.track.kind);
        localTracksRef.current.push(pub.track);
      }
    };
    room.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
    return () => {
      room.off(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
    };
  }, [room]);

  useEffect(() => {
    return () => {
      try {
        interviewSessionService.stop();

        console.log("LiveInterview unmounting, disconnecting room...");

        // Explicitly stop all local tracks to release camera/mic access
        if (room.localParticipant) {
          room.localParticipant.videoTrackPublications.forEach((pub: any) => {
            if (pub.track) {
              console.log("Stopping local video track...");
              pub.track.stop();
            }
          });
          room.localParticipant.audioTrackPublications.forEach((pub: any) => {
            if (pub.track) {
              console.log("Stopping local audio track...");
              pub.track.stop();
            }
          });
        }

        // Stop all tracks in our local ref to release camera/mic access
        localTracksRef.current.forEach((track) => {
          try {
            console.log("Stopping local track from ref:", track.kind);
            track.stop();
          } catch (err) {
            console.warn("Failed to stop track from ref:", err);
          }
        });

        room.disconnect();
      } catch (err) {
        console.warn(
          "Failed to disconnect LiveKit room gracefully:",
          err
        );
      }
    };
  }, [room]);

  useEffect(() => {
    const handleActiveSpeakersChanged = (speakers: any[]) => {
      const me = room.localParticipant;
      if (!me) return;
      const speaking = speakers.some((s) => s.identity === me.identity);
      const state = voiceEngine.updateSpeaking(speaking, me.audioLevel);
      useVoiceStore.getState().setVoice(state);
    };

    room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakersChanged);
    return () => {
      room.off(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakersChanged);
    };
  }, [room]);

  useEffect(() => {
    const debugInterval = setInterval(() => {
      console.table(voiceEngine.getState());
    }, 1000);

    return () => {
      clearInterval(debugInterval);
    };
  }, []);

  useEffect(() => {
    if (id) {
      snapshotService.start(id);
    }

    return () => {
      snapshotService.stop();
    };
  }, [id]);

  if (connectError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-muted/20 gap-2 p-4 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <VideoOff className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold text-destructive">Connection Failed</span>
        <span className="text-[10px] text-muted-foreground max-w-[200px]">
          Could not connect to the live session server. Please check your network connection.
        </span>
      </div>
    );
  }

  return (
    <LiveKitRoom
      room={room}
      token={token}
      serverUrl={serverUrl}
      connect
      video={cameraOn}
      audio={micOn}
      screen={screenShareOn}
      onConnected={async () => {
  console.log("✅ Connected to LiveKit");

  setConnectError(null);

  if (!id) return;

  if (hasStartedInterview.current) return;

  hasStartedInterview.current = true;

  try {
    await interviewSessionService.start(id);
  } catch (error) {
    console.error(
      "Failed to start interview:",
      error
    );
  }
}}
      onDisconnected={() => {
        console.log("❌ Disconnected");
      }}
      onError={(err) => {
        console.error("❌ LiveKit Error:", err);
        setConnectError(err);
      }}
      onMediaDeviceFailure={(failure, deviceKind) => {
        console.error(`❌ Media device failure: ${deviceKind} failed with error ${failure}`);
        if (deviceKind === "audioinput" && failure === "PermissionDenied") {
          useInterviewStore.getState().setMicPermissionDenied(true);
        }
      }}
      data-lk-theme="default"
      style={{ height: "100%", width: "100%" }}
    >
      <MediaController micOn={micOn} cameraOn={cameraOn} />
      <LocalVideoView cameraOn={cameraOn} />
      <RoomAudioRenderer />
      <BehaviorAnalyzer interviewId={id || ""} />
      <IntegrityMonitor
        interviewId={id || ""}
        cameraOn={cameraOn}
        micOn={micOn}
        onViolationLimitReached={onViolationLimitReached}
        onFullscreenChange={onFullscreenChange}
      />
    </LiveKitRoom>
  );
}