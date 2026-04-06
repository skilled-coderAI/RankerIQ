"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const STT_LANG_MAP: Record<string, string> = {
  hinglish: "hi-IN",
  hindi: "hi-IN",
  english: "en-IN",
  tamil: "ta-IN",
  telugu: "te-IN",
  kannada: "kn-IN",
  marathi: "mr-IN",
  bengali: "bn-IN",
  gujarati: "gu-IN",
};

export type MicPermission = "unknown" | "granted" | "denied" | "unavailable";

export function useVoice(language: string = "hinglish") {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [sttAvailable, setSttAvailable] = useState(false);
  const [micPermission, setMicPermission] = useState<MicPermission>("unknown");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const hasSpeechRecognition =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setSttAvailable(hasSpeechRecognition);

    if (!hasSpeechRecognition) {
      setMicPermission("unavailable");
      return;
    }

    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          setMicPermission(status.state === "granted" ? "granted" : status.state === "denied" ? "denied" : "unknown");
          status.onchange = () => {
            setMicPermission(status.state === "granted" ? "granted" : status.state === "denied" ? "denied" : "unknown");
          };
        })
        .catch(() => {});
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSpeaking(false);
    setSpeakingMessageIndex(null);
  }, []);

  const speak = useCallback(
    async (text: string, messageIndex?: number) => {
      stopSpeaking();

      const cleanText = text
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "")
        .replace(/\*\*/g, "")
        .replace(/\n+/g, " ")
        .trim();

      if (!cleanText) return;

      setIsSpeaking(true);
      if (messageIndex !== undefined) setSpeakingMessageIndex(messageIndex);

      try {
        abortControllerRef.current = new AbortController();

        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleanText }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          let errMsg = "TTS failed";
          try {
            const err = JSON.parse(text);
            errMsg = err.error ?? errMsg;
          } catch {
            if (text) errMsg = text;
          }
          throw new Error(errMsg);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          setIsSpeaking(false);
          setSpeakingMessageIndex(null);
          audioRef.current = null;
        };

        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setIsSpeaking(false);
          setSpeakingMessageIndex(null);
          audioRef.current = null;
        };

        await audio.play();
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
        setTtsAvailable(false);
        console.error("TTS error:", error);
      }
    },
    [stopSpeaking]
  );

  const startListening = useCallback(
    (onResult: (transcript: string) => void) => {
      if (!sttAvailable) return;
      if (micPermission === "denied") return;

      stopSpeaking();

      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = STT_LANG_MAP[language] || "hi-IN";

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const last = event.results[event.results.length - 1];
        if (last.isFinal) {
          onResult(last[0].transcript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setMicPermission("denied");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [sttAvailable, micPermission, stopSpeaking, language]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

  return {
    isSpeaking,
    isListening,
    speakingMessageIndex,
    autoSpeak,
    ttsAvailable,
    sttAvailable,
    micPermission,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    toggleAutoSpeak,
  };
}
