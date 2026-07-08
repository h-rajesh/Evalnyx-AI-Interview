"use client";

import { useEffect, useRef } from "react";

export default function CameraPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error(err);
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