"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-28 px-6 lg:px-16 bg-blue-deep text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,rgba(224,123,26,0.12),transparent_65%)]" />

      <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-saffron-light mb-3 relative z-10">
        Start today
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-[clamp(32px,4vw,48px)] font-bold text-white leading-[1.15] tracking-tight max-w-[600px] mx-auto mb-4 relative z-10">
        Give your child the tutor that{" "}
        <em className="italic text-saffron-light">never gives up</em>
      </h2>
      <p className="text-base text-white/50 leading-relaxed max-w-[520px] mx-auto mb-10 font-light relative z-10">
        7 days free. No credit card. Cancel anytime. The first session takes 3
        minutes to set up.
      </p>
      <div className="flex items-center justify-center gap-4 relative z-10 flex-wrap">
        <Link
          href="/learn"
          className="bg-saffron text-white px-9 py-4 rounded-lg text-base font-semibold hover:bg-saffron-light hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(224,123,26,0.35)] transition-all"
        >
          Start free trial — it&apos;s free →
        </Link>
        <button className="bg-transparent text-white/80 px-7 py-4 rounded-lg text-[15px] border border-white/20 hover:bg-white/[0.06] hover:border-white/35 transition-all">
          Talk to us on WhatsApp
        </button>
      </div>
    </section>
  );
}
