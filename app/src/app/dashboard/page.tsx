"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

interface ChildInfo {
  id: string;
  name: string;
  grade: number | null;
  board: string | null;
  avatar_initials: string;
}

interface AssessmentSummary {
  session_id: string;
  understanding: number | null;
  confidence: string | null;
  recommended_difficulty: string | null;
  engagement: string | null;
  parent_summary: string | null;
  went_well: string | null;
  needs_attention: string | null;
  home_tip: string | null;
  created_at: string;
}

interface ChildStats {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  sessions_this_week: number;
  minutes_this_week: number;
  avg_understanding: number | null;
  recent_assessments: AssessmentSummary[];
}

interface TopicMastery {
  subject: string;
  topic: string;
  accuracy: number;
  strength: string;
  attempts: number;
}

interface SessionSummary {
  id: string;
  subject: string;
  grade: number;
  language: string;
  started_at: string;
  ended_at: string | null;
  message_count: number;
  duration_minutes: number | null;
}

const fallbackStats = [
  {
    val: "—",
    label: "Practice time this week",
    delta: "No data yet",
    up: null as boolean | null,
  },
  {
    val: "—",
    label: "Sessions this week",
    delta: "Start learning to see stats",
    up: null as boolean | null,
  },
  {
    val: "—",
    label: "Avg understanding",
    delta: "Complete sessions to track",
    up: null as boolean | null,
  },
  {
    val: "—",
    label: "Total sessions",
    delta: "All time",
    up: null as boolean | null,
  },
];

function strengthColor(s: string) {
  if (s === "strong") return "bg-forest-light";
  if (s === "ok") return "bg-amber";
  if (s === "weak") return "bg-red-soft";
  return "";
}

function strengthTextColor(s: string) {
  if (s === "strong") return "text-forest-light";
  if (s === "ok") return "text-amber";
  if (s === "weak") return "text-red-soft";
  return "text-ink-muted";
}

