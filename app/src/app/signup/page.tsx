"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function PuterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#6366f1" />
      <path
        d="M7 8h10M7 12h7M7 16h4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [grade, setGrade] = useState(5);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [puterLoading, setPuterLoading] = useState(false);
  const { signup, loginWithGoogle, loginWithPuter } = useAuth();
  const router = useRouter();
  const googleInitialized = useRef(false);

  useEffect(() => {
    if (googleInitialized.current) return;

    const initGoogle = () => {
      if (!window.google || !GOOGLE_CLIENT_ID) return;
      googleInitialized.current = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setGoogleLoading(true);
          setError("");
          const err = await loginWithGoogle(response.credential);
          setGoogleLoading(false);
          if (err) {
            setError(err);
          } else {
            router.push("/learn");
          }
        },
        cancel_on_tap_outside: true,
      });
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initGoogle();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loginWithGoogle, router]);

  const handleGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google Sign In is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local");
      return;
    }
    if (!window.google) {
      setError("Google Sign In is loading. Please try again in a moment.");
      return;
    }
    setError("");
    window.google.accounts.id.prompt();
  };

  const handlePuterSignIn = async () => {
    setPuterLoading(true);
    setError("");
    const err = await loginWithPuter();
    setPuterLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push("/learn");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await signup({
      name,
      email,
      password,
      role,
      grade: role === "student" ? grade : undefined,
      board: role === "student" ? "CBSE" : undefined,
    });
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push(role === "student" ? "/learn" : "/dashboard");
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
            Create your free account
          </p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white mb-6">
            Get started
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || puterLoading}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(255,255,255,0.18)] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {googleLoading ? (
                <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {googleLoading ? "Signing up..." : "Sign up with Google"}
            </button>

            <button
              type="button"
              onClick={handlePuterSignIn}
              disabled={googleLoading || puterLoading}
              className="w-full flex items-center justify-center gap-3 bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-500/25 hover:border-indigo-400/35 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {puterLoading ? (
                <span className="w-4 h-4 border-2 border-indigo-400/40 border-t-indigo-300 rounded-full animate-spin" />
              ) : (
                <PuterIcon />
              )}
              {puterLoading ? "Connecting..." : "Sign up with Puter"}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.07]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-transparent text-white/25 text-[11px] uppercase tracking-widest">
                or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1.5 block">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["student", "parent"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`text-sm px-4 py-2.5 rounded-lg border transition-all capitalize ${
                        role === r
                          ? "bg-saffron/20 border-saffron/40 text-saffron-light"
                          : "bg-white/[0.04] border-white/10 text-white/40 hover:text-white/60"
                      }`}
                    >
                      {r === "student" ? "Student" : "Parent"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1.5 block">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === "student" ? "Riya Sharma" : "Priya Sharma"}
                  required
                  className="w-full bg-white/[0.06] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-saffron/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-white/[0.06] border border-white/10 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-saffron/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
                />
              </div>

              {role === "student" && (
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1.5 block">
                    Grade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full bg-white/[0.06] border border-white/10 text-white/70 text-sm rounded-lg px-4 py-3 outline-none focus:border-saffron/50 transition-all"
                  >
                    {[5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g} className="bg-blue-deep">
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading || puterLoading}
              className="w-full bg-saffron text-white py-3 rounded-lg text-sm font-semibold mt-6 hover:bg-saffron-light hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(224,123,26,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-[13px] mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-saffron-light hover:text-saffron transition-colors"
          >
            Sign in
          </Link>
        </p>


      </div>
    </div>
  );
}
