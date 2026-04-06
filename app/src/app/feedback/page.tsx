"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORIES = [
  { id: "general", label: "General" },
  { id: "voice", label: "Voice & Speech" },
  { id: "curriculum", label: "Curriculum & Content" },
  { id: "ui", label: "App Experience" },
  { id: "pricing", label: "Pricing & Plans" },
  { id: "bugs", label: "Bug Report" },
];

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-transform hover:scale-110 focus:outline-none"
        >
          <span
            className={
              star <= (hovered || value)
                ? "text-saffron drop-shadow-[0_0_6px_rgba(224,123,26,0.6)]"
                : "text-white/20"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent!",
};

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating before submitting.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          rating,
          category,
          message,
          wouldRecommend: wouldRecommend ?? false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-blue-deep pt-24 pb-16 px-6">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(224,123,26,0.07),transparent_65%)] pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-saffron/10 border border-saffron/20 text-saffron text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              Help us improve
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-white mb-4">
              Share your experience
            </h1>
            <p className="text-white/50 text-base max-w-md mx-auto">
              Your feedback directly shapes RankerIQ. Tell us what&apos;s working, what isn&apos;t, and what you wish we had.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-12 text-center backdrop-blur-xl">
              <div className="text-5xl mb-4">🙏</div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white mb-3">
                Thank you!
              </h2>
              <p className="text-white/50 text-sm mb-8 max-w-sm mx-auto">
                Your feedback has been received. We read every submission and use it to build a better product.
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 text-sm hover:bg-white/[0.1] transition-all"
                >
                  Back to home
                </Link>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setRating(0);
                    setMessage("");
                    setCategory("general");
                    setWouldRecommend(null);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-saffron text-white text-sm font-semibold hover:bg-saffron-light transition-all"
                >
                  Submit another
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-xl space-y-8"
            >
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-3 block">
                  Overall rating
                </label>
                <StarRating value={rating} onChange={setRating} />
                {rating > 0 && (
                  <p className="text-saffron text-sm mt-2 font-medium">
                    {RATING_LABELS[rating]}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-3 block">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`text-[12px] px-3 py-1.5 rounded-lg border transition-all ${
                        category === c.id
                          ? "bg-saffron/20 border-saffron/40 text-saffron-light"
                          : "bg-white/[0.04] border-white/10 text-white/50 hover:text-white/70"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1.5 block">
                  Your feedback <span className="text-saffron/60">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think — what works well, what could be better, or features you'd love to see..."
                  required
                  rows={5}
                  minLength={5}
                  maxLength={2000}
                  className="w-full bg-white/[0.06] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-saffron/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20 resize-none"
                />
                <p className="text-white/20 text-[11px] mt-1 text-right">
                  {message.length}/2000
                </p>
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-3 block">
                  Would you recommend RankerIQ to other parents?
                </label>
                <div className="flex gap-3">
                  {[
                    { value: true, label: "Yes, definitely" },
                    { value: false, label: "Not yet" },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => setWouldRecommend(opt.value)}
                      className={`text-sm px-4 py-2 rounded-lg border transition-all ${
                        wouldRecommend === opt.value
                          ? "bg-saffron/20 border-saffron/40 text-saffron-light"
                          : "bg-white/[0.04] border-white/10 text-white/40 hover:text-white/60"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1.5 block">
                    Name <span className="text-white/20 normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    maxLength={100}
                    className="w-full bg-white/[0.06] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-saffron/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1.5 block">
                    Email <span className="text-white/20 normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    maxLength={200}
                    className="w-full bg-white/[0.06] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-saffron/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
                  />
                </div>
              </div>

              <p className="text-white/20 text-[11px]">
                Your email is only used to follow up if we have questions about your feedback. We never share it.
              </p>

              <button
                type="submit"
                disabled={loading || rating === 0}
                className="w-full bg-saffron text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-saffron-light hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(224,123,26,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Submitting..." : "Submit feedback"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
