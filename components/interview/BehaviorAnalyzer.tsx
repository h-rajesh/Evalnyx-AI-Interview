"use client";

import { useEffect, useState } from "react";
import { getFaceLandmarker } from "@/lib/vision/face-landmarker";
import { Badge } from "@/components/ui/badge";
import behaviorEngine from "@/services/behavior/behavior-engine.service";
import { useRef } from "react";
import behaviorIntegrityService from "@/services/integrity/behavior-integrity.service";
import voiceEngine from "@/services/voice/voice-engine.service";
import { useBehaviorStore } from "@/stores/behavior-store";
import { useVoiceStore } from "@/stores/voice-store";
import behaviorScoreService from "@/services/behavior/behavior-score.service";
import { useBehaviorScoreStore } from "@/stores/behavior-score-store";
import realtimeAnalytics from "@/services/analytics/realtime-analytics.service";

interface BehaviorAnalyzerProps {
  interviewId: string;
}

export default function BehaviorAnalyzer({ interviewId }: BehaviorAnalyzerProps) {
  const [facePresent, setFacePresent] = useState(false);
  const [behavior, setBehavior] = useState<any>(null);

  useEffect(() => {
    let animationFrame: number;
    let lastDetection = 0;

    async function start() {
      const detector = await getFaceLandmarker();

      function detect() {
        const video = (
          document.getElementById("local-video") ||
          document.querySelector("video[data-lk-local-participant='true']") ||
          document.querySelector("video")
        ) as HTMLVideoElement | null;

        if (
          video &&
          video.readyState >= 2 &&
          video.videoWidth > 0
        ) {
          const now = performance.now();

          if (now - lastDetection > 100) {
            lastDetection = now;

            const result = detector.detectForVideo(
              video,
              now
            );

            const faces = result.faceLandmarks.length;

            const state = behaviorEngine.update({
              faceCount: faces,
              landmarks: result.faceLandmarks[0] ?? null,
              matrix:
                result.facialTransformationMatrixes?.[0]?.data ??
                null,
              blendshapes:
                result.faceBlendshapes ?? null,
              timestamp: now,
            });

            useBehaviorStore.getState().setBehavior(state);
            useVoiceStore.getState().setVoice(voiceEngine.getState());

            const scores = behaviorScoreService.calculate(
              state,
              voiceEngine.getState()
            );
            useBehaviorScoreStore.getState().setScores(scores);

            realtimeAnalytics.updateBehavior({
              attention: scores.attention,
              eyeContact: state.eyeContact,
              confidence: scores.confidence,
              emotion: state.emotion ?? "NEUTRAL",
              blinkRate: state.blinkRate,
              headDirection: state.headDirection ?? "CENTER",
            });

            const events = behaviorIntegrityService.analyze(state);

            setFacePresent(state.hasFace);
            setBehavior(state);

            console.clear();
            console.table(state);
          }
        }

        animationFrame = requestAnimationFrame(detect);
      }

      detect();
    }

    start();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1.5">
      <Badge
        variant={facePresent ? "secondary" : "destructive"}
        className="gap-1.5 rounded-full text-xs font-semibold backdrop-blur"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${facePresent ? "bg-emerald-500" : "bg-white animate-pulse"
            }`}
        />
        {facePresent ? "Face Detected" : "No Face"}
      </Badge>

      {behavior && facePresent && (
        <Badge
          variant="outline"
          className="gap-1.5 rounded-full bg-background/80 text-xs font-semibold backdrop-blur border-border/60 shadow-sm"
        >
          👀 {behavior.eyeContact}% • {behavior.lookingDirection}
        </Badge>
      )}
    </div>
  );
}