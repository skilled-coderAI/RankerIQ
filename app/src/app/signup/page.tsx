"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [grade, setGrade] = useState(5);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

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

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
        >
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white mb-6">
            Get started
          </h2>

          {error && (
            <div className="bg-red-soft/20 border border-red-soft/30 text-red-soft text-[13px] px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

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
            disabled={loading}
            className="w-full bg-saffron text-white py-3 rounded-lg text-sm font-semibold mt-6 hover:bg-saffron-light hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(224,123,26,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? "Creating account..." : "Create free account"}
          </button>
        </form>

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
