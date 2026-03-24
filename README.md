# RankerIQ

**AI-powered voice-first tutoring platform for Indian school children (Grades 5-12)**

RankerIQ is an AI tutor your child speaks to — in Hindi, English, or Hinglish. It listens, understands, and teaches back using the Socratic method. No videos to watch passively. No worksheets to ignore.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Start the Rust Backend](#3-start-the-rust-backend)
  - [4. Start the Next.js Frontend](#4-start-the-nextjs-frontend)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [Multi-Agent System (swarms-rs)](#multi-agent-system-swarms-rs)
  - [TutorAgent](#tutoragent)
  - [AssessmentAgent](#assessmentagent)
  - [InsightAgent](#insightagent)
  - [ConcurrentWorkflow](#concurrentworkflow)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Auth Endpoints (Rust Backend)](#auth-endpoints-rust-backend)
  - [Agent Endpoints (Rust Backend)](#agent-endpoints-rust-backend)
  - [Frontend API Routes (Next.js)](#frontend-api-routes-nextjs)
- [Frontend Pages](#frontend-pages)
- [Voice System](#voice-system)
- [Design System](#design-system)
- [Development Commands](#development-commands)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [License](#license)

---

## Features

- **Voice-First Tutoring** — Students speak questions in Hindi, English, or Hinglish; the AI tutor responds conversationally
- **Socratic Teaching Method** — Never gives answers directly; guides with questions ("kyun?", "kaise?")
- **Multi-Agent Orchestration** — Powered by [swarms-rs](https://github.com/The-Swarm-Corporation/swarms-rs), a production-grade Rust framework for multi-agent systems
- **Real-Time Assessment** — `AssessmentAgent` and `InsightAgent` run concurrently to evaluate understanding and generate parent summaries
- **Adaptive Difficulty** — Adjusts question complexity based on student performance patterns
- **9 Indian Languages** — Hindi, English, Hinglish, Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati
- **Parent Dashboard** — Exam readiness scores, topic mastery maps, session transcripts, AI-generated insights
- **Voice TTS** — Natural speech output via ElevenLabs (eleven_flash_v2_5 model)
- **Voice STT** — Browser-native speech recognition via Web Speech API
- **JWT Authentication** — Secure login/signup with role-based access (student vs parent)
- **CBSE & ICSE Support** — Covers Grades 5-12 across Mathematics, Science, and English

---

## Architecture

```
┌─────────────────────────────────┐      ┌───────────────────────────────────────┐
│     Next.js Frontend (:3000)    │      │     Rust Backend (:8080)              │
│                                 │      │     Axum + swarms-rs                  │
│  Landing Page (/)               │      │                                       │
│  Login (/login)          ──────────────▶  POST /api/auth/login                │
│  Signup (/signup)        ──────────────▶  POST /api/auth/signup               │
│                                 │      │  GET  /api/auth/me                    │
│  Learn (/learn)                 │      │                                       │
│  ├── Chat UI                    │      │  POST /api/chat                       │
│  │   └── /api/chat (proxy) ────────────▶    └── TutorAgent                    │
│  ├── Voice Input (Web Speech)   │      │        (swarms-rs agent_builder)      │
│  └── Voice Output               │      │                                       │
│      └── /api/tts (ElevenLabs)  │      │  POST /api/assess                    │
│                                 │      │    └── ConcurrentWorkflow             │
│  Dashboard (/dashboard)         │      │        ├── AssessmentAgent            │
│  └── Parent view (static data)  │      │        └── InsightAgent              │
└─────────────────────────────────┘      └───────────────────────────────────────┘
```

The frontend communicates with the Rust backend via HTTP. The chat API route (`/api/chat`) in Next.js is a thin proxy that forwards requests (with the JWT auth header) to the Rust backend. TTS is handled directly by the frontend via the ElevenLabs API.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js (Turbopack) | 16.2 | Server-rendered React application |
| **UI** | React | 19.2 | Component library |
| **Styling** | Tailwind CSS | 4.2 | Utility-first CSS with custom theme |
| **Backend** | Axum | 0.8 | Async Rust HTTP framework |
| **Agent Framework** | swarms-rs | 0.2.1 | Multi-agent orchestration (agents, concurrent workflows) |
| **LLM** | OpenAI GPT-4o-mini | — | Language model via swarms-rs OpenAI provider |
| **Voice TTS** | ElevenLabs | eleven_flash_v2_5 | Text-to-speech in Indian voices |
| **Voice STT** | Web Speech API | Browser-native | Speech-to-text (Hindi, English, regional) |
| **Auth** | JWT | jsonwebtoken (Rust) | Token-based authentication |
| **Async Runtime** | Tokio | 1.x | Rust async runtime |
| **Serialization** | Serde + serde_json | 1.x | JSON handling in Rust |
| **CORS** | tower-http | 0.6 | Cross-origin request handling |
| **Logging** | tracing + tracing-subscriber | 0.1/0.3 | Structured logging |

---

## Prerequisites

- **Rust** stable 1.85+ (for edition 2024 support)
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
- **Node.js** 18+ and npm
- **OpenAI API key** (for GPT-4o-mini via swarms-rs)
- **ElevenLabs API key** (optional, for voice output)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd RankerIQ
```

### 2. Configure Environment Variables

**Rust backend** (`backend/.env`):
```env
RUST_LOG=info
SWARMS_LOG_LEVEL=INFO
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
JWT_SECRET=your-secure-secret-here
```

**Next.js frontend** (`app/.env.local`):
```env
OPENAI_API_KEY=sk-your-openai-key-here
ELEVENLABS_API_KEY=sk_your-elevenlabs-key-here
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### 3. Start the Rust Backend

```bash
cd backend
cargo run
```

First build takes ~2-3 minutes (downloads and compiles swarms-rs + 300 dependencies). Subsequent builds are fast (~10s).

The backend starts on `http://localhost:8080`. Verify with:
```bash
curl http://localhost:8080/health
# Returns: ok
```

### 4. Start the Next.js Frontend

```bash
cd app
npm install
npm run dev
```

The frontend starts on `http://localhost:3000`.

---

## Demo Accounts

Two accounts are pre-seeded in the Rust backend's in-memory user store:

| Role | Email | Password | Redirects to |
|------|-------|----------|-------------|
| **Student** | `student@demo.com` | `demo1234` | `/learn` |
| **Parent** | `parent@demo.com` | `demo1234` | `/dashboard` |

The login page includes one-click buttons to auto-fill these credentials.

---

## Project Structure

```
RankerIQ/
├── app/                              # Next.js 16 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── chat/route.ts     # Proxy to Rust backend /api/chat
│   │   │   │   └── tts/route.ts      # ElevenLabs TTS (direct)
│   │   │   ├── dashboard/page.tsx    # Parent dashboard
│   │   │   ├── learn/page.tsx        # Tutoring chat (auth-gated)
│   │   │   ├── login/page.tsx        # Login page
│   │   │   ├── signup/page.tsx       # Signup page
│   │   │   ├── layout.tsx            # Root layout + AuthProvider
│   │   │   ├── page.tsx              # Landing page
│   │   │   └── globals.css           # Tailwind v4 theme
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Nav with auth state
│   │   │   ├── Hero.tsx              # Hero section with live demo
│   │   │   ├── HowItWorks.tsx        # 3-step explanation
│   │   │   ├── VoiceSection.tsx      # Voice AI feature showcase
│   │   │   ├── AdaptiveEngine.tsx    # Adaptive practice demo
│   │   │   ├── Testimonials.tsx      # Parent testimonials
│   │   │   ├── Pricing.tsx           # Pricing cards (Free/Pro/Annual)
│   │   │   ├── CTASection.tsx        # Call-to-action
│   │   │   ├── Footer.tsx            # Footer
│   │   │   └── Waveform.tsx          # Audio waveform animation
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Auth provider (login, signup, logout)
│   │   └── hooks/
│   │       └── useVoice.ts           # STT + TTS hook
│   ├── .env.local                    # Environment variables
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── next.config.ts                # Next.js config
│   └── postcss.config.mjs            # PostCSS + Tailwind
│
├── backend/                          # Rust backend (swarms-rs)
│   ├── src/
│   │   ├── main.rs                   # Axum server setup
│   │   ├── agents.rs                 # swarms-rs agent definitions
│   │   └── auth.rs                   # JWT auth + user store
│   ├── .env                          # Backend environment variables
│   ├── Cargo.toml                    # Rust dependencies
│   └── Cargo.lock                    # Locked dependency versions
│
├── docs/                             # Design assets
│   ├── Kalam_PRD.docx                # Product Requirements Document
│   ├── kalam_wireframe.html          # Website wireframe
│   ├── website_mockup.html           # Premium website mockup
│   ├── parent_dashboard.html         # Parent dashboard mockup
│   └── *.md                          # Companion summaries
│
├── AGENTS.md                         # Repository guidelines for AI agents
└── README.md                         # This file
```

---

## Multi-Agent System (swarms-rs)

The backend uses [swarms-rs](https://github.com/The-Swarm-Corporation/swarms-rs) — an enterprise-grade, production-ready multi-agent orchestration framework written in Rust. This provides near-zero latency, fearless concurrency, and memory safety without a garbage collector.

### TutorAgent

**Endpoint:** `POST /api/chat`

A single swarms-rs agent created via `client.agent_builder()` with a specialized system prompt for Socratic teaching:

```rust
let client = OpenAI::from_url(base_url, api_key).set_model("gpt-4o-mini");

let tutor_agent = client
    .agent_builder()
    .agent_name("TutorAgent")
    .system_prompt(tutor_system_prompt(subject, grade, language))
    .user_name("Student")
    .max_loops(1)
    .temperature(0.8)
    .build();

let response = tutor_agent.run(task).await?;
```

**Behavior:**
- Never gives answers directly — uses the Socratic method
- Speaks in the student's chosen language (Hindi, English, Hinglish, or 6 regional languages)
- Uses Indian cultural references (cricket, roti, mangoes, festivals)
- Adapts difficulty based on student responses
- Keeps responses to 2-4 sentences
- Child-safe content only

### AssessmentAgent

Analyzes tutoring conversations and produces structured JSON output:

```json
{
  "understanding": 65,
  "confidence": "medium",
  "misconceptions": ["Ignores numerator when comparing fractions"],
  "reinforceTopics": ["Equivalent fractions", "Fraction comparison"],
  "recommendedDifficulty": "easier",
  "engagement": "high",
  "sessionNote": "Student shows enthusiasm but has a consistent misconception..."
}
```

### InsightAgent

Generates parent-friendly session summaries:

```json
{
  "summary": "Today's session covered fraction comparison (Chapter 4).",
  "wentWell": "Riya understands that smaller denominators mean larger pieces.",
  "needsAttention": "She hasn't grasped equivalent fractions yet.",
  "homeTip": "Cut a roti into halves and thirds — ask if one piece from each is the same amount."
}
```

### ConcurrentWorkflow

**Endpoint:** `POST /api/assess`

Runs AssessmentAgent and InsightAgent in parallel using swarms-rs `ConcurrentWorkflow`:

```rust
let workflow = ConcurrentWorkflow::builder()
    .name("RankerIQ Assessment Workflow")
    .description("Concurrent assessment and insight generation")
    .metadata_output_dir("./temp/rankeriq/assess/metadata")
    .agents(vec![
        Box::new(assessment_agent) as Box<dyn Agent>,
        Box::new(insight_agent) as Box<dyn Agent>,
    ])
    .build();

let result = workflow.run(task).await?;
```

This mirrors the swarms-rs `ConcurrentWorkflow` pattern — multiple specialized agents execute the same task simultaneously, each producing independent output. Results are collected from the conversation history.

---

## Authentication

### Flow

1. User submits credentials to `POST /api/auth/login` (or registers via `/signup`)
2. Rust backend validates credentials, creates JWT (HS256, 7-day expiry)
3. Frontend stores token in `localStorage`
4. All subsequent API calls include `Authorization: Bearer <token>` header
5. Backend extracts and verifies token on protected routes (`/api/chat`, `/api/assess`)

### Security Notes

- JWT secret is configurable via `JWT_SECRET` env var
- In-memory user store — **replace with a database for production**
- Password hashing uses a simple hash — **replace with bcrypt/argon2 for production**
- CORS is currently set to allow all origins — **restrict in production**

---

## API Reference

### Auth Endpoints (Rust Backend)

All endpoints are on `http://localhost:8080`.

#### `POST /api/auth/login`

```json
// Request
{ "email": "student@demo.com", "password": "demo1234" }

// Response (200)
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "usr_student_001",
    "name": "Riya Sharma",
    "email": "student@demo.com",
    "role": "student",
    "grade": 5,
    "board": "CBSE",
    "avatar_initials": "RS"
  }
}
```

#### `POST /api/auth/signup`

```json
// Request
{
  "name": "Arjun Kumar",
  "email": "arjun@example.com",
  "password": "mypassword",
  "role": "student",
  "grade": 7,
  "board": "ICSE"
}

// Response (200)
{ "token": "...", "user": { ... } }
```

#### `GET /api/auth/me`

Requires `Authorization: Bearer <token>` header. Returns the current user object.

### Agent Endpoints (Rust Backend)

All require `Authorization: Bearer <token>`.

#### `POST /api/chat`

Send a tutoring conversation and receive the TutorAgent's response.

```json
// Request
{
  "messages": [
    { "role": "user", "content": "Mujhe fractions samjhao" }
  ],
  "subject": "mathematics",
  "grade": 5,
  "language": "hinglish"
}

// Response (200)
{
  "message": "Fractions ki baat karte hain! Socho — agar tumhare paas ek pizza hai...",
  "agent": "TutorAgent"
}
```

#### `POST /api/assess`

Run concurrent assessment on a tutoring session.

```json
// Request
{
  "messages": [
    { "role": "user", "content": "2/4 bada hai kyunki 4 chhota hai" },
    { "role": "assistant", "content": "Interesting thinking! ..." }
  ],
  "subject": "mathematics",
  "grade": 5,
  "language": "hinglish"
}

// Response (200)
{
  "assessment": "{ \"understanding\": 45, ... }",
  "insight": "{ \"summary\": \"...\", ... }",
  "tutor_agent": "TutorAgent",
  "assessment_agent": "AssessmentAgent",
  "insight_agent": "InsightAgent"
}
```

### Frontend API Routes (Next.js)

#### `POST /api/chat` (proxy)
Forwards request to Rust backend `POST /api/chat` with auth header.

#### `POST /api/tts`
Calls ElevenLabs directly for text-to-speech. Does not go through the Rust backend.

---

## Frontend Pages

| Route | Component | Auth Required | Description |
|-------|-----------|:---:|-------------|
| `/` | Landing page | No | Hero, how-it-works, voice demo, pricing, testimonials |
| `/login` | Login page | No | Email/password form with demo account buttons |
| `/signup` | Signup page | No | Registration with student/parent role selection |
| `/learn` | Tutoring chat | Yes | Voice-first chat with TutorAgent, subject/grade/language selectors |
| `/dashboard` | Parent dashboard | No* | Exam readiness score, topic mastery, session logs, AI insights |

*Dashboard currently uses static mockup data and does not require auth.

---

## Voice System

### Text-to-Speech (TTS)

- **Provider:** ElevenLabs
- **Model:** `eleven_flash_v2_5`
- **Voice:** `pNInz6obpgDQGcFmaJgB` (Adam, configurable)
- **Output:** MP3 at 22050 Hz, 32 kbps
- **Features:** Auto-speak toggle, per-message play buttons, waveform animation
- **Sanitization:** Emojis and special characters are stripped before sending to TTS

### Speech-to-Text (STT)

- **Provider:** Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- **Language mapping:** Hinglish/Hindi → `hi-IN`, English → `en-IN`, Tamil → `ta-IN`, etc.
- **Behavior:** Tap mic → speak → auto-sends transcript as message

---

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `saffron` | `#e07b1a` | Primary accent, CTAs, highlights |
| `saffron-light` | `#f5a84a` | Hover states, secondary accent |
| `ink` | `#0d0d0b` | Body text, dark backgrounds |
| `cream` | `#fdf9f2` | Page backgrounds |
| `forest` | `#1a3a2a` | Dashboard header, trust elements |
| `green-light` | `#52b788` | Success states, progress bars |
| `blue-deep` | `#0a1628` | Learn page background, dark sections |
| `red-soft` | `#c0392b` | Error states, weak topics |
| `amber` | `#c4832a` | Warning states, attention topics |

### Typography

- **Display font:** Playfair Display (serif) — headings, scores, hero text
- **Body font:** Sora (sans-serif) — body text, UI elements, labels

### Animations

- `fadeUp` — Section entrance animation
- `orbPulse` — Microphone glow effect
- `waveDance` — Audio waveform bars
- `float` — Floating card elements
- `shimmer` — Loading skeleton effect
- `typing` — Chat typing indicator dots

---

## Development Commands

| Task | Command | Directory |
|------|---------|-----------|
| Start frontend (dev) | `npm run dev` | `app/` |
| Build frontend | `npm run build` | `app/` |
| Start frontend (prod) | `npm run start` | `app/` |
| Lint frontend | `npm run lint` | `app/` |
| Start backend (dev) | `cargo run` | `backend/` |
| Type-check backend | `cargo check` | `backend/` |
| Build backend (release) | `cargo build --release` | `backend/` |
| Health check | `curl http://localhost:8080/health` | — |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `OPENAI_API_KEY` | Yes | — | OpenAI API key for GPT-4o-mini |
| `OPENAI_BASE_URL` | No | `https://api.openai.com/v1` | OpenAI API base URL |
| `JWT_SECRET` | No | `rankeriq-secret-2026` | Secret for JWT signing |
| `RUST_LOG` | No | — | Rust log level (`info`, `debug`, `trace`) |
| `SWARMS_LOG_LEVEL` | No | — | swarms-rs log level |

### Frontend (`app/.env.local`)

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `OPENAI_API_KEY` | No* | — | Only needed if using direct OpenAI calls |
| `ELEVENLABS_API_KEY` | No | — | ElevenLabs API key for TTS |
| `BACKEND_URL` | No | `http://localhost:8080` | Rust backend URL (server-side) |
| `NEXT_PUBLIC_BACKEND_URL` | No | `http://localhost:8080` | Rust backend URL (client-side) |

*The frontend now proxies chat through the Rust backend, so `OPENAI_API_KEY` is primarily used by the backend.

---

## Deployment

### Production Considerations

1. **Database** — Replace the in-memory user store with PostgreSQL/MongoDB
2. **Password Hashing** — Replace `simple_hash` with bcrypt or argon2
3. **CORS** — Restrict `allow_origin` to your frontend domain
4. **JWT Secret** — Use a strong, randomly generated secret
5. **HTTPS** — Deploy behind a reverse proxy (nginx/Caddy) with TLS
6. **Rate Limiting** — Add rate limiting to auth and chat endpoints
7. **API Keys** — Store in a secrets manager, not in `.env` files

### Build for Production

```bash
# Backend
cd backend
cargo build --release
# Binary at: target/release/rankeriq-backend

# Frontend
cd app
npm run build
npm run start
```

---

## License

ISC
