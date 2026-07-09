"use client";

import { useEffect, useRef } from "react";
import { IntegrityEventType } from "@/services/integrity/integrity-events";
import { useMediaIntegrity } from "@/hooks/useMediaIntegrity";

interface Props {
  interviewId: string;
  cameraOn: boolean;
  micOn: boolean;
  maxFullscreenWarnings?: number;
  onViolationLimitReached?: () => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export default function IntegrityMonitor({
  interviewId,
  cameraOn,
  micOn,
  maxFullscreenWarnings = 3,
  onViolationLimitReached,
  onFullscreenChange,
}: Props) {
  const startTime = useRef(Date.now());
  const fullscreenWarnings = useRef(0);
  const lastEvent = useRef<{
    type: IntegrityEventType;
    second: number;
  } | null>(null);

  function elapsedSeconds() {
    return Math.floor(
      (Date.now() - startTime.current) / 1000
    );
  }

  async function enterFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
    }
  }

  async function sendEvent(
    type: IntegrityEventType,
    severity: number,
    metadata?: Record<string, any>
  ) {
    const second = elapsedSeconds();

    if (
      lastEvent.current &&
      lastEvent.current.type === type &&
      second - lastEvent.current.second < 2
    ) {
      return;
    }

    lastEvent.current = {
      type,
      second,
    };

    try {
      await fetch("/api/interview/integrity", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          interviewId,
          type,
          severity,
          second,
          metadata,
        }),
      });

      console.log("🚨 Integrity Event:", type);
    } catch (err) {
      console.error(err);
    }
  }

  useMediaIntegrity({
    cameraOn,
    micOn,
    sendEvent,
  });

  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        sendEvent(
          IntegrityEventType.TAB_SWITCH,
          8
        );
      }
    }

    function handleBlur() {
      if (document.hidden) return;
      sendEvent(
        IntegrityEventType.WINDOW_BLUR,
        5
      );
    }

    function handleFullscreen() {
      const isFullscreen = !!document.fullscreenElement;
      if (onFullscreenChange) {
        onFullscreenChange(isFullscreen);
      }

      if (!isFullscreen) {
        fullscreenWarnings.current++;

        if (fullscreenWarnings.current >= maxFullscreenWarnings) {
          sendEvent(
            IntegrityEventType.FULLSCREEN_EXIT,
            10,
            {
              interviewEnded: true,
              warnings: fullscreenWarnings.current,
            }
          );

          alert(
            "Interview terminated due to repeated fullscreen violations."
          );

          if (onViolationLimitReached) {
            onViolationLimitReached();
          }
        } else {
          sendEvent(
            IntegrityEventType.FULLSCREEN_EXIT,
            9,
            {
              warnings: fullscreenWarnings.current,
            }
          );

          alert(
            `Interview should remain in fullscreen.\n\nWarning ${fullscreenWarnings.current}/${maxFullscreenWarnings}`
          );

          setTimeout(() => {
            enterFullscreen();
          }, 1000);
        }
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );
    };
  }, [maxFullscreenWarnings, onViolationLimitReached, onFullscreenChange]);

  return null;
}