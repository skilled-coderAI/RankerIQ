"use client";

import Link from "next/link";
import Waveform from "./Waveform";

export default function Hero() {
  return (
    <section className="min-h-screen bg-blue-deep relative flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 grain-overlay radial-glow">
      <div className="relative z-10 text-center max-w-[860px]">
        <div className="inline-flex items-center gap-2 bg-saffron/15 border border-saffron/30 px-4 py-1.5 rounded-full text-[12px] font-medium text-saffron-light tracking-wide mb-8 animate-fade-up">
          <span className="w-[7px] h-[7px] rounded-full bg-saffron-light animate-pulse-dot" />
          Voice-first AI tutoring · Grade 5 to JEE/NEET
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-[clamp(42px,7vw,80px)] font-bold text-white leading-[1.1] tracking-tight mb-6 animate-fade-up delay-100">
          Your child learns
          <br />
          by <em className="italic text-saffron-light">talking</em>, not
          clicking
        </h1>

        <p className="text-lg text-white/60 leading-relaxed max-w-[560px] mx-auto mb-10 font-light animate-fade-up delay-200">
          RankerIQ is an AI tutor your child speaks to — in Hindi, English, or
          Hinglish. It listens, understands, and teaches back. No videos to watch
          passively. No worksheets to ignore.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16 animate-fade-up delay-300 flex-wrap">
          <Link
            href="/learn"
            className="bg-saffron text-white px-8 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-saffron-light hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(224,123,26,0.35)] transition-all flex items-center gap-2"
          >
            Start free trial →
          </Link>
          <button className="bg-transparent text-white/80 px-7 py-3.5 rounded-lg text-[15px] border border-white/20 hover:bg-white/[0.06] hover:border-white/35 transition-all flex items-center gap-2">
            ▶ &nbsp;Watch 2-min demo
          </button>
        </div>

        <div className="animate-fade-up delay-400 relative w-full max-w-[680px] mx-auto bg-white/[0.04] border border-white/10 rounded-2xl p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-saffron/[0.04] to-green-light/[0.04] pointer-events-none" />
          <div className="flex items-center justify-between mb-5 relative">
            <div className="text-[11px] font-medium uppercase tracking-wider text-saffron-light flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-light animate-pulse-dot" />
              Live session
            </div>
            <div className="text-[12px] text-white/40">
              Riya · Grade 5 · Fractions
            </div>
          </div>

          <div className="font-[family-name:var(--font-display)] text-lg text-white/90 leading-relaxed mb-5 italic relative">
            &ldquo;Agar ek pizza ke 4 tukde hain aur maine 2 khaaye, toh kitna
            bachha?&rdquo;
          </div>

          <Waveform />

          <div className="bg-green-light/12 border border-green-light/20 rounded-xl p-3 text-[13px] text-white/75 leading-relaxed relative">
            <strong className="text-green-light font-medium">RankerIQ:</strong>{" "}
            &ldquo;Wah, Riya! Half bachha — matlab 2/4. Ab batao — kya yeh 1/2
            ke barabar hoga?&rdquo; 🤔{" "}
            <em>Guess karo, phir main batata hoon kyun...</em>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-20 w-full max-w-[860px] border-t border-white/[0.08] pt-8 flex items-center justify-center gap-12 flex-wrap animate-fade-up delay-500">
        {[
          { num: "12,400+", label: "Active students" },
          { num: "4.8★", label: "Parent rating" },
          { num: "3 languages", label: "Hindi · English · Hinglish" },
          { num: "CBSE · ICSE", label: "All major boards" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-12 last:gap-0">
            <div className="text-center">
              <span className="font-[family-name:var(--font-display)] text-[28px] font-bold text-white block">
                {item.num}
              </span>
              <span className="text-[12px] text-white/45 mt-1">
                {item.label}
              </span>
            </div>
            {i < 3 && (
              <div className="w-px h-10 bg-white/10 hidden sm:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
