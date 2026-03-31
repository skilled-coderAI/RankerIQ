"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  index: number;
  isLatest?: boolean;
  ttsAvailable?: boolean;
  isSpeaking?: boolean;
  onSpeak?: () => void;
  onStopSpeaking?: () => void;
}

function cleanContent(raw: string): string {
  let text = raw.trim();
  text = text.replace(/^\[?\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[^\]]*\]?\s*/g, "");
  text = text.replace(/^(TutorAgent|Tutor|Assistant|RankerIQ)\s*:\s*/i, "");
  text = text.replace(/^(Student|User)\s*:\s*/i, "");
  return text;
}

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-white/70">{children}</em>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <div className="my-2 rounded-lg overflow-hidden bg-black/40 border border-white/10">
          <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/[0.06]">
            <span className="text-[10px] text-white/30 font-mono">{className?.replace("language-", "")}</span>
          </div>
          <pre className="p-3 overflow-x-auto">
            <code className="text-[13px] font-mono text-green-light/90 leading-relaxed">{children}</code>
          </pre>
        </div>
      );
    }
    return (
      <code className="bg-white/[0.08] text-saffron-light px-1.5 py-0.5 rounded text-[13px] font-mono">
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-saffron/40 pl-3 my-2 text-white/60 italic">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => <h3 className="text-lg font-semibold text-white mt-3 mb-1">{children}</h3>,
  h2: ({ children }) => <h3 className="text-base font-semibold text-white mt-3 mb-1">{children}</h3>,
  h3: ({ children }) => <h4 className="text-sm font-semibold text-white mt-2 mb-1">{children}</h4>,
  hr: () => <hr className="border-white/10 my-3" />,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-saffron-light underline underline-offset-2 hover:text-saffron transition-colors">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-[13px] border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="text-left px-2 py-1 border-b border-white/10 text-white/60 font-medium">{children}</th>,
  td: ({ children }) => <td className="px-2 py-1 border-b border-white/[0.05]">{children}</td>,
};

const userMarkdownComponents: Components = {
  ...markdownComponents,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <div className="my-2 rounded-lg overflow-hidden bg-black/20 border border-white/10">
          <pre className="p-3 overflow-x-auto">
            <code className="text-[13px] font-mono leading-relaxed">{children}</code>
          </pre>
        </div>
      );
    }
    return (
      <code className="bg-black/20 px-1.5 py-0.5 rounded text-[13px] font-mono">
        {children}
      </code>
    );
  },
};

export default function ChatMessage({
  role,
  content,
  index,
  isLatest,
  ttsAvailable,
  isSpeaking,
  onSpeak,
  onStopSpeaking,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const cleaned = cleanContent(content);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cleaned).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [cleaned]);

  if (role === "user") {
    return (
      <div
        className="flex justify-end animate-fade-up"
        style={{ animationDelay: isLatest ? "0s" : `${Math.min(index * 0.03, 0.3)}s` }}
      >
        <div className="flex items-start gap-2.5 max-w-[80%]">
          <div className="bg-saffron/20 text-white/90 px-4 py-2.5 rounded-2xl rounded-br-sm text-[14px] leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={userMarkdownComponents}>
              {cleaned}
            </ReactMarkdown>
          </div>
          <div className="shrink-0 w-7 h-7 rounded-full bg-saffron/30 flex items-center justify-center mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-saffron-light">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex justify-start animate-fade-up"
      style={{ animationDelay: isLatest ? "0s" : `${Math.min(index * 0.03, 0.3)}s` }}
    >
      <div className="flex items-start gap-2.5 max-w-[85%] group">
        <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-saffron/40 to-blue-mid flex items-center justify-center mt-0.5 ring-1 ring-white/10">
          <span className="text-xs">✦</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white/[0.05] border border-white/[0.06] px-4 py-3 rounded-2xl rounded-tl-sm text-[14px] leading-relaxed text-white/85">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {cleaned}
            </ReactMarkdown>
          </div>
          <div className="flex items-center gap-1 mt-1.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors px-1.5 py-0.5 rounded hover:bg-white/[0.04]"
              title="Copy"
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            {ttsAvailable && (
              <button
                onClick={isSpeaking ? onStopSpeaking : onSpeak}
                className={`flex items-center gap-1 text-[10px] transition-colors px-1.5 py-0.5 rounded hover:bg-white/[0.04] ${
                  isSpeaking ? "text-saffron-light" : "text-white/30 hover:text-white/60"
                }`}
                title={isSpeaking ? "Stop" : "Play aloud"}
              >
                {isSpeaking ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    Stop
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    Listen
                  </>
                )}
              </button>
            )}
          </div>
          {isSpeaking && (
            <div className="flex items-center gap-[2px] mt-1 ml-1 h-3">
              {[...Array(8)].map((_, j) => (
                <div
                  key={j}
                  className="w-[3px] bg-saffron-light rounded-full"
                  style={{
                    animation: `waveDance 0.6s ease-in-out infinite ${j * 0.08}s alternate`,
                    height: "3px",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
