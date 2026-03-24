"use client";

import Link from "next/link";

const statsData = [
  { val: "4.2 hrs", label: "Practice time this week", delta: "↑ 38 min more than last week", up: true },
  { val: "58%", label: "Accuracy — fractions", delta: "↓ Weakest topic this month", up: false },
  { val: "89%", label: "Accuracy — multiplication", delta: "↑ Mastered — revision in 6 days", up: true },
  { val: "3", label: "Voice AI sessions this week", delta: "Avg 12 min per session", up: null },
];

const alertCards = [
  { type: "⚠ Recurring gap", topic: "Equivalent Fractions", chapter: "Chapter 4 · 6 errors in last 3 sessions", pct: 42, color: "red" },
  { type: "⚡ Shaky grasp", topic: "Improper Fractions", chapter: "Chapter 4 · Correct but slow", pct: 71, color: "amber" },
  { type: "✓ Strong", topic: "Long Multiplication", chapter: "Chapter 2 · Mastered last week", pct: 91, color: "green" },
];

const topics = [
  { name: "Numbers up to 10 lakh", pct: 94, strength: "strong" },
  { name: "Addition & Subtraction", pct: 88, strength: "strong" },
  { name: "Multiplication", pct: 91, strength: "strong" },
  { name: "Division", pct: 74, strength: "ok" },
  { name: "Fractions — basics", pct: 68, strength: "ok" },
  { name: "Equivalent Fractions", pct: 42, strength: "weak" },
  { name: "Decimals (not started)", pct: 0, strength: "none" },
];

const feedItems = [
  { icon: "🎙️", iconBg: "bg-[#e8f0ff]", title: "Voice AI session — Fractions", desc: "Asked about equivalent fractions twice.", time: "4:12 pm" },
  { icon: "📝", iconBg: "bg-sage", title: "Chapter 4 mini test", desc: "Score 14/20 — Fractions dragged score down", time: "3:30 pm" },
  { icon: "⚡", iconBg: "bg-amber-pale", title: "Adaptive practice — 22 questions", desc: "Multiplication: 9/9 · Fractions: 7/13", time: "3:00 pm" },
  { icon: "🏅", iconBg: "bg-[#f0e8ff]", title: "Badge earned — Multiplication Master", desc: "3rd chapter badge this month", time: "3:02 pm" },
];

