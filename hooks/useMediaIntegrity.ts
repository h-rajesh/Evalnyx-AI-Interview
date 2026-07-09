import { useEffect } from "react";
import { IntegrityEventType } from "@/services/integrity/integrity-events";
import { useRoomContext, useTracks } from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";

interface Props {
  cameraOn: boolean;
  micOn: boolean;
  sendEvent: (
    type: IntegrityEventType,
    severity: number,
    metadata?: Record<string, any>
  ) => void;
}

export function useMediaIntegrity({
  cameraOn,
  micOn,
  sendEvent,
}: Props) {
  const room = useRoomContext();
  const localVideoTracks = useTracks([Track.Source.Camera]);
  const localAudioTracks = useTracks([Track.Source.Microphone]);

  // Sync state changes from parent controls
  useEffect(() => {
    if (!cameraOn) {
      sendEvent(
        IntegrityEventType.CAMERA_OFF,
        10,
        { reason: "User disabled camera via controls" }
      );
    }
  }, [cameraOn, sendEvent]);

  useEffect(() => {
    if (!micOn) {
      sendEvent(
        IntegrityEventType.MIC_MUTED,
        6,
        { reason: "User muted microphone via controls" }
      );
    }
  }, [micOn, sendEvent]);

  // Monitor physical track ends (hardware unplugged, driver crash)
  useEffect(() => {
    const videoTrack = localVideoTracks[0]?.publication?.track?.mediaStreamTrack;
    if (!videoTrack) return;

    const handleEnded = () => {
      sendEvent(
        IntegrityEventType.CAMERA_OFF,
        10,
        { reason: "Video track ended physically" }
      );
    };

    videoTrack.addEventListener("ended", handleEnded);
    return () => {
      videoTrack.removeEventListener("ended", handleEnded);
    };
  }, [localVideoTracks, sendEvent]);

  useEffect(() => {
    const audioTrack = localAudioTracks[0]?.publication?.track?.mediaStreamTrack;
    if (!audioTrack) return;

    const handleEnded = () => {
      sendEvent(
        IntegrityEventType.MIC_MUTED,
        6,
        { reason: "Audio track ended physically" }
      );
    };

    audioTrack.addEventListener("ended", handleEnded);
    return () => {
      audioTrack.removeEventListener("ended", handleEnded);
    };
  }, [localAudioTracks, sendEvent]);

  // Monitor LiveKit track publication events
  useEffect(() => {
    if (!room) return;

    const handleTrackUnpublished = (publication: any) => {
      const isVideo = publication.track?.kind === "video";
      const isAudio = publication.track?.kind === "audio";

      if (isVideo) {
        sendEvent(
          IntegrityEventType.CAMERA_OFF,
          10,
          { reason: "Local video track unpublished from session" }
        );
      } else if (isAudio) {
        sendEvent(
          IntegrityEventType.MIC_MUTED,
          6,
          { reason: "Local audio track unpublished from session" }
        );
      }
    };

    room.on(RoomEvent.LocalTrackUnpublished, handleTrackUnpublished);
    return () => {
      room.off(RoomEvent.LocalTrackUnpublished, handleTrackUnpublished);
    };
  }, [room, sendEvent]);

  // Monitor system permission changes (Permissions API)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) return;

    let cameraStatus: PermissionStatus | null = null;
    let micStatus: PermissionStatus | null = null;

    const handleCameraChange = () => {
      if (cameraStatus && cameraStatus.state === "denied") {
        sendEvent(
          IntegrityEventType.CAMERA_OFF,
          10,
          { reason: "System camera permission revoked" }
        );
      }
    };

    const handleMicChange = () => {
      if (micStatus && micStatus.state === "denied") {
        sendEvent(
          IntegrityEventType.MIC_MUTED,
          6,
          { reason: "System microphone permission revoked" }
        );
      }
    };

    navigator.permissions.query({ name: "camera" as any })
      .then((status) => {
        cameraStatus = status;
        status.addEventListener("change", handleCameraChange);
      })
      .catch((err) => {
        console.warn("Camera permission query not supported:", err);
      });

    navigator.permissions.query({ name: "microphone" as any })
      .then((status) => {
        micStatus = status;
        status.addEventListener("change", handleMicChange);
      })
      .catch((err) => {
        console.warn("Microphone permission query not supported:", err);
      });

    return () => {
      if (cameraStatus) {
        cameraStatus.removeEventListener("change", handleCameraChange);
      }
      if (micStatus) {
        micStatus.removeEventListener("change", handleMicChange);
      }
    };
  }, [sendEvent]);
}