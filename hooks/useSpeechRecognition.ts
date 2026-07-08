"use client";

import { useEffect, useRef, useState } from "react";

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
    };

    recognition.onerror = (e: any) => {
      // 'no-speech' is normal when there is silence
      console.log("Speech Error:", e);
      if (e.error === "no-speech") {
        return;
      }
      // 'aborted' is normal when the stream is stopped programmatically
      if (e.error === "aborted") {
        return;
      }
      console.error(`Speech Recognition Error: ${e.error}`, e.message || "");
    };

    recognition.onend = () => {
        console.log("Speech Ended");
      if (latestTranscriptRef.current.trim()) {
        onSegmentComplete?.(latestTranscriptRef.current.trim());
        setTranscript("");
        latestTranscriptRef.current = "";
      }
      if (enabled && recognitionRef.current === recognition) {
        try {
            console.log("Speech Recognition Started");
          recognition.start();
        } catch (err) {
          console.error("Failed to restart speech recognition:", err);
        }
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