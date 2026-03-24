"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push("/learn");
    }
  };

  return (
    <div className="min-h-screen bg-blue-deep flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(224,123,26,0.1),transparent_65%)] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-3xl font-bold text-white tracking-tight inline-block"
          >
            RankerIQ<span className="text-saffron">.</span>
          </Link>
          <p className="text-white/40 text-sm mt-2 font-light">
            Sign in to continue learning
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
        >
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white mb-6">
            Welcome back
          </h2>

          {error && (
            <div className="bg-red-soft/20 border border-red-soft/30 text-red-soft text-[13px] px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@demo.com"
                required
                className="w-full bg-white/[0.06] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-saffron/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/[0.06] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-saffron/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-saffron text-white py-3 rounded-lg text-sm font-semibold mt-6 hover:bg-saffron-light hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(224,123,26,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <div className="text-[11px] text-white/30 text-center mb-3 uppercase tracking-wider">
              Demo accounts
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("student@demo.com");
                  setPassword("demo1234");
                }}
                className="text-[11px] px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.08] transition-all text-center"
              >
                Student login
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("parent@demo.com");
                  setPassword("demo1234");
                }}
                className="text-[11px] px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.08] transition-all text-center"
              >
                Parent login
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-white/30 text-[13px] mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-saffron-light hover:text-saffron transition-colors"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
