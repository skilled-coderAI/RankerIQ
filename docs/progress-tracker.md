# RankerIQ — Production Progress Tracker

> **Reference:** [production-design.md](./production-design.md)
> **Started:** 2026-03-24
> **Target:** Production-ready on GCP Compute Engine

---

## Overall Progress

| Phase | Status | Tasks | Completion |
|-------|--------|-------|------------|
| P0 — Critical Foundation | IN PROGRESS | 12/28 | 43% |
| P1 — Core Experience | IN PROGRESS | 14/14 | 100% |
| P2 — Intelligence Layer (+ OpenFang + Hands) | NOT STARTED | 0/28 | 0% |
| P3 — Learning Enhancements (+ Collector) | NOT STARTED | 0/14 | 0% |
| P4 — Future Features (+ Clip) | NOT STARTED | 0/15 | 0% |
| Security | IN PROGRESS | 5/13 | 38% |
| Monitoring | NOT STARTED | 0/6 | 0% |
| **Overall** | **IN PROGRESS** | **31/118** | **26%** |

---

## P0 — Critical Foundation (Must complete before any deployment)

**Estimated total:** 4–6 days
**Status:** IN PROGRESS (12/28 tasks)

### P0.1 PostgreSQL Migration

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 1 | Add `sqlx` + `argon2` crates to `backend/Cargo.toml` | [x] | | 2026-03-25 | sqlx 0.8 + argon2 0.5 added |
| 2 | Create `backend/migrations/001_init.sql` with full schema (users, sessions, messages, assessments, topic_mastery, streaks, badges) | [x] | | 2026-03-25 | `20260325000000_init.sql`, 8 tables with indexes |
| 3 | Replace `UserStore` (in-memory HashMap) with PostgreSQL queries via `sqlx` | [x] | | 2026-03-25 | `main.rs` rewritten: PgPool in AppState, auto-migrations |
| 4 | Migrate `auth.rs` — signup, login, me endpoints to use PostgreSQL | [x] | | 2026-03-25 | Full rewrite: DbUser, sqlx queries, all 7 API tests pass |
| 5 | Migrate `agents.rs` — persist chat messages and sessions to PostgreSQL after each exchange | [x] | | 2026-03-25 | Full rewrite: session mgmt, message persistence, streak tracking |
| 6 | Seed demo users (`student@demo.com`, `parent@demo.com`) via migration SQL | [x] | | 2026-03-25 | Seeded via Rust code with Argon2id hashes at startup |
| 7 | Add `DATABASE_URL` env var handling in `main.rs` | [x] | | 2026-03-25 | Required env var, panics if missing |

### P0.2 Security — Argon2id Password Hashing

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 8 | Replace `simple_hash()` in `auth.rs` with Argon2id (use `argon2` crate) | [x] | | 2026-03-25 | `hash_password()` + `verify_password()` using Argon2id |
| 9 | Remove hardcoded JWT fallback `"rankeriq-secret-2026"` — require `JWT_SECRET` env var or fail on startup | [x] | | 2026-03-25 | `main.rs` panics if JWT_SECRET not set |

### P0.3 Docker & Deployment

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 10 | Create `backend/Dockerfile` (multi-stage Rust build) | [x] | | 2026-03-25 | rust:1.85-slim → debian:bookworm-slim |
| 11 | Create `app/Dockerfile` (multi-stage Next.js standalone build) | [x] | | 2026-03-25 | node:22-alpine, standalone output |
| 12 | Create root `docker-compose.yml` (postgres + backend + frontend + nginx) | [x] | | 2026-03-25 | + `docker-compose.local.yml` for dev (PG only) |
| 13 | Create `nginx/nginx.conf` with reverse proxy, SSL, rate limiting, security headers | [x] | | 2026-03-25 | Full production config: TLS 1.2/1.3, HSTS, CSP, rate limiting, all routes |
| 14 | Create `.env.example` with all required env vars documented | [x] | | 2026-03-25 | All vars documented |
| 15 | Restrict CORS in `main.rs` — whitelist production domain only (remove `allow_origin(Any)`) | [ ] | | | Still `Any` for local dev, change at deploy |

