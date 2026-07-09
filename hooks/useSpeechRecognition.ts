"use client";

import { useEffect, useRef, useState } from "react";
import voiceEngine from "@/services/voice/voice-engine.service";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition(enabled: boolean, onSegmentComplete?: (text: string) => void) {
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef("");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      console.log("Speech Result:", event);
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
      latestTranscriptRef.current = text;
      voiceEngine.updateTranscript(
        text,
        event.results[event.results.length - 1].isFinal
      );
    };

    let hasError = false;
    let restartTimeout: NodeJS.Timeout | null = null;

    recognition.onerror = (e: any) => {
      // 'no-speech' is normal when there is silence
      console.log("Speech Error:", e);
      if (e.error === "no-speech" || e.error === "aborted") {
        return;
      }
      hasError = true;
      if (e.error === "network") {
        console.warn(`Speech Recognition Warning (Network): ${e.message || "Failed to reach speech recognition server"}`);
      } else {
        console.error(`Speech Recognition Error: ${e.error}`, e.message || "");
      }
    };

    recognition.onend = () => {
        console.log("Speech Ended");
      if (latestTranscriptRef.current.trim()) {
        onSegmentComplete?.(latestTranscriptRef.current.trim());
        setTranscript("");
        latestTranscriptRef.current = "";
      }
      if (enabled && recognitionRef.current === recognition) {
        const delay = hasError ? 5000 : 0;
        hasError = false; // Reset error flag
        
        restartTimeout = setTimeout(() => {
          try {
            if (enabled && recognitionRef.current === recognition) {
              console.log("Speech Recognition Started");
              recognition.start();
            }
          } catch (err) {
            console.error("Failed to restart speech recognition:", err);
          }
        }, delay);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }

    return () => {
      if (latestTranscriptRef.current.trim()) {
        onSegmentComplete?.(latestTranscriptRef.current.trim());
        latestTranscriptRef.current = "";
      }

      // Clear listeners to prevent race conditions and aborted callbacks
      recognition.onend = null;
      recognition.onerror = null;

      if (restartTimeout) {
        clearTimeout(restartTimeout);
      }

      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      try {
        recognition.stop();
      } catch (err) {
        // Ignore if already stopped
      }
    };
  }, [enabled]);

  return transcript;
}