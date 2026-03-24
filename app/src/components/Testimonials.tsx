"use client";

const testimonials = [
  {
    text: "My daughter talks to RankerIQ the same way she talks to her friends. She doesn't even realise she's studying. Her maths score went from 58% to 81% in one term.",
    name: "Sunita Prasad",
    meta: "Mother of Ananya, Grade 5 · Delhi",
    initials: "SP",
    gradient: "from-saffron to-saffron-light",
  },
  {
    text: "I cancelled the ₹4,000/month home tutor after 6 weeks. The parent dashboard tells me more about what my son actually understands than the tutor ever did.",
    name: "Rakesh Kumar",
    meta: "Father of Arjun, Grade 5 · Bengaluru",
    initials: "RK",
    gradient: "from-green to-green-light",
  },
  {
    text: "Mera beta sirf Hinglish mein baat karta hai. Pehli baar koi platform hai jisme woh actually comfortable feel karta hai. WhatsApp report ne toh poori family ko convince kar diya.",
    name: "Poonam Mehta",
    meta: "Mother of Kabir, Grade 5 · Jaipur",
    initials: "PM",
    gradient: "from-[#1a2e6a] to-[#3b5bdb]",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 px-6 lg:px-16 bg-cream text-center">
      <div className="max-w-[560px] mx-auto mb-16">
        <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-saffron mb-3">
          What parents say
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-[clamp(32px,4vw,48px)] font-bold text-ink leading-[1.15] tracking-tight">
          The tutor that&apos;s there <em className="italic text-saffron">every day</em>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="bg-white border border-cream-dark rounded-2xl p-7 text-left hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all"
          >
            <div className="text-saffron text-[13px] tracking-wider mb-2">
              ★★★★★
            </div>
            <div className="font-[family-name:var(--font-display)] text-[40px] text-saffron leading-none mb-2">
              &ldquo;
            </div>
            <div className="text-sm text-ink-soft leading-relaxed font-light italic mb-5">
              {t.text}
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-[38px] h-[38px] rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-semibold shrink-0`}
              >
                {t.initials}
              </div>
              <div>
                <div className="text-[13px] font-semibold">{t.name}</div>
                <div className="text-[11px] text-ink-muted">{t.meta}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
