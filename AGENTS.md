# Repository Guidelines

## Project Overview

RankerIQ (also referred to as **Kalam.ai** / **vidya.ai**) is an AI-powered voice-first tutoring platform targeting Indian students in Grades 5-12 (CBSE/ICSE), with support for Hindi, English, and Hinglish. The platform uses a **Rust backend** powered by the [swarms-rs](https://github.com/The-Swarm-Corporation/swarms-rs) multi-agent orchestration framework and a **Next.js 16** frontend with Tailwind CSS v4.

## Project Structure & Module Organization

```
app/                        Next.js 16 frontend (React 19, TypeScript, Tailwind v4)
  src/
    app/
      api/
        chat/route.ts         Proxies chat requests to Rust backend
        tts/route.ts          ElevenLabs text-to-speech API
      dashboard/page.tsx      Parent dashboard (static mockup data)
      learn/page.tsx          Voice-first tutoring chat (auth-gated)
      login/page.tsx          Login page with demo account buttons
      signup/page.tsx         Signup with student/parent role selection
      layout.tsx              Root layout with AuthProvider
      page.tsx                Landing page (Hero, HowItWorks, Pricing, etc.)
      globals.css             Tailwind theme (saffron/ink/cream palette)
    components/               Navbar, Hero, VoiceSection, Pricing, etc.
    context/AuthContext.tsx    Client-side auth state (JWT via Rust backend)
    hooks/useVoice.ts         Browser STT + ElevenLabs TTS hook
  .env.local                  OPENAI_API_KEY, ELEVENLABS_API_KEY, BACKEND_URL
  package.json                Next 16, React 19, openai, elevenlabs-js, jose

backend/                    Rust backend (swarms-rs + Axum)
  src/
    main.rs                   Axum server, routes, CORS, app state
    agents.rs                 swarms-rs agents: TutorAgent, AssessmentAgent, InsightAgent
    auth.rs                   JWT auth, login/signup/me, in-memory user store
  Cargo.toml                  swarms-rs 0.2.1, axum 0.8, jsonwebtoken 9, tokio
  .env                        OPENAI_API_KEY, OPENAI_BASE_URL, JWT_SECRET

docs/                       Design assets and specifications
  Kalam_PRD.docx              Product Requirements Document (binary)
  kalam_prd.md                PRD placeholder (needs pandoc conversion)
  kalam_wireframe.html        Full website wireframe (interactive HTML)
  website_mockup.html         Premium website mockup (interactive HTML)
  parent_dashboard.html       Parent dashboard mockup (Chart.js)
  *.md                        Companion summaries for each HTML asset
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | Next.js (Turbopack) | 16.2 |
| UI library | React | 19.2 |
| Styling | Tailwind CSS | 4.2 |
| Backend framework | Axum | 0.8 |
| Agent orchestration | swarms-rs | 0.2.1 |
| LLM provider | OpenAI (gpt-4o-mini) | via swarms-rs |
| Voice TTS | ElevenLabs | eleven_flash_v2_5 |
| Voice STT | Web Speech API | Browser-native |
| Auth | JWT (jsonwebtoken crate + jose) | — |
| Language | TypeScript 5.9 / Rust 2024 edition | — |

## Architecture

```
Frontend (Next.js :3000)          Backend (Rust/Axum :8080)
┌─────────────────────┐          ┌──────────────────────────────┐
│ /login, /signup      │────────▶│ POST /api/auth/login         │
│                      │         │ POST /api/auth/signup        │
│ /learn (auth-gated)  │         │ GET  /api/auth/me            │
│   └─ /api/chat proxy │────────▶│ POST /api/chat               │
│   └─ /api/tts (local)│         │   └─ TutorAgent (swarms-rs)  │
│                      │         │ POST /api/assess             │
│ /dashboard           │         │   └─ ConcurrentWorkflow      │
│                      │         │       ├─ AssessmentAgent      │
└─────────────────────┘          │       └─ InsightAgent         │
                                 └──────────────────────────────┘
```

## swarms-rs Agents

- **TutorAgent** — Single agent via `client.agent_builder()`. Socratic teaching, Hindi/English/Hinglish, CBSE/ICSE curriculum. Runs on `POST /api/chat`.
- **AssessmentAgent** — Analyzes conversations for misconceptions, understanding level, and recommended difficulty. Returns structured JSON.
- **InsightAgent** — Generates parent-friendly session summaries with actionable home tips.
- **ConcurrentWorkflow** — Runs AssessmentAgent and InsightAgent in parallel via `swarms_rs::structs::concurrent_workflow::ConcurrentWorkflow`. Runs on `POST /api/assess`.

## Authentication

- JWT tokens issued by Rust backend (jsonwebtoken crate, HS256, 7-day expiry)
- Frontend stores token in `localStorage`, passes via `Authorization: Bearer <token>` header
- Demo accounts pre-seeded: `student@demo.com` / `parent@demo.com` (password: `demo1234`)
- Protected routes: `/learn` redirects to `/login` if unauthenticated

## Key Design References

- **Website wireframe**: `docs/kalam_wireframe.html` — desktop layout with voice demo widget, grade journey track, and trust indicators
- **Website mockup**: `docs/website_mockup.html` — premium design using Playfair Display + Sora fonts, saffron/ink/cream palette
- **Parent dashboard**: `docs/parent_dashboard.html` — forest/amber theme, learning health metrics, attention topics, score trends
- **PRD**: `docs/Kalam_PRD.docx` — convert with `pandoc Kalam_PRD.docx -o kalam_prd.md` for readable markdown

## Running the Application

```bash
# Terminal 1 — Rust backend (requires Rust stable 1.85+)
cd backend
# Configure .env with OPENAI_API_KEY
cargo run

# Terminal 2 — Next.js frontend
cd app
npm install
npm run dev
```

## Development Commands

| Task | Command | Directory |
|------|---------|-----------|
| Run frontend | `npm run dev` | `app/` |
| Build frontend | `npm run build` | `app/` |
| Lint frontend | `npm run lint` | `app/` |
| Run backend | `cargo run` | `backend/` |
| Check backend | `cargo check` | `backend/` |
| Build backend (release) | `cargo build --release` | `backend/` |

## Conventions

- Frontend uses Tailwind CSS v4 `@theme` for custom colors (saffron, forest, cream, ink palette)
- Fonts: Playfair Display (display/headings), Sora (body)
- Components are in `app/src/components/`, pages in `app/src/app/`
- All API routes in `app/src/app/api/` are thin proxies to the Rust backend (except TTS which calls ElevenLabs directly)
- Rust code uses `tracing` for structured logging, `dotenv` for env vars
- No database — user store is in-memory (swap for a real DB in production)
