"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-200 px-6 lg:px-16 h-16 flex items-center justify-between bg-[rgba(13,13,11,0.85)] backdrop-blur-2xl border-b border-white/[0.06]">
      <Link
        href="/"
        className="font-[family-name:var(--font-display)] text-[22px] font-bold text-white tracking-tight"
      >
        RankerIQ<span className="text-saffron">.</span>
      </Link>

      <button
        className="lg:hidden text-white/60 text-2xl"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? "✕" : "☰"}
      </button>

      <ul
        className={`${
          open
            ? "flex flex-col absolute top-16 left-0 right-0 bg-[rgba(13,13,11,0.97)] p-6 gap-4 border-b border-white/[0.06]"
            : "hidden"
        } lg:flex lg:static lg:flex-row lg:p-0 lg:bg-transparent lg:border-0 items-center gap-8 list-none`}
      >
        <li>
          <a
            href="#how-it-works"
            className="text-[13px] text-white/60 hover:text-white transition-colors"
          >
            How it works
          </a>
        </li>
        <li>
          <a
            href="#for-parents"
            className="text-[13px] text-white/60 hover:text-white transition-colors"
          >
            For parents
          </a>
        </li>
        <li>
          <a
            href="#pricing"
            className="text-[13px] text-white/60 hover:text-white transition-colors"
          >
            Pricing
          </a>
        </li>
        <li>
          <Link
            href="/about"
            className="text-[13px] text-white/60 hover:text-white transition-colors"
          >
            About
          </Link>
        </li>
        <li>
          <Link
            href="/learn"
            className="text-[13px] text-white/60 hover:text-white transition-colors"
          >
            Start Learning
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard"
            className="text-[13px] text-white/60 hover:text-white transition-colors"
          >
            Parent Dashboard
          </Link>
        </li>

        {user ? (
          <>
            <li className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-saffron to-saffron-light flex items-center justify-center text-white text-[10px] font-bold">
                {user.avatar_initials}
              </div>
              <span className="text-[12px] text-white/60 hidden xl:inline">
                {user.name}
              </span>
            </li>
            <li>
              <button
                onClick={logout}
                className="text-[12px] text-white/40 hover:text-white/70 transition-colors border border-white/10 px-3 py-1.5 rounded-lg"
              >
                Sign out
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                href="/login"
                className="text-[13px] text-white/60 hover:text-white transition-colors"
              >
                Sign in
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="bg-saffron text-white px-5 py-2 rounded-lg font-medium text-[13px] hover:bg-saffron-light transition-colors"
              >
                Try free →
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
