"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVoice } from "@/hooks/useVoice";
import { useAuth } from "@/context/AuthContext";
import ChatMessage from "@/components/ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUBJECTS = [
  { id: "mathematics", label: "Mathematics", icon: "🔢" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "english", label: "English", icon: "📖" },
];

const GRADES = [5, 6, 7, 8, 9, 10, 11, 12];

const LANGUAGES = [
  { id: "hinglish", label: "Hinglish" },
  { id: "hindi", label: "Hindi" },
  { id: "english", label: "English" },
  { id: "tamil", label: "Tamil" },
  { id: "telugu", label: "Telugu" },
  { id: "kannada", label: "Kannada" },
  { id: "marathi", label: "Marathi" },
  { id: "bengali", label: "Bengali" },
  { id: "gujarati", label: "Gujarati" },
];

const QUICK_PROMPTS = [
  "Mujhe fractions samjhao",
  "What are equivalent fractions?",
  "Help me with multiplication tables",
  "Algebra mein variables kya hote hain?",
  "Explain photosynthesis simply",
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function LearnPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("mathematics");
  const [grade, setGrade] = useState(5);
  const [language, setLanguage] = useState("hinglish");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [resuming, setResuming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user?.grade) setGrade(user.grade);
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!token) return;
    fetch(`${BACKEND_URL}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setStreak(data.current_streak);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch(`${BACKEND_URL}/api/sessions/active`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.id && data.messages && data.messages.length > 0) {
          setSessionId(data.id);
          setSubject(data.subject);
          setGrade(data.grade);
          setLanguage(data.language);
          setMessages(
            data.messages.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );
          setSessionStarted(true);
          setResuming(true);
          setTimeout(() => setResuming(false), 4000);
        }
      })
      .catch(() => {});
  }, [token]);

  const {
    isSpeaking,
    isListening,
    speakingMessageIndex,
    autoSpeak,
    ttsAvailable,
    sttAvailable,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    toggleAutoSpeak,
  } = useVoice(language);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMessage: Message = { role: "user", content: text.trim() };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setLoading(true);
      setSessionStarted(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            subject,
            grade,
            language,
            ...(sessionId ? { session_id: sessionId } : {}),
          }),
        });

        const data = await res.json();

        if (data.error) {
          setMessages([
            ...newMessages,
            {
              role: "assistant",
              content:
                "Oops! Something went wrong. Please make sure the API key is configured correctly in .env.local 🔧",
            },
          ]);
        } else {
          const updatedMessages: Message[] = [
            ...newMessages,
            { role: "assistant", content: data.message },
          ];
          setMessages(updatedMessages);
          if (data.session_id) setSessionId(data.session_id);

          if (autoSpeak && ttsAvailable) {
            speak(data.message, updatedMessages.length - 1);
          }
        }
      } catch {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Connection error! Please check if the server is running. 🔌",
          },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [loading, messages, subject, grade, language, autoSpeak, ttsAvailable, speak, token, sessionId]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        setInput(transcript);
        sendMessage(transcript);
      });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-blue-deep flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-deep flex flex-col">
      <header className="h-14 px-4 lg:px-8 flex items-center justify-between border-b border-white/[0.06] bg-[rgba(13,13,11,0.9)] backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-lg font-bold text-white tracking-tight"
          >
            RankerIQ<span className="text-saffron">.</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 ml-4">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`text-[11px] px-3 py-1.5 rounded-full transition-all ${
                  subject === s.id
                    ? "bg-saffron/20 text-saffron-light border border-saffron/30"
                    : "text-white/40 hover:text-white/60 border border-transparent"
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {ttsAvailable && (
            <button
              onClick={toggleAutoSpeak}
              className={`text-[11px] px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                autoSpeak
                  ? "bg-green-light/20 text-green-light border border-green-light/30"
                  : "text-white/40 hover:text-white/60 border border-white/10"
              }`}
              title={autoSpeak ? "Auto-speak ON" : "Auto-speak OFF"}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                {autoSpeak && (
                  <>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </>
                )}
              </svg>
              <span className="hidden sm:inline">
                {autoSpeak ? "Voice ON" : "Voice"}
              </span>
            </button>
          )}

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/[0.06] border border-white/10 text-white/70 text-[11px] rounded-lg px-2 py-1.5 outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id} className="bg-blue-deep">
                {l.label}
              </option>
            ))}
          </select>
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="bg-white/[0.06] border border-white/10 text-white/70 text-[11px] rounded-lg px-2 py-1.5 outline-none"
          >
            {GRADES.map((g) => (
              <option key={g} value={g} className="bg-blue-deep">
                Grade {g}
              </option>
            ))}
          </select>
          {streak > 0 && (
            <div className="bg-saffron/20 text-saffron-light text-[11px] px-3 py-1 rounded-full font-medium border border-saffron/20">
              🔥 {streak} day streak
            </div>
          )}
          <Link
            href="/dashboard"
            className="text-[11px] text-white/40 hover:text-white/70 transition-colors"
          >
            Parent View →
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
        {!sessionStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
            <div
              className={`w-24 h-24 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(224,123,26,0.6),rgba(20,36,64,0.9))] flex items-center justify-center mb-8 ${
                isListening ? "animate-orb-pulse" : ""
              }`}
            >
              <span className="text-4xl">🎙️</span>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white mb-3 text-center">
              Namaste! Ready to learn?
            </h2>
            <p className="text-white/50 text-center max-w-md mb-6 font-light leading-relaxed">
              Type your question in Hindi, English, or Hinglish — or tap the mic
              to speak!
            </p>

            {sttAvailable && (
              <button
                onClick={handleMicClick}
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-8 transition-all ${
                  isListening
                    ? "bg-red-soft text-white animate-orb-pulse"
                    : "bg-saffron/20 text-saffron-light hover:bg-saffron/30 border border-saffron/30"
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </button>
            )}

            {isListening && (
              <div className="text-saffron-light text-sm mb-6 animate-pulse">
                Listening... speak now
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-[12px] px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 hover:border-white/20 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
            {resuming && (
              <div className="bg-saffron/10 border border-saffron/20 rounded-xl px-4 py-3 text-center">
                <div className="text-saffron-light text-sm font-medium">Welcome back! Continuing your previous session.</div>
                <div className="text-white/40 text-xs mt-1">Pick up right where you left off</div>
              </div>
            )}
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                role={msg.role}
                content={msg.content}
                index={i}
                isLatest={i >= messages.length - 2}
                ttsAvailable={ttsAvailable}
                isSpeaking={speakingMessageIndex === i}
                onSpeak={() => speak(msg.content, i)}
                onStopSpeaking={stopSpeaking}
              />
            ))}

            {loading && (
              <div className="flex justify-start animate-fade-up">
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-saffron/40 to-blue-mid flex items-center justify-center ring-1 ring-white/10">
                    <span className="text-xs">✦</span>
                  </div>
                  <div className="bg-white/[0.05] border border-white/[0.06] px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1.5 items-center">
                      <span
                        className="w-2 h-2 rounded-full bg-saffron-light/60"
                        style={{ animation: "typing 1.4s infinite 0s" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-saffron-light/60"
                        style={{ animation: "typing 1.4s infinite 0.2s" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-saffron-light/60"
                        style={{ animation: "typing 1.4s infinite 0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-end gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3">
            {sttAvailable && (
              <button
                onClick={handleMicClick}
                className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-red-soft text-white animate-pulse"
                    : "bg-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/10"
                }`}
                title={isListening ? "Stop listening" : "Speak your question"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </button>
            )}

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? "Listening... speak now"
                  : "Type or tap the mic to speak..."
              }
              className="flex-1 bg-transparent text-white/90 text-sm outline-none resize-none placeholder:text-white/30 min-h-[24px] max-h-[120px]"
              rows={1}
            />

            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.06] text-saffron-light hover:bg-white/10 transition-all"
                title="Stop speaking"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
            )}

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="bg-saffron text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-saffron-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-white/20 text-center mt-2">
            RankerIQ uses AI to teach. Responses are educational — always verify important information with your teacher.
          </p>
        </div>
      </div>
    </div>
  );
}
