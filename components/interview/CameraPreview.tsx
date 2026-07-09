"use client";

import voiceActivityService from "@/services/voice-activity.service";
import { useEffect, useRef } from "react";

export default function CameraPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function startCamera() {
      let stream: MediaStream | null = null;
      try {
        // Try getting both video and audio
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (err) {
        console.warn("Could not capture audio/video together, falling back to video only:", err);
        try {
          // Fallback to video only
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (videoErr) {
          console.error("Failed to capture video preview stream:", videoErr);
        }
      }

      if (stream) {
        try {
          await voiceActivityService.initialize(stream);
        } catch (initErr) {
          console.error("Failed to initialize voiceActivityService:", initErr);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    }

    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as
        | MediaStream
        | undefined;

      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="h-full w-full object-cover"
    />
  );
}