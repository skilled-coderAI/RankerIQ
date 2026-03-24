"use client";

const features = [
  {
    title: "Speaks Hindi, English & Hinglish",
    desc: 'naturally, the way your child actually talks. No forced "please say your answer in English."',
  },
  {
    title: "Never gives the answer directly",
    desc: "asks guiding questions instead, so understanding sticks instead of being forgotten the next day.",
  },
  {
    title: "Detects confusion in real-time",
    desc: "a hesitation, a repeated wrong word, a long silence. The AI adjusts its approach mid-conversation.",
  },
  {
    title: "Feeds everything to the parent dashboard",
    desc: "every session generates a summary of what was covered and what still needs work.",
  },
];

export default function VoiceSection() {
  return (
    <section className="bg-blue-deep py-28 px-6 lg:px-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(224,123,26,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1100px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-saffron-light mb-3">
            Voice AI — our core technology
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(32px,4vw,48px)] font-bold text-white leading-[1.15] tracking-tight max-w-[460px]">
            The only tutor that <em className="italic text-saffron-light">listens</em>
          </h2>
          <p className="text-base text-white/50 leading-relaxed max-w-[520px] mt-4 font-light">
            Every other edtech product gives your child content to consume.
            RankerIQ asks your child to think out loud — which is how real
            understanding is built.
          </p>

          <div className="mt-10 flex flex-col gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-[22px] h-[22px] rounded-full bg-green-light/20 border border-green-light/35 flex items-center justify-center text-[11px] text-green-light shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="text-sm text-white/65 leading-relaxed font-light">
                  <strong className="text-white/90 font-medium">
                    {f.title}
                  </strong>{" "}
                  — {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute -left-15 top-30 bg-white rounded-xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-sm z-10 animate-float">
            <div className="text-[10px] text-ink-muted mb-1">Today&apos;s score</div>
            <div className="text-lg font-bold text-ink font-[family-name:var(--font-display)]">74%</div>
            <div className="text-[10px] text-green font-medium mt-0.5">↑ up from 61%</div>
          </div>

          <div className="w-[280px] bg-[#111827] rounded-[40px] p-3 border-2 border-white/[0.08] shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] relative">
            <div className="w-20 h-6 bg-[#111827] rounded-b-2xl mx-auto mb-2 relative z-2" />
            <div className="bg-blue-deep rounded-[30px] p-5 min-h-[480px] overflow-hidden relative">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(224,123,26,0.2)_0%,transparent_70%)]" />

              <div className="flex items-center justify-between mb-5 relative">
                <div className="text-sm font-semibold text-white">RankerIQ</div>
                <div className="text-[10px] px-2.5 py-0.5 bg-saffron/20 text-saffron-light rounded-full font-medium">
                  Fractions
                </div>
              </div>

              <div className="flex flex-col items-center my-6 relative">
                <div className="w-[90px] h-[90px] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(224,123,26,0.6),rgba(20,36,64,0.9))] flex items-center justify-center animate-orb-pulse">
                  <span className="text-[28px]">🎙️</span>
                </div>
                <div className="text-[11px] text-white/50 mt-3 tracking-wide">
                  Listening…
                </div>
              </div>

              <div className="flex flex-col gap-2 relative">
                <div className="bg-white/[0.07] text-white/80 rounded-[14px] rounded-bl p-2.5 text-[12px] leading-relaxed self-start max-w-[85%]">
                  <div className="text-[9px] uppercase tracking-wide text-saffron-light font-semibold mb-0.5">
                    RankerIQ
                  </div>
                  2/4 aur 3/6 mein se kaun bada hai?
                </div>
                <div className="bg-saffron/20 text-white/85 rounded-[14px] rounded-br p-2.5 text-[12px] leading-relaxed self-end max-w-[85%]">
                  <div className="text-[9px] uppercase tracking-wide text-saffron-light font-semibold mb-0.5">
                    Riya
                  </div>
                  2/4 bada hai kyunki... 4 chhota hai?
                </div>
                <div className="bg-white/[0.07] text-white/80 rounded-[14px] rounded-bl p-2.5 text-[12px] leading-relaxed self-start max-w-[85%]">
                  <div className="text-[9px] uppercase tracking-wide text-saffron-light font-semibold mb-0.5">
                    RankerIQ
                  </div>
                  Interesting! Ek kaam karo — ek roti ko 4 tukdon mein kaato,
                  doosri ko 6 mein...
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -right-12 bottom-36 bg-white rounded-xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-sm z-10 animate-float delay-500">
            <div className="text-[10px] text-ink-muted mb-1">14-day streak</div>
            <div className="text-lg font-bold text-ink font-[family-name:var(--font-display)]">🔥 14</div>
            <div className="text-[10px] text-green font-medium mt-0.5">Personal best!</div>
          </div>
        </div>
      </div>
    </section>
  );
}
