"use client";

const steps = [
  {
    num: "01",
    icon: "🎙️",
    iconBg: "bg-saffron-pale",
    title: "Your child speaks to RankerIQ",
    desc: "No typing, no swiping. Your child opens the app and starts talking. RankerIQ asks questions, listens to their reasoning, and responds in the same language they use — Hindi, English, or a mix of both.",
  },
  {
    num: "02",
    icon: "🧠",
    iconBg: "bg-green-pale",
    title: "RankerIQ figures out exactly what's missing",
    desc: "Every session, the adaptive engine builds a detailed map of what your child truly understands versus what they're guessing. It goes two levels deeper than a test score.",
  },
  {
    num: "03",
    icon: "📱",
    iconBg: "bg-blue-100",
    title: "You see proof of progress every week",
    desc: "A clear parent dashboard shows the Exam Readiness Score, weak topics, and what RankerIQ discovered in today's session. No jargon — just actionable insights.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-28 px-6 lg:px-16 bg-cream max-w-[1100px] mx-auto"
    >
      <div className="text-center max-w-[580px] mx-auto mb-16">
        <div className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-saffron mb-3">
          How it works
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-[clamp(32px,4vw,48px)] font-bold text-ink leading-[1.15] tracking-tight">
          Three things that replace a ₹5,000/month tutor
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-cream-dark rounded-2xl overflow-hidden">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-cream p-10 hover:bg-cream-mid transition-colors"
          >
            <div className="font-[family-name:var(--font-display)] text-[64px] font-bold text-cream-dark leading-none mb-6 tracking-tight">
              {step.num}
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-[22px] mb-5 ${step.iconBg}`}
            >
              {step.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2.5 tracking-tight">
              {step.title}
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed font-light">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