const upcoming = [
  { day: "21", mon: "Mar", title: "Chapter 4 revision due", desc: "Fractions — spaced revision", tag: "Revision", tagClass: "bg-amber-pale text-amber" },
  { day: "25", mon: "Mar", title: "Chapter 4 full test", desc: "Fractions — 20 questions, 30 minutes", tag: "Test", tagClass: "bg-[#fdecea] text-red-soft" },
  { day: "28", mon: "Mar", title: "Chapter 5 begins — Decimals", desc: "Prerequisite check: fractions must be above 75%", tag: "New chapter", tagClass: "bg-sage text-forest-mid" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-forest text-white px-4 lg:px-8 h-14 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-[family-name:var(--font-display)] text-xl tracking-tight">
          RankerIQ<span className="text-green-light">.</span>
        </Link>
        <div className="flex items-center gap-4 text-[13px] text-white/70">
          <span className="hidden sm:inline">Priya Sharma (Parent)</span>
          <button className="bg-[#25D366] text-white px-3.5 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 hover:opacity-85 transition-opacity">
            📱 WhatsApp Report
          </button>
        </div>
      </header>

      <div className="bg-white border-b border-[#e2e2da] px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-forest-light to-forest-mid flex items-center justify-center text-white font-semibold text-base">
            R
          </div>
          <div>
            <div className="text-base font-semibold text-[#1a1a18]">Riya Sharma</div>
            <div className="text-[12px] text-ink-muted">Grade 5 · CBSE · Chapter 4 active — Fractions</div>
          </div>
        </div>
        <div className="bg-amber-pale text-amber border border-amber-light px-3 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5">
          🔥 14-day streak
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-4 lg:px-8 py-8">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
          Learning health — this week
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-5 mb-6">
          <div className="bg-forest rounded-2xl p-6 text-white flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-30 h-30 rounded-full bg-white/[0.04]" />
            <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-white/[0.03]" />
            <div className="text-[11px] font-medium uppercase tracking-wider text-white/60 mb-2">
              Exam Readiness Score
            </div>
            <div className="relative w-[120px] h-[120px] my-2">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#7ec89a" strokeWidth="8"
                  strokeDasharray={`${72 * 3.267} ${100 * 3.267}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-[family-name:var(--font-display)] text-4xl text-white leading-none">72</span>
                <span className="text-[12px] text-white/50">/100</span>
              </div>
            </div>
            <div className="text-[13px] text-white/70 mt-1">Grade 5 Maths · Chapter 1–4</div>
            <div className="bg-amber/20 text-[#e9a84c] border border-amber/25 px-3 py-1 rounded-full text-[12px] mt-3 font-medium">
              Needs attention in 2 topics
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {statsData.map((s, i) => (
              <div key={i} className="bg-white border border-[#e2e2da] rounded-xl p-4 shadow-[0_2px_8px_rgba(26,58,42,0.06)]">
                <div className={`font-[family-name:var(--font-display)] text-[28px] leading-none ${
                  s.up === true ? "text-forest-light" : s.up === false ? "text-amber" : "text-[#1a1a18]"
                }`}>
                  {s.val}
                </div>
                <div className="text-[12px] text-ink-muted mt-1">{s.label}</div>
                <div className={`text-[11px] mt-1.5 flex items-center gap-1 ${
                  s.up === true ? "text-forest-light" : s.up === false ? "text-red-soft" : "text-ink-muted"
                }`}>
                  {s.delta}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
          Topics that need your attention
        </div>
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {alertCards.map((a, i) => (
            <div key={i} className="bg-white border border-[#e2e2da] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(26,58,42,0.06)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(26,58,42,0.1)] transition-all cursor-pointer">
              <div className="p-3.5 border-b border-[#e2e2da]">
                <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                  a.color === "red" ? "text-red-soft" : a.color === "amber" ? "text-amber" : "text-forest-light"
                }`}>
                  {a.type}
                </div>
                <div className="text-[15px] font-semibold text-[#1a1a18] leading-tight">{a.topic}</div>
                <div className="text-[11px] text-ink-muted mt-0.5">{a.chapter}</div>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-[12px] text-ink-mid">Accuracy <strong className="text-[#1a1a18]">{a.pct}%</strong></span>
                <div className="flex-1 ml-3 h-1 bg-sage rounded-full overflow-hidden">
                  <div
                    className={`h-1 rounded-full ${
                      a.color === "red" ? "bg-red-soft" : a.color === "amber" ? "bg-amber" : "bg-forest-light"
                    }`}
                    style={{ width: `${a.pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
              Chapter mastery map — Grade 5 Maths
            </div>
            <div className="bg-white border border-[#e2e2da] rounded-xl p-5 shadow-[0_2px_8px_rgba(26,58,42,0.06)]">
              <div className="flex items-center justify-between text-sm font-semibold mb-4">
                All topics
                <span className="text-[11px] text-ink-muted font-normal">Updated after every session</span>
              </div>
              <div className="space-y-2.5">
                {topics.map((t, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="text-[13px] text-[#1a1a18] w-[180px] shrink-0">{t.name}</div>
                    <div className="flex-1 h-2 bg-sage rounded overflow-hidden">
                      <div
                        className={`h-2 rounded transition-all duration-1000 ${
                          t.strength === "strong" ? "bg-forest-light" :
                          t.strength === "ok" ? "bg-amber" :
                          t.strength === "weak" ? "bg-red-soft" : ""
                        }`}
                        style={{ width: `${t.pct}%` }}
                      />
                    </div>
                    <div className={`text-[12px] font-medium w-9 text-right shrink-0 ${
                      t.strength === "strong" ? "text-forest-light" :
                      t.strength === "ok" ? "text-amber" :
                      t.strength === "weak" ? "text-red-soft" : "text-ink-muted"
                    }`}>
                      {t.pct > 0 ? `${t.pct}%` : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
              Today&apos;s activity
            </div>
            <div className="bg-white border border-[#e2e2da] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(26,58,42,0.06)]">
              <div className="px-5 py-4 border-b border-[#e2e2da] flex items-center justify-between">
                <h4 className="text-sm font-semibold">Activity log</h4>
                <span className="text-[11px] bg-sage text-forest-mid px-2 py-0.5 rounded-lg font-medium">Thursday, 19 Mar</span>
              </div>
              {feedItems.map((f, i) => (
                <div key={i} className="px-5 py-3.5 border-b border-[#e2e2da] last:border-b-0 flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${f.iconBg}`}>
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-[13px] font-medium text-[#1a1a18] block">{f.title}</strong>
                    <span className="text-[12px] text-ink-muted">{f.desc}</span>
                  </div>
                  <div className="text-[11px] text-ink-muted shrink-0 mt-0.5">{f.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
          Today&apos;s voice AI session — what Riya asked
        </div>
        <div className="bg-white border border-[#e2e2da] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(26,58,42,0.06)] mb-6">
          <div className="bg-forest px-5 py-3.5 flex items-center justify-between text-white">
            <h4 className="text-sm font-medium">🎙️ Session summary · Chapter 4: Fractions · 12 min</h4>
            <span className="text-[12px] text-white/60">Today 4:12 pm</span>
          </div>
          <div className="p-5 space-y-3">
            {[
              { who: "AI", text: "Riya, let's try: which is bigger — 2/4 or 3/6? Take your time." },
              { who: "Riya", text: '"2/4 is bigger because 4 is smaller than 6, so the pieces are bigger."' },
              { who: "AI", text: "Great thinking about piece size! Now, what if I told you they're actually equal? Can you think why?" },
              { who: "Riya", text: '"I don\'t understand... how can different numbers be the same?"' },
            ].map((t, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded shrink-0 mt-0.5 ${
                  t.who === "AI" ? "bg-sage text-forest-mid" : "bg-amber-pale text-amber"
                }`}>
                  {t.who}
                </span>
                <span className="text-[13px] text-ink-mid leading-relaxed">{t.text}</span>
              </div>
            ))}
          </div>
          <div className="mx-5 mb-4 p-3 bg-amber-pale border-l-[3px] border-amber rounded-r-lg">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-amber mb-1">🔍 AI insight for you</div>
            <div className="text-[12px] text-ink-mid leading-relaxed">
              Riya understands that smaller denominators mean larger pieces — this is correct. But she hasn&apos;t yet grasped that two fractions can represent the same amount (equivalent fractions). <strong>Try this at home:</strong> take a roti or chapati, cut one half into 2 pieces and another into 3 pieces — ask her if you ate one piece from each, did you eat the same amount?
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {[
            { icon: "🗓️", title: "Set a study reminder", desc: "Riya studies best at 3–4 pm. Set a daily nudge." },
            { icon: "📊", title: "Download report card", desc: "Full PDF with all topics and trend analysis." },
            { icon: "🎯", title: "Request focus session", desc: "Ask the AI to run a dedicated fractions session tonight." },
          ].map((a, i) => (
            <button key={i} className="bg-white border border-[#e2e2da] rounded-xl p-4 text-left hover:border-forest-light hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(26,58,42,0.1)] transition-all shadow-[0_2px_8px_rgba(26,58,42,0.06)]">
              <div className="text-xl mb-2">{a.icon}</div>
              <span className="text-[13px] font-semibold text-[#1a1a18] block">{a.title}</span>
              <span className="text-[11px] text-ink-muted mt-0.5 block">{a.desc}</span>
            </button>
          ))}
        </div>

        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
          Coming up
        </div>
        <div className="bg-white border border-[#e2e2da] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(26,58,42,0.06)] mb-8">
          {upcoming.map((u, i) => (
            <div key={i} className="px-5 py-3.5 border-b border-[#e2e2da] last:border-b-0 flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-lg bg-sage flex flex-col items-center justify-center shrink-0">
                <div className="font-[family-name:var(--font-display)] text-lg font-bold text-forest leading-none">{u.day}</div>
                <div className="text-[10px] text-forest-mid uppercase tracking-wide">{u.mon}</div>
              </div>
              <div className="flex-1 min-w-0">
                <strong className="text-[13px] font-medium block">{u.title}</strong>
                <span className="text-[12px] text-ink-muted">{u.desc}</span>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-lg font-medium shrink-0 ${u.tagClass}`}>{u.tag}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