function formatMinutes(m: number) {
  if (m < 60) return `${m} min`;
  const h = (m / 60).toFixed(1);
  return `${h} hrs`;
}

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildInfo | null>(null);
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [topics, setTopics] = useState<TopicMastery[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!token || !user) return;
    if (user.role !== "parent") {
      setDataLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/api/parent/children`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ChildInfo[]) => {
        setChildren(data);
        if (data.length > 0) setSelectedChild(data[0]);
        else setDataLoading(false);
      })
      .catch(() => setDataLoading(false));
  }, [token, user]);

  useEffect(() => {
    if (!token || !selectedChild) return;
    setDataLoading(true);

    Promise.all([
      fetch(`${BACKEND_URL}/api/parent/child-stats/${selectedChild.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => (r.ok ? r.json() : null)),
      fetch(
        `${BACKEND_URL}/api/parent/topic-mastery/${selectedChild.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then((r) => (r.ok ? r.json() : [])),
      fetch(
        `${BACKEND_URL}/api/parent/sessions/${selectedChild.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([statsData, topicsData, sessionsData]) => {
        setStats(statsData);
        setTopics(topicsData || []);
        setSessions(sessionsData || []);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [token, selectedChild]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-ink-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (user.role !== "parent") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">👋</div>
          <div className="text-ink-mid font-medium">
            This dashboard is for parents only.
          </div>
          <Link
            href="/learn"
            className="text-forest-light underline text-sm mt-2 inline-block"
          >
            Go to Learn
          </Link>
        </div>
      </div>
    );
  }

  const computedStats = stats
    ? [
        {
          val: formatMinutes(stats.minutes_this_week),
          label: "Practice time this week",
          delta: `${stats.total_minutes} min total`,
          up: stats.minutes_this_week > 0 ? true : null,
        },
        {
          val: `${stats.sessions_this_week}`,
          label: "Sessions this week",
          delta: `${stats.total_sessions} total`,
          up: stats.sessions_this_week > 0 ? true : null,
        },
        {
          val: stats.avg_understanding
            ? `${stats.avg_understanding}%`
            : "—",
          label: "Avg understanding",
          delta: "Based on recent assessments",
          up:
            stats.avg_understanding && stats.avg_understanding >= 70
              ? true
              : stats.avg_understanding
                ? false
                : null,
        },
        {
          val: `${stats.current_streak}`,
          label: "Day streak",
          delta: `Longest: ${stats.longest_streak} days`,
          up: stats.current_streak > 0 ? true : null,
        },
      ]
    : fallbackStats;

  const examReadiness = stats?.avg_understanding || 0;

  const weakTopics = topics.filter((t) => t.strength === "weak");
  const okTopics = topics.filter((t) => t.strength === "ok");
  const alertCards = [
    ...weakTopics.slice(0, 2).map((t) => ({
      type: "⚠ Recurring gap",
      topic: t.topic,
      chapter: `${t.subject} · ${t.attempts} attempts`,
      pct: t.accuracy,
      color: "red",
    })),
    ...okTopics.slice(0, 1).map((t) => ({
      type: "⚡ Shaky grasp",
      topic: t.topic,
      chapter: `${t.subject} · ${t.attempts} attempts`,
      pct: t.accuracy,
      color: "amber",
    })),
  ];

  const recentSessions = sessions.slice(0, 4);

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-forest text-white px-4 lg:px-8 h-14 flex items-center justify-between sticky top-0 z-50">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-tight"
        >
          RankerIQ<span className="text-green-light">.</span>
        </Link>
        <div className="flex items-center gap-4 text-[13px] text-white/70">
          <span className="hidden sm:inline">
            {user.name} (Parent)
          </span>
          <button className="bg-[#25D366] text-white px-3.5 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 hover:opacity-85 transition-opacity">
            📱 WhatsApp Report
          </button>
        </div>
      </header>

      <div className="bg-white border-b border-[#e2e2da] px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-forest-light to-forest-mid flex items-center justify-center text-white font-semibold text-base">
            {selectedChild?.avatar_initials?.charAt(0) || "?"}
          </div>
          <div>
            <div className="text-base font-semibold text-[#1a1a18]">
              {selectedChild?.name || "No child linked"}
            </div>
            <div className="text-[12px] text-ink-muted">
              {selectedChild?.grade
                ? `Grade ${selectedChild.grade}`
                : ""}{" "}
              {selectedChild?.board ? `· ${selectedChild.board}` : ""}
            </div>
          </div>
          {children.length > 1 && (
            <select
              value={selectedChild?.id || ""}
              onChange={(e) => {
                const c = children.find((ch) => ch.id === e.target.value);
                if (c) setSelectedChild(c);
              }}
              className="ml-4 bg-white border border-[#e2e2da] rounded-lg px-2 py-1 text-sm"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {stats && stats.current_streak > 0 && (
          <div className="bg-amber-pale text-amber border border-amber-light px-3 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5">
            🔥 {stats.current_streak}-day streak
          </div>
        )}
      </div>

      {dataLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-ink-muted text-sm">Loading dashboard data...</div>
        </div>
      ) : (
        <main className="max-w-[1100px] mx-auto px-4 lg:px-8 py-8">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
            Learning health — this week
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-5 mb-6">
            <div className="bg-forest rounded-2xl p-6 text-white flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-30 h-30 rounded-full bg-white/[0.04]" />
              <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-white/[0.03]" />
              <div className="text-[11px] font-medium uppercase tracking-wider text-white/60 mb-2">
                Exam Readiness Score
              </div>
              <div className="relative w-[120px] h-[120px] my-2">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#7ec89a"
                    strokeWidth="8"
                    strokeDasharray={`${examReadiness * 3.267} ${100 * 3.267}`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-[family-name:var(--font-display)] text-4xl text-white leading-none">
                    {examReadiness || "—"}
                  </span>
                  <span className="text-[12px] text-white/50">/100</span>
                </div>
              </div>
              <div className="text-[13px] text-white/70 mt-1">
                {selectedChild?.grade
                  ? `Grade ${selectedChild.grade} · All subjects`
                  : ""}
              </div>
              {weakTopics.length > 0 && (
                <div className="bg-amber/20 text-[#e9a84c] border border-amber/25 px-3 py-1 rounded-full text-[12px] mt-3 font-medium">
                  Needs attention in {weakTopics.length} topic
                  {weakTopics.length > 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {computedStats.map((s, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#e2e2da] rounded-xl p-4 shadow-[0_2px_8px_rgba(26,58,42,0.06)]"
                >
                  <div
                    className={`font-[family-name:var(--font-display)] text-[28px] leading-none ${
                      s.up === true
                        ? "text-forest-light"
                        : s.up === false
                          ? "text-amber"
                          : "text-[#1a1a18]"
                    }`}
                  >
                    {s.val}
                  </div>
                  <div className="text-[12px] text-ink-muted mt-1">
                    {s.label}
                  </div>
                  <div
                    className={`text-[11px] mt-1.5 flex items-center gap-1 ${
                      s.up === true
                        ? "text-forest-light"
                        : s.up === false
                          ? "text-red-soft"
                          : "text-ink-muted"
                    }`}
                  >
                    {s.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {alertCards.length > 0 && (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
                Topics that need your attention
              </div>
              <div className="grid md:grid-cols-3 gap-3 mb-6">
                {alertCards.map((a, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#e2e2da] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(26,58,42,0.06)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(26,58,42,0.1)] transition-all cursor-pointer"
                  >
                    <div className="p-3.5 border-b border-[#e2e2da]">
                      <div
                        className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                          a.color === "red"
                            ? "text-red-soft"
                            : a.color === "amber"
                              ? "text-amber"
                              : "text-forest-light"
                        }`}
                      >
                        {a.type}
                      </div>
                      <div className="text-[15px] font-semibold text-[#1a1a18] leading-tight">
                        {a.topic}
                      </div>
                      <div className="text-[11px] text-ink-muted mt-0.5">
                        {a.chapter}
                      </div>
                    </div>
                    <div className="p-3.5 flex items-center justify-between">
                      <span className="text-[12px] text-ink-mid">
                        Accuracy{" "}
                        <strong className="text-[#1a1a18]">{a.pct}%</strong>
                      </span>
                      <div className="flex-1 ml-3 h-1 bg-sage rounded-full overflow-hidden">
                        <div
                          className={`h-1 rounded-full ${
                            a.color === "red"
                              ? "bg-red-soft"
                              : a.color === "amber"
                                ? "bg-amber"
                                : "bg-forest-light"
                          }`}
                          style={{ width: `${a.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="grid lg:grid-cols-2 gap-5 mb-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
                Topic mastery
              </div>
              <div className="bg-white border border-[#e2e2da] rounded-xl p-5 shadow-[0_2px_8px_rgba(26,58,42,0.06)]">
                {topics.length === 0 ? (
                  <div className="text-sm text-ink-muted text-center py-6">
                    No topic data yet. Complete some tutoring sessions first.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {topics.map((t, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="text-[13px] text-[#1a1a18] w-[180px] shrink-0">
                          {t.topic}
                        </div>
                        <div className="flex-1 h-2 bg-sage rounded overflow-hidden">
                          <div
                            className={`h-2 rounded transition-all duration-1000 ${strengthColor(t.strength)}`}
                            style={{ width: `${t.accuracy}%` }}
                          />
                        </div>
                        <div
                          className={`text-[12px] font-medium w-9 text-right shrink-0 ${strengthTextColor(t.strength)}`}
                        >
                          {t.accuracy > 0 ? `${t.accuracy}%` : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
                Recent sessions
              </div>
              <div className="bg-white border border-[#e2e2da] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(26,58,42,0.06)]">
                {recentSessions.length === 0 ? (
                  <div className="text-sm text-ink-muted text-center py-6">
                    No sessions yet.
                  </div>
                ) : (
                  recentSessions.map((s, i) => (
                    <div
                      key={i}
                      className="px-5 py-3.5 border-b border-[#e2e2da] last:border-b-0 flex gap-3 items-start"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 bg-[#e8f0ff]">
                        🎙️
                      </div>
                      <div className="flex-1 min-w-0">
                        <strong className="text-[13px] font-medium text-[#1a1a18] block">
                          {s.subject} · Grade {s.grade}
                        </strong>
                        <span className="text-[12px] text-ink-muted">
                          {s.message_count} messages
                          {s.duration_minutes
                            ? ` · ${s.duration_minutes} min`
                            : ""}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-muted shrink-0 mt-0.5">
                        {new Date(s.started_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {stats?.recent_assessments && stats.recent_assessments.length > 0 && (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
                Recent AI Insights
              </div>
              <div className="space-y-3 mb-6">
                {stats.recent_assessments
                  .filter((a) => a.parent_summary)
                  .slice(0, 2)
                  .map((a, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#e2e2da] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(26,58,42,0.06)]"
                    >
                      <div className="p-5 space-y-2">
                        {a.parent_summary && (
                          <div className="text-[13px] text-ink-mid leading-relaxed">
                            {a.parent_summary}
                          </div>
                        )}
                        {a.home_tip && (
                          <div className="p-3 bg-amber-pale border-l-[3px] border-amber rounded-r-lg">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-amber mb-1">
                              Home tip
                            </div>
                            <div className="text-[12px] text-ink-mid leading-relaxed">
                              {a.home_tip}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          <div className="grid md:grid-cols-3 gap-3 mb-8">
            {[
              {
                icon: "🗓️",
                title: "Set a study reminder",
                desc: "Set a daily nudge for your child.",
              },
              {
                icon: "📊",
                title: "Download report card",
                desc: "Full PDF with all topics and trend analysis.",
              },
              {
                icon: "🎯",
                title: "Request focus session",
                desc: "Ask the AI to run a dedicated session on weak topics.",
              },
            ].map((a, i) => (
              <button
                key={i}
                className="bg-white border border-[#e2e2da] rounded-xl p-4 text-left hover:border-forest-light hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(26,58,42,0.1)] transition-all shadow-[0_2px_8px_rgba(26,58,42,0.06)]"
              >
                <div className="text-xl mb-2">{a.icon}</div>
                <span className="text-[13px] font-semibold text-[#1a1a18] block">
                  {a.title}
                </span>
                <span className="text-[11px] text-ink-muted mt-0.5 block">
                  {a.desc}
                </span>
              </button>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}
