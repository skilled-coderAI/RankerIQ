"use client";

import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    sub: "First 2 chapters · no card needed",
    features: [
      "Voice AI — 5 sessions/month",
      "Chapters 1–2 only",
      "Basic parent report",
      "CBSE Grade 5",
    ],
    btnClass: "bg-transparent border border-cream-dark text-ink hover:bg-cream",
    btnText: "Get started free",
    featured: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "per month",
    sub: "₹8,999/year · save 25%",
    features: [
      "Unlimited voice AI sessions",
      "Full syllabus — all chapters",
      "Adaptive practice engine",
      "Parent dashboard + alerts",
      "Weekly WhatsApp report",
      "Photo problem solver",
      "CBSE + ICSE boards",
    ],
    btnClass: "bg-saffron text-white hover:bg-saffron-light",
    btnText: "Start 7-day free trial",
    featured: true,
  },
  {
    name: "Annual",
    price: "₹749",
    period: "per month",
    sub: "₹8,999 billed yearly",
    features: [
      "Everything in Pro",
      "Grades 5 + 6 included",
      "Priority doubt support",
      "Exam countdown planner",
      "Progress certificate",
    ],
    btnClass: "bg-transparent border border-cream-dark text-ink hover:bg-cream",
    btnText: "Get annual plan",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6 lg:px-16 bg-cream-mid text-center">
      <div className="max-w-[560px] mx-auto mb-16">
        <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-saffron mb-3">
          Simple pricing
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-[clamp(32px,4vw,48px)] font-bold text-ink leading-[1.15] tracking-tight">
          Less than ₹100 a day.{" "}
          <em className="italic text-saffron">No tutor needed.</em>
        </h2>
        <p className="text-base text-ink-soft leading-relaxed mt-4 font-light">
          A home tutor in Delhi costs ₹4,000–8,000/month. RankerIQ is less than
          the cost of a single session.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-8 text-left relative hover:-translate-y-1 transition-transform ${
              plan.featured
                ? "bg-ink text-white border-ink"
                : "bg-white border border-cream-dark"
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-saffron text-white text-[11px] font-semibold px-3.5 py-1 rounded-full tracking-wide whitespace-nowrap">
                Most popular
              </div>
            )}
            <div
              className={`text-[12px] font-semibold uppercase tracking-wider mb-4 ${
                plan.featured ? "text-white/70" : "text-ink-muted"
              }`}
            >
              {plan.name}
            </div>
            <div
              className={`font-[family-name:var(--font-display)] text-[42px] font-bold tracking-tight leading-none mb-1 ${
                plan.featured ? "text-white" : ""
              }`}
            >
              {plan.price}
            </div>
            <div
              className={`text-sm mb-1 font-light ${
                plan.featured ? "text-white/50" : "text-ink-muted"
              }`}
            >
              {plan.period}
            </div>
            <div
              className={`text-[12px] mb-6 ${
                plan.featured ? "text-white/50" : "text-ink-muted"
              }`}
            >
              {plan.sub}
            </div>
            <div
              className={`h-px mb-6 ${
                plan.featured ? "bg-white/10" : "bg-cream-dark"
              }`}
            />
            <ul className="flex flex-col gap-2.5 mb-7 list-none">
              {plan.features.map((f, j) => (
                <li
                  key={j}
                  className={`text-[13px] flex items-center gap-2 font-light ${
                    plan.featured ? "text-white/60" : "text-ink-soft"
                  }`}
                >
                  <span
                    className={`font-semibold ${
                      plan.featured ? "text-saffron-light" : "text-green-light"
                    }`}
                  >
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/learn"
              className={`block w-full py-3 rounded-lg text-sm font-semibold text-center transition-all ${plan.btnClass}`}
            >
              {plan.btnText}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
