"use client";

const questions = [
  {
    level: "easy",
    color: "text-green",
    border: "bg-green-light",
    badge: "Word problem",
    text: "Priya has 6 apples. She gives away 2. What fraction is left?",
    options: [
      { text: "4/6", correct: true },
      { text: "2/6", correct: false },
      { text: "4/2", correct: false },
    ],
    label: "Easy — building confidence",
  },
  {
    level: "medium",
    color: "text-saffron",
    border: "bg-saffron",
    badge: "Identify the error",
    text: 'A student says 2/4 > 3/6 because 4 < 6. What is wrong with this reasoning?',
    options: [
      { text: "The fractions aren't comparable", correct: false },
      { text: "Nothing, they are correct", correct: false, wrong: true },
      { text: "They ignored numerators", correct: true },
    ],
    label: "Medium — deepening understanding",
  },
  {
    level: "hard",
    color: "text-red-soft",
    border: "bg-[#e53e3e]",
    badge: "Fill in blank",
    text: "Fill in: 3/__ = 6/10. The missing denominator is ___",
    options: [
      { text: "4", correct: false },
      { text: "5", correct: true },
      { text: "8", correct: false },
    ],
    label: "Hard — exam-level mastery",
  },
];

export default function AdaptiveEngine() {
  return (
    <section className="py-28 px-6 lg:px-16 bg-cream">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-end mb-16">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-saffron mb-3">
              Adaptive Practice Engine
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(32px,4vw,48px)] font-bold text-ink leading-[1.15] tracking-tight">
              Questions that <em className="italic text-saffron">learn</em> your
              child
            </h2>
          </div>
          <p className="text-base text-ink-soft leading-relaxed font-light">
            Not a static question bank. An engine that adjusts difficulty,
            switches formats, and tracks error patterns — until every concept
            actually sticks.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {questions.map((q, i) => (
            <div
              key={i}
              className="bg-white border border-cream-dark rounded-[14px] p-5 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] transition-all"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-[3px] ${q.border}`}
              />
              <div className="inline-block text-[9px] bg-saffron-pale text-saffron px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide mb-2">
                {q.badge}
              </div>
              <div
                className={`text-[10px] font-semibold uppercase tracking-wider mb-3 ${q.color}`}
              >
                {q.label}
              </div>
              <div className="text-[13px] text-ink-mid leading-relaxed mb-4">
                {q.text}
              </div>
              <div className="flex flex-col gap-1.5">
                {q.options.map((opt, j) => (
                  <div
                    key={j}
                    className={`text-[11px] px-2.5 py-1.5 rounded-md border transition-colors cursor-default ${
                      opt.correct
                        ? "bg-green-pale text-green border-green-light/30"
                        : opt.wrong
                          ? "bg-[#fdecea] text-red-soft border-red-soft/20"
                          : "bg-cream text-ink-soft border-transparent hover:bg-cream-dark"
                    }`}
                  >
                    {opt.correct ? "✓ " : opt.wrong ? "✗ " : ""}
                    {opt.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-cream-mid rounded-2xl p-8 mt-4 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-14 h-14 bg-saffron-pale rounded-[14px] flex items-center justify-center text-2xl shrink-0">
            🔍
          </div>
          <div className="flex-1">
            <h4 className="text-[15px] font-semibold mb-1">
              Error pattern detected — Riya
            </h4>
            <p className="text-[13px] text-ink-soft leading-relaxed font-light">
              Riya has answered 6 questions comparing fractions incorrectly in
              the last 3 sessions. She consistently ignores the numerator and
              only compares denominators. The engine has switched her to
              &ldquo;identify the error&rdquo; format and notified the parent
              dashboard.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-white border border-cream-dark px-4 py-2 rounded-lg text-[12px] text-ink-soft shrink-0">
            📱 Parent alerted
          </div>
        </div>
      </div>
    </section>
  );
}