### P0.4 GCP VM Provisioning

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 16 | Provision e2-medium VM (Ubuntu 24.04, 50 GB SSD) on GCP | [ ] | | | |
| 17 | Reserve static external IP | [ ] | | | |
| 18 | Configure GCP firewall rules (allow 22, 80, 443 only) | [ ] | | | |
| 19 | Install Docker + Docker Compose on VM | [ ] | | | |
| 20 | Set up domain DNS (A record → VM IP) via Cloudflare | [ ] | | | |
| 21 | Run Certbot for Let's Encrypt SSL certificate | [ ] | | | |
| 22 | Deploy with `docker compose up -d` and verify health endpoint | [ ] | | | |

### P0.5 CI/CD

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 23 | Create `.github/workflows/deploy.yml` (SSH deploy on push to main) | [ ] | | | |
| 24 | Add `GCP_VM_IP` and `GCP_SSH_KEY` as GitHub repository secrets | [ ] | | | |
| 25 | Test full deploy cycle: push → build → deploy → verify | [ ] | | | |

### P0.6 Backups

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 26 | Create GCS bucket `rankeriq-backups` | [ ] | | | |
| 27 | Set up daily cron: `pg_dump` → gzip → upload to GCS | [ ] | | | |
| 28 | Test backup restore procedure | [ ] | | | |

**P0 Completion:** 12 / 28 tasks

---

## P1 — Core Experience (Ship these for a usable product)

**Estimated total:** 4–6 days
**Status:** COMPLETE (14/14 tasks)

### P1.1 Session Continuity

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 29 | Backend: `POST /api/sessions` — create new session | [x] | | 2026-03-25 | `create_session` handler in agents.rs, closes old sessions first |
| 30 | Backend: `GET /api/sessions/active` — fetch last incomplete session with messages | [x] | | 2026-03-25 | `get_active_session` returns session + all messages |
| 31 | Backend: `POST /api/sessions/:id/end` — mark session complete | [x] | | 2026-03-25 | `end_session` sets ended_at, updates total_minutes in streaks |
| 32 | Backend: Save every message to `messages` table inside `/api/chat` handler | [x] | | 2026-03-25 | User + assistant messages saved, message_count updated |
| 33 | Frontend: On `/learn` load, fetch active session and restore messages | [x] | | 2026-03-25 | Fetches `/api/sessions/active`, restores subject/grade/language/messages |
| 34 | Frontend: Show "Welcome back" prompt when resuming an incomplete session | [x] | | 2026-03-25 | 4-second banner: "Welcome back! Continuing your previous session." |

### P1.2 Live Parent Dashboard

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 35 | Backend: `GET /api/parent/child-stats/:student_id` — aggregate stats from assessments | [x] | | 2026-03-25 | `child_stats` in dashboard.rs with parent auth check |
| 36 | Backend: `GET /api/parent/topic-mastery/:student_id` — from topic_mastery table | [x] | | 2026-03-25 | `topic_mastery` in dashboard.rs |
| 37 | Backend: `GET /api/parent/sessions/:student_id` — recent sessions with summaries | [x] | | 2026-03-25 | `recent_sessions` in dashboard.rs, last 20 with duration |
| 38 | Frontend: Replace hardcoded `statsData`, `alertCards`, `topics`, `feedItems` in `dashboard/page.tsx` with API calls | [x] | | 2026-03-25 | Full rewrite: fetches from 3 APIs, computes stats/alerts/topics live |
| 39 | Frontend: Add parent-child linking (parent sees their linked child's data) | [x] | | 2026-03-25 | Fetches children list, child selector dropdown, auth-gated per child |

### P1.3 Streaks, XP & Badges

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 40 | Backend: Update `streaks` table after each session (current_streak, total_sessions, total_minutes) | [x] | | 2026-03-25 | `update_streak` UPSERT in agents.rs, called on session create/chat |
| 41 | Backend: `GET /api/student/profile` — return streak, XP, badges, level | [x] | | 2026-03-25 | `student_profile` in dashboard.rs, XP formula + 10-level system |
| 42 | Frontend: Show persistent streak counter in `/learn` header (from DB, not local state) | [x] | | 2026-03-25 | Fetches `/api/student/profile`, shows "X day streak" from DB |

**P1 Completion:** 14 / 14 tasks

---

## P2 — Intelligence Layer (Differentiators)

**Estimated total:** 8–12 days
**Status:** NOT STARTED (0/28 tasks)

### P2.1 OpenFang Setup & Built-In Tutor Agent

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 43 | Install OpenFang binary on VM (`curl -fsSL https://openfang.sh/install | sh`) | [ ] | | | |
| 44 | Run `openfang init` and configure `openfang.toml` (default model, memory, network) | [ ] | | | |
| 45 | Fork OpenFang's `agents/tutor/agent.toml` — customize for CBSE/ICSE, Hindi/Hinglish, Indian examples | [ ] | | | |
| 46 | Configure persistent memory directory and SQLite storage for per-student sessions | [ ] | | | |
| 47 | Point Next.js `/api/chat` route at OpenFang's `/v1/chat/completions` endpoint | [ ] | | | |
| 48 | Verify tutor agent uses `memory_store`/`memory_recall` for cross-session context | [ ] | | | |
| 49 | Add OpenFang container to root `docker-compose.yml` (port 4200, volume persistence) | [ ] | | | |

### P2.2 Spaced Repetition Engine

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 50 | Add `next_review_at` column to `topic_mastery` table | [ ] | | | |
| 51 | Backend: After each assessment, calculate next review date using SM-2 algorithm | [ ] | | | |
| 52 | Backend: `GET /api/student/reviews-due` — topics due for review today | [ ] | | | |
| 53 | Frontend: Show "Topics to review today" card on `/learn` page | [ ] | | | |

### P2.3 Auto-Assessment After Sessions

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 54 | Backend: Trigger `/api/assess` automatically after every 5 chat exchanges | [ ] | | | |
| 55 | Backend: Parse AssessmentAgent JSON response and save to `assessments` table | [ ] | | | |
| 56 | Backend: Update `topic_mastery` table based on assessment results | [ ] | | | |

### P2.4 OpenFang WhatsApp Reports

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 57 | Set up WhatsApp Business API / Twilio integration | [ ] | | | |
| 58 | Configure OpenFang WhatsApp channel adapter in `openfang.toml` | [ ] | | | |
| 59 | Wire InsightAgent output to WhatsApp — send daily summary to parent | [ ] | | | |

### P2.5 Researcher Hand — Curriculum Knowledge Base

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 60 | Activate Researcher Hand (`openfang hand activate researcher`) | [ ] | | | |
| 61 | Configure HAND.toml overrides: target NCERT Grade 5-12 Maths + Science | [ ] | | | |
| 62 | Set weekly schedule for curriculum crawl and knowledge graph build | [ ] | | | |
| 63 | Connect Researcher output to PostgreSQL (knowledge graph + practice Q-bank) | [ ] | | | |
| 64 | Wire tutor fact-checking: Researcher verifies TutorAgent explanations against NCERT | [ ] | | | |

### P2.6 Predictor Hand — Student Performance Forecasting

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 65 | Activate Predictor Hand (`openfang hand activate predictor`) | [ ] | | | |
| 66 | Configure daily schedule: input from assessments + topic_mastery tables | [ ] | | | |
| 67 | Output exam readiness scores with confidence intervals to `assessments` table | [ ] | | | |
| 68 | Wire at-risk student alerts to parent dashboard + WhatsApp channel | [ ] | | | |
| 69 | Frontend: Replace hardcoded "72/100" Exam Readiness Score with Predictor output | [ ] | | | |
| 70 | Track Brier scores over time — display prediction accuracy in admin view | [ ] | | | |

**P2 Completion:** 0 / 28 tasks

---

## P3 — Learning Enhancements

**Estimated total:** 8–11 days
**Status:** NOT STARTED (0/14 tasks)

### P3.1 Adaptive Difficulty Pipeline

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 71 | Backend: Query last 5 assessments for student before each chat call | [ ] | | | |
| 72 | Backend: Inject accuracy/difficulty data into TutorAgent system prompt | [ ] | | | |
| 73 | Frontend: Show current difficulty level indicator in `/learn` header | [ ] | | | |

### P3.2 Practice Mode

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 74 | Backend: `POST /api/practice/generate` — generate quiz questions for weak topics | [ ] | | | |
| 75 | Backend: `POST /api/practice/submit` — grade answers, update topic_mastery | [ ] | | | |
| 76 | Frontend: Create `/practice` page with MCQ, fill-in-blank, timer UI | [ ] | | | |
| 77 | Frontend: Show results with step-by-step explanations | [ ] | | | |

### P3.3 Visual Math & Science Aids

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 78 | Design SVG templates for common visualizations (fractions, number lines, geometry) | [ ] | | | |
| 79 | Backend: TutorAgent returns `[visual:fraction:2/4=1/2]` markers in responses | [ ] | | | |
| 80 | Frontend: Parse visual markers and render inline SVG components | [ ] | | | |
| 81 | Frontend: Create `FractionVisual`, `NumberLine`, `GeometryDiagram` components | [ ] | | | |

### P3.4 Collector Hand — Curriculum Change Monitoring

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 82 | Activate Collector Hand (`openfang hand activate collector`) | [ ] | | | |
| 83 | Configure targets: cbse.gov.in, ncert.nic.in, ICSE council pages | [ ] | | | |
| 84 | Set daily schedule for syllabus change detection | [ ] | | | |

**P3 Completion:** 0 / 14 tasks

---

## P4 — Future Features

**Estimated total:** 10–14 days
**Status:** NOT STARTED (0/15 tasks)

### P4.1 Curriculum Knowledge Graph

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 85 | Model CBSE Grade 5-12 Maths curriculum as graph (chapters → topics → concepts → prerequisites) | [ ] | | | |
| 86 | Store graph in PostgreSQL (or OpenFang knowledge graph) | [ ] | | | |
| 87 | Backend: `GET /api/curriculum/graph/:grade/:subject` — return graph for frontend | [ ] | | | |
| 88 | Frontend: Visual curriculum map showing student progress through the graph | [ ] | | | |

### P4.2 Homework Photo Upload

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 89 | Frontend: Camera/upload button in `/learn` chat input | [ ] | | | |
| 90 | Backend: `POST /api/chat/image` — send image to GPT-4o-mini vision for OCR | [ ] | | | |
| 91 | Backend: Extract problem text, feed to TutorAgent as context | [ ] | | | |

### P4.3 Offline PWA

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 92 | Add `next-pwa` or custom service worker to Next.js app | [ ] | | | |
| 93 | Cache last session content and practice sets for offline access | [ ] | | | |
| 94 | Queue outgoing messages when offline, send on reconnect | [ ] | | | |
| 95 | Add `manifest.json` with app name, icons, theme colors | [ ] | | | |

### P4.4 Clip Hand — Educational Video Shorts

| # | Task | Status | Owner | Date Completed | Notes |
|---|------|--------|-------|----------------|-------|
| 96 | Install FFmpeg + yt-dlp on VM | [ ] | | | |
| 97 | Activate Clip Hand (`openfang hand activate clip`) | [ ] | | | |
| 98 | Configure: target educational YouTube channels, output 60s topic clips with Hindi/English captions | [ ] | | | |
| 99 | Frontend: Display curated learning clips in `/learn` sidebar or `/practice` page | [ ] | | | |

**P4 Completion:** 0 / 15 tasks

---

## Security Hardening Checklist

| # | Task | Status | Date Completed |
|---|------|--------|----------------|
| S1 | Replace `simple_hash()` with Argon2id | [x] | 2026-03-25 |
| S2 | Remove hardcoded JWT fallback — require env var | [x] | 2026-03-25 |
| S3 | Restrict CORS to production domain | [ ] | |
| S4 | Nginx rate limiting configured | [x] | 2026-03-25 |
| S5 | Security headers (HSTS, CSP, X-Frame-Options) in Nginx | [x] | 2026-03-25 |
| S6 | CSRF protection on state-changing endpoints | [ ] | |
| S7 | Input validation on all endpoints | [ ] | |
| S8 | Parameterized queries only (`sqlx`) — no string concatenation | [x] | 2026-03-25 |
| S9 | Log auth failures for abuse detection | [ ] | |
| S10 | GCP firewall: only 22, 80, 443 open | [ ] | |
| S11 | SSH key-only auth (disable password) | [ ] | |
| S12 | Enable `unattended-upgrades` on VM | [ ] | |
| S13 | Run `cargo audit` + `npm audit` — zero critical vulnerabilities | [ ] | |

**Security Completion:** 5 / 13 tasks

---

## Monitoring & Observability Checklist

| # | Task | Status | Date Completed |
|---|------|--------|----------------|
| M1 | GCP Cloud Logging agent installed on VM | [ ] | |
| M2 | GCP Uptime Check on `/health` (every 5 min) | [ ] | |
| M3 | Alert policy: email on downtime > 5 min | [ ] | |
| M4 | Docker container restart policies verified | [ ] | |
| M5 | Daily backup cron verified (pg_dump → GCS) | [ ] | |
| M6 | Backup restore tested successfully | [ ] | |

**Monitoring Completion:** 0 / 6 tasks

---

## Milestone Summary

| Milestone | Tasks | Done | Remaining | Target Date |
|-----------|-------|------|-----------|-------------|
| **P0: Production Foundation** | 28 | 12 | 16 | TBD |
| **P1: Core Experience** | 14 | 14 | 0 | COMPLETE |
| **P2: Intelligence Layer + OpenFang + Hands** | 28 | 0 | 28 | TBD |
| **P3: Learning Enhancements + Collector** | 14 | 0 | 14 | TBD |
| **P4: Future Features + Clip** | 15 | 0 | 15 | TBD |
| **Security** | 13 | 5 | 8 | TBD |
| **Monitoring** | 6 | 0 | 6 | TBD |
| **TOTAL** | **118** | **31** | **87** | — |

---

## Change Log

| Date | Change | By |
|------|--------|----|
| 2026-03-24 | Initial tracker created from production-design.md | — |
| 2026-03-24 | Added OpenFang Hands: Researcher (P2.5, 5 tasks), Predictor (P2.6, 6 tasks), Collector (P3.4, 3 tasks), Clip (P4.4, 4 tasks). Total tasks 97 → 116 | — |
| 2026-03-25 | Deep GitHub source research: discovered built-in `tutor` agent, OpenAI-compatible API, 8 Hands (not 7, added Trader as NOT FIT), JS SDK, MCP server mode. Rewrote P2.1 with 7 tasks (fork tutor agent, OpenFang Docker, `/v1/chat/completions` integration). Updated architecture diagram. Total tasks 116 → 118 | — |
| 2026-03-25 | **Local stack setup complete.** PostgreSQL running in Docker, backend compiles and runs with sqlx + Argon2id. All auth endpoints tested (login, signup, me, duplicate rejection, wrong password). Completed tasks: 1-4, 6-12, 14, S1, S2, S8. Progress: 0/118 → 14/118 (12%) | — |
| 2026-03-25 | **P1 COMPLETE.** agents.rs rewritten (612 lines): session create/active/end, message persistence, streak UPSERT. dashboard.rs created (464 lines): 5 endpoints for child-stats, topic-mastery, sessions, children, student-profile with XP/levels. Dashboard page fully rewritten with live API calls. nginx.conf production config added with SSL/rate-limiting/security headers. `cargo check` + `next build` both pass clean. Progress: 14/118 → 31/118 (26%) | — |
