# RankerIQ — Production Design (GCP Compute Engine)

**Target budget:** ~$50–100/month (bootstrapped)
**Target infra:** Single GCP Compute Engine VM with local PostgreSQL

---

## 1. Current State vs Production Gaps

| Area | Current (Dev) | Production Required |
|------|--------------|-------------------|
| User storage | In-memory HashMap | PostgreSQL |
| Session history | Not persisted | PostgreSQL + per-student session logs |
| Dashboard data | Static mockup | Real data from assessment pipeline |
| Password hashing | Custom `wrapping_mul` hash | Argon2id (industry standard) |
| JWT secret | Hardcoded fallback `"rankeriq-secret-2026"` | GCP Secret Manager or `.env` with strong random key |
| CORS | `allow_origin(Any)` | Whitelist `https://rankeriq.com` only |
| TLS/HTTPS | None | Nginx + Let's Encrypt (Certbot) |
| Monitoring | `tracing` to stdout | Cloud Logging + uptime checks |
| CI/CD | None | GitHub Actions → SSH deploy |
| Containerization | None | Docker Compose (Rust backend + Next.js + PostgreSQL + Nginx) |
| Agent memory | Stateless per-request | OpenFang persistent memory (SQLite + vector embeddings) |
| Parent notifications | Button exists, no functionality | OpenFang WhatsApp channel adapter |

---

## 2. GCP Architecture (Single VM)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    GCP Compute Engine: e2-medium                      │
│                    (2 vCPU, 4 GB RAM, 50 GB SSD)                     │
│                    Ubuntu 24.04 LTS · ~$25/mo                        │
│                                                                       │
│  ┌─────────────┐                                                      │
│  │   Nginx      │ :443 (HTTPS) ──▶ :3000 (Next.js)                   │
│  │   Reverse    │ :443/api/auth/* ──▶ :8080 (Rust backend)           │
│  │   Proxy      │ :443/api/chat  ──▶ :4200 (OpenFang)               │
│  │   + SSL      │ :443/api/assess ──▶ :8080 (Rust backend)          │
│  └─────────────┘                                                      │
│                                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐                │
│  │ Next.js 16  │  │ Rust/Axum    │  │ PostgreSQL 16 │                │
│  │ (frontend)  │  │ (auth, data) │  │ (local)       │                │
│  │ :3000       │  │ :8080        │  │ :5432         │                │
│  └─────────────┘  └──────────────┘  └───────────────┘                │
│                                                                       │
│  ┌──────────────────────────────────────────────────┐                 │
│  │ OpenFang Agent OS :4200                           │                 │
│  │ ┌─────────────────┐  ┌─────────────────────────┐ │                 │
│  │ │ Tutor Agent     │  │ Autonomous Hands         │ │                 │
│  │ │ (forked, CBSE/  │  │  Researcher (weekly)     │ │                 │
│  │ │  ICSE, Hinglish)│  │  Predictor  (daily)      │ │                 │
│  │ │ + memory_store  │  │  Collector  (daily)      │ │                 │
│  │ │ + memory_recall │  │  Clip       (future)     │ │                 │
│  │ ├─────────────────┤  ├─────────────────────────┤ │                 │
│  │ │ Persistent Mem  │  │ WhatsApp Channel        │ │                 │
│  │ │ (SQLite+vectors)│  │ (parent reports)        │ │                 │
│  │ └─────────────────┘  └─────────────────────────┘ │                 │
│  └──────────────────────────────────────────────────┘                 │
│                                                                       │
│  Daily: pg_dump → GCS bucket ($1/mo for 10 GB)                       │
└──────────────────────────────────────────────────────────────────────┘

External APIs:
  ├── OpenAI API (gpt-4o-mini) — ~$5–20/mo at student scale
  ├── ElevenLabs TTS — ~$5/mo (starter plan)
  └── Domain + DNS (Cloudflare free tier)
```

### Cost Breakdown

| Resource | Monthly Cost |
|----------|-------------|
| e2-medium VM (2 vCPU, 4 GB, committed use) | ~$25 |
| 50 GB balanced persistent disk | ~$5 |
| Static IP + egress (~10 GB) | ~$3 |
| GCS backup bucket (10 GB) | ~$1 |
| OpenAI API (gpt-4o-mini, ~500 sessions/mo) | ~$10–20 |
| ElevenLabs (starter) | ~$5 |
| Domain (Cloudflare) | ~$1 |
| **Total** | **~$50–60/mo** |

---

## 3. PostgreSQL Schema Design

```sql
-- Users (replaces in-memory HashMap)
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,          -- Argon2id hash
    role          TEXT NOT NULL CHECK (role IN ('student', 'parent')),
    grade         INT,
    board         TEXT,
    child_name    TEXT,
    avatar_initials TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Parent-child linking
CREATE TABLE parent_student_links (
    parent_id  UUID REFERENCES users(id),
    student_id UUID REFERENCES users(id),
    PRIMARY KEY (parent_id, student_id)
);

-- Chat sessions (persists every tutoring session)
CREATE TABLE sessions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) NOT NULL,
    subject    TEXT NOT NULL,
    grade      INT NOT NULL,
    language   TEXT NOT NULL DEFAULT 'hinglish',
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at   TIMESTAMPTZ,
    message_count INT DEFAULT 0
);

-- Individual messages within a session
CREATE TABLE messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) NOT NULL,
    role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_messages_session ON messages(session_id, created_at);

-- Assessment results (from ConcurrentWorkflow)
CREATE TABLE assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES sessions(id) NOT NULL,
    student_id      UUID REFERENCES users(id) NOT NULL,
    understanding   INT,                 -- 0-100
    confidence      TEXT,                -- high/medium/low
    misconceptions  JSONB DEFAULT '[]',
    reinforce_topics JSONB DEFAULT '[]',
    recommended_difficulty TEXT,
    engagement      TEXT,
    session_note    TEXT,
    parent_summary  TEXT,
    went_well       TEXT,
    needs_attention TEXT,
    home_tip        TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_assessments_student ON assessments(student_id, created_at DESC);

-- Topic mastery tracking (updated after each assessment)
CREATE TABLE topic_mastery (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) NOT NULL,
    subject    TEXT NOT NULL,
    topic      TEXT NOT NULL,
    accuracy   INT DEFAULT 0,           -- 0-100
    strength   TEXT DEFAULT 'none',     -- none/weak/ok/strong
    attempts   INT DEFAULT 0,
    last_practiced TIMESTAMPTZ,
    UNIQUE(student_id, subject, topic)
);
CREATE INDEX idx_mastery_student ON topic_mastery(student_id, subject);

-- Streaks and gamification
CREATE TABLE streaks (
    student_id    UUID PRIMARY KEY REFERENCES users(id),
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active    DATE,
    total_sessions INT DEFAULT 0,
    total_minutes  INT DEFAULT 0
);

-- Badges earned
CREATE TABLE badges (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) NOT NULL,
    badge_type TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    earned_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. OpenFang Integration — What It Brings to RankerIQ

OpenFang ([github.com/RightNow-AI/openfang](https://github.com/RightNow-AI/openfang)) is an open-source Agent OS built in Rust. 14 crates, 137K LOC, 1,767+ tests, zero clippy warnings. Latest release: **v0.5.1** (Cargo.toml workspace version). Built by [RightNow](https://www.rightnowai.co/), maintained by Jaber. Dual-licensed MIT + Apache 2.0.

It provides three distinct categories of capability for RankerIQ:

1. **30 Pre-Built Agents** — including a **`tutor` agent** with Socratic method, adaptive teaching, and memory tools (directly relevant)
2. **8 Autonomous Hands** — pre-built capability packages that run independently on schedules, without prompting
3. **Core Runtime Features** — persistent memory, 40 channel adapters, 53 tools, 60 skills, WASM sandbox, 16 security systems, OpenAI-compatible API, JS/Python SDKs

### 4.1 Critical Discovery: OpenFang Ships a Built-In Tutor Agent

OpenFang's `agents/tutor/agent.toml` is a pre-built educational agent with 7 core competencies that directly map to RankerIQ's needs. This was missing from all previous design iterations.

| OpenFang Tutor Competency | RankerIQ Benefit |
|---------------------------|-----------------|
| **Adaptive Explanation** — Feynman Technique, multiple angles, meets learner at their level | Replaces our custom `tutor_system_prompt()` with a battle-tested one |
| **Socratic Teaching** — "what do you know? → what happens next? → why? → counterexample?" | Already our core teaching method — OpenFang's version is more structured |
| **Problem-Solving Walkthrough** — step-by-step with increasing difficulty | Powers Practice Mode automatically |
| **Learning Plan Design** — spaced repetition, interleaving, prerequisites, milestones | Powers the entire SRS engine — built into the agent itself |
| **Assessment & Feedback** — creates quizzes, provides detailed constructive feedback | Replaces our AssessmentAgent for in-session assessment |
| **Study Skills & Metacognition** — active recall, Pomodoro, concept mapping, self-testing | Bonus: teaches students HOW to learn, not just WHAT to learn |
| **Memory tools** — `memory_store` / `memory_recall` for cross-session context | Native persistent memory per student — no custom implementation needed |

**Built-in tools available to the tutor:** `file_read`, `file_write`, `file_list`, `memory_store`, `memory_recall`, `shell_exec`, `web_fetch`

**Key implication:** Instead of maintaining our custom swarms-rs TutorAgent and writing our own session memory, spaced repetition scheduling, and assessment logic, we can **fork OpenFang's tutor agent.toml**, customize it for Indian curriculum (CBSE/ICSE, Hindi/English/Hinglish, Indian examples), and inherit all its capabilities for free — including persistent memory, learning plans, and self-assessment.

```bash
# Spawn the built-in tutor agent (customized for RankerIQ)
openfang agent spawn tutor

# Or chat with it directly
openfang chat tutor
> "Explain equivalent fractions to a Grade 5 student in Hinglish"
```

### 4.2 Why OpenFang Over swarms-rs Alone

| Capability | swarms-rs (current) | OpenFang |
|-----------|---------------------|----------|
| Agent execution | Basic agent builder | 30 pre-built agents (including **tutor**) + custom |
| Autonomous Hands | None | 8 built-in (Researcher, Predictor, Collector, Clip, Trader, Lead, Twitter, Browser) |
| Memory | None (stateless) | SQLite + vector embeddings, cross-session recall, LLM-based compaction |
| Channels | None | 40 adapters (WhatsApp, Telegram, Discord, Signal, Email, etc.) |
| Security | None | 16 systems (WASM sandbox, taint tracking, Merkle audit trail, prompt injection scanner) |
| Tools | LLM calls only | 53 built-in + MCP + A2A |
| Skills | None | 60 bundled skills + FangHub marketplace |
| Workflows | ConcurrentWorkflow | Fan-out, conditional, loop step modes |
| Protocols | None | MCP server/client + A2A + OpenAI-compatible API |
| SDKs | None | JavaScript SDK (`@openfang/sdk`) + Python SDK |
| Desktop app | None | Tauri 2.0 native app |
| Dashboard | None | Built-in at `:4200` with hand status, metrics, chat UI |
| Cold start | ~180ms | ~180ms (same Rust performance) |
| Memory footprint | ~20 MB | ~40 MB |
| Install size | ~8 MB (binary) | ~32 MB (single binary, everything included) |
| LLM providers | OpenAI only (via swarms-rs) | 27 providers (Anthropic, Gemini, OpenAI, Groq, DeepSeek, Ollama, etc.) |
| Migration | — | Migrates from OpenClaw, LangChain, AutoGPT |

### 4.3 OpenFang Hands — Relevance to RankerIQ

OpenFang ships **8 autonomous Hands** (the README says 7 but the actual `crates/openfang-hands/bundled/` directory contains 8 — the **Trader Hand** was added after the README was last updated). Each Hand bundles:
- `HAND.toml` — manifest with configurable settings (select, toggle, text fields), dashboard metrics, tool requirements
- Multi-phase system prompt playbook (500–2000+ words, not a one-liner)
- `SKILL.md` — domain expertise reference injected at runtime
- Guardrails — approval gates for sensitive actions

All compiled into the binary. No downloading, no pip install.

Here is an honest assessment of each Hand against RankerIQ's needs:

| Hand | What It Does | Fit for RankerIQ | Priority |
|------|-------------|-------------------|----------|
| **Researcher** | 7-phase pipeline: question decomposition, search strategy, CRAAP source evaluation, cross-referencing, fact-checking, cited reports. Configurable: depth (quick/thorough/exhaustive), output style (brief/detailed/academic/executive), citation style (inline/footnotes/APA), language (7 languages + auto-detect), max sources (10/30/50/unlimited) | **HIGH** — curriculum verification, NCERT-aligned Q-bank generation | P2 |
| **Predictor** | Superforecasting with calibrated confidence intervals, Brier score tracking, contrarian mode, multi-source signal collection. Configurable: prediction domain, time horizon (1 week to 1 year), report frequency (daily/weekly/monthly), confidence threshold | **HIGH** — student exam readiness prediction, at-risk detection | P2 |
| **Collector** | OSINT-grade intelligence with change detection, knowledge graph construction, sentiment tracking. Configurable: target subject (free text), collection depth (surface/deep/exhaustive), update frequency (hourly to weekly), focus area (market/business/competitor/person/technology/general), alert on changes | **MEDIUM** — monitor CBSE/ICSE syllabus changes | P3 |
| **Clip** | 8-phase video pipeline: YouTube download → moment identification → vertical short cuts → captions → thumbnails → AI voice-over → publish. FFmpeg + yt-dlp + 5 STT backends | **MEDIUM** — educational video clips from NCERT/Khan Academy lectures | P4 |
| **Trader** | Market intelligence engine with multi-factor analysis (technical/fundamental/sentiment/macro), adversarial bull/bear debate, portfolio management, circuit breakers, Sharpe ratio tracking, Alpaca API integration | **NOT FIT** — financial trading, not relevant to ed-tech | — |
| **Browser** | Web automation with Playwright bridge, session persistence, mandatory purchase approval gate | **LOW** — Researcher Hand covers content gathering more elegantly | P4 |
| **Lead** | B2B lead generation, ICP scoring, prospect enrichment, deduplication | **NOT FIT** — B2B sales tool | — |
| **Twitter** | Autonomous Twitter/X manager with 7 content formats, approval queue, engagement tracking | **NOT FIT** — marketing tool, not core product | — |

#### Hand A: Researcher — Curriculum Knowledge Base Builder (HIGH FIT)

The Researcher Hand runs autonomously, cross-references multiple sources, evaluates credibility using CRAAP criteria (Currency, Relevance, Authority, Accuracy, Purpose), and generates cited reports with APA formatting. It supports multiple languages natively.

**How RankerIQ uses it:**

1. **NCERT Curriculum Indexing** — Activate the Researcher Hand to autonomously crawl and index the NCERT textbook content for Grades 5-12 (Maths, Science, English). It builds a knowledge graph of chapters → topics → concepts → worked examples, verified against official NCERT sources.

2. **Tutor Fact-Checking** — After each tutoring session, the Researcher Hand verifies the TutorAgent's explanations against the indexed curriculum. If the tutor said something inaccurate ("the area of a circle is 2πr"), the Researcher flags it and the system auto-corrects before the next session.

3. **Practice Question Generation** — The Researcher autonomously generates curriculum-aligned practice questions by researching past CBSE board exam papers, NCERT exercises, and reputable educational sources. Questions are graded by difficulty and tagged by topic.

4. **Multi-Language Content** — Built-in multi-language support means it can research and generate content in Hindi and English simultaneously, matching RankerIQ's Hinglish tutoring approach.

```bash
# Activate Researcher to build NCERT Maths Grade 5 knowledge base
openfang hand activate researcher

# Configure via HAND.toml overrides
# Target: NCERT Grade 5-12 Maths + Science
# Schedule: Weekly refresh to catch syllabus updates
# Output: Knowledge graph + practice question bank → PostgreSQL
```

**Concrete workflow:**
```
┌──────────────────────┐     ┌────────────────────────┐
│ Researcher Hand      │     │ Output                  │
│ (runs weekly)        │     │                         │
│                      │     │ ┌─────────────────────┐ │
│ 1. Crawl NCERT PDFs  │────▶│ │ Knowledge Graph     │ │
│ 2. Parse chapters    │     │ │ (chapters/topics/   │ │
│ 3. CRAAP verify      │     │ │  concepts/prereqs)  │ │
│ 4. Generate Q-bank   │     │ ├─────────────────────┤ │
│ 5. Tag by difficulty  │     │ │ Practice Questions  │ │
│ 6. Multi-language     │────▶│ │ (MCQ + open-ended,  │ │
│                      │     │ │  graded by topic)   │ │
│                      │     │ ├─────────────────────┤ │
│ Schedule: weekly     │     │ │ Fact-Check Log      │ │
│ Dashboard: metrics   │────▶│ │ (tutor accuracy     │ │
│                      │     │ │  over time)         │ │
└──────────────────────┘     └────────────────────────┘
```

#### Hand B: Predictor — Student Performance Forecasting (HIGH FIT)

The Predictor Hand is a superforecasting engine. It collects signals, builds calibrated reasoning chains, makes predictions with confidence intervals, and tracks its own accuracy using Brier scores. It even has a contrarian mode that argues against consensus.

**How RankerIQ uses it:**

1. **Exam Readiness Score** — The parent dashboard currently shows a hardcoded "72/100" Exam Readiness Score. The Predictor Hand replaces this with a real, calibrated prediction: "Riya has a 78% probability of scoring above 80% on the Chapter 4 Fractions test, based on 12 sessions and 3 assessments."

2. **At-Risk Student Detection** — Run daily to identify students whose performance trajectory is declining. Alert parents before the student falls behind: "Riya's understanding of equivalent fractions dropped from 68% to 42% over the last week. Recommend a focused review session."

3. **Topic Readiness Prediction** — Before a student advances to a new chapter, predict whether they have sufficient mastery of prerequisites. "Riya is NOT ready for Decimals — predicted 55% accuracy. Fractions prerequisite score needs to reach 75%+."

4. **Brier Score Calibration** — The Predictor tracks its own accuracy over time. Parents and teachers can trust the predictions because the system knows and reports how often it's right.

```bash
# Activate Predictor for student performance forecasting
openfang hand activate predictor

# Schedule: daily analysis of all active students
# Input: assessments table, topic_mastery table, session data
# Output: exam_readiness scores, at-risk alerts, topic predictions
```

**Concrete workflow:**
```
┌──────────────────────┐     ┌────────────────────────┐
│ Predictor Hand       │     │ Output                  │
│ (runs daily)         │     │                         │
│                      │     │ ┌─────────────────────┐ │
│ 1. Query assessments │────▶│ │ Exam Readiness      │ │
│ 2. Analyze trends    │     │ │ 78/100 (±8)         │ │
│ 3. Build reasoning   │     │ │ Brier: 0.12         │ │
│    chains            │     │ ├─────────────────────┤ │
│ 4. Calibrate with    │     │ │ At-Risk Alerts      │ │
│    Brier scores      │────▶│ │ "Fractions ↓ 42%"   │ │
│ 5. Contrarian check  │     │ ├─────────────────────┤ │
│ 6. Generate alerts   │────▶│ │ Topic Readiness     │ │
│                      │     │ │ "NOT ready for      │ │
│ Schedule: daily      │     │ │  Decimals (55%)"    │ │
│ Dashboard: metrics   │     │ └─────────────────────┘ │
└──────────────────────┘     └────────────────────────┘
```

#### Hand C: Collector — Curriculum Change Monitoring (MEDIUM FIT)

The Collector Hand does OSINT-style intelligence collection. It monitors targets continuously with change detection, sentiment tracking, and knowledge graph construction. It sends critical alerts when something important shifts.

**How RankerIQ uses it:**

1. **CBSE/ICSE Syllabus Monitoring** — Activate the Collector to monitor official CBSE and ICSE syllabus pages. When a syllabus change is detected (new topics added, chapters restructured, exam pattern changed), the Collector alerts the system and the Researcher Hand auto-updates the knowledge base.

2. **NCERT Textbook Edition Tracking** — Monitor for new NCERT textbook editions. When a new edition drops, flag which chapters changed and what tutoring content needs updating.

3. **Educational Regulation Monitoring** — Track NEP (National Education Policy) updates, board exam date announcements, and marking scheme changes. Surface these to parents in the dashboard.

```bash
# Activate Collector to monitor CBSE syllabus
openfang hand activate collector

# Targets:
#   - cbse.gov.in syllabus pages
#   - ncert.nic.in textbook index
#   - ICSE council updates
# Schedule: daily check
# Alerts: on change detection → notify admin + trigger Researcher refresh
```

#### Hand D: Clip — Educational Video Shorts (MEDIUM FIT, FUTURE)

The Clip Hand takes long-form video, identifies the best moments, cuts them into vertical shorts with captions and thumbnails, and optionally adds AI voice-over. It uses FFmpeg + yt-dlp + 5 STT backends.

**How RankerIQ could use it (Phase 4+):**

1. **Curated Learning Clips** — Take high-quality educational YouTube lectures (NCERT explanations, Khan Academy India) and auto-generate 60-second topic-specific clips. "Here's a 1-minute explanation of equivalent fractions."

2. **Visual Learning Support** — For students who learn better from video, auto-generate captioned clips with Hindi/English subtitles.

3. **Session Recap Shorts** — After a tutoring session, generate a 30-second recap video summarizing what was covered.

> **Note:** This is a Phase 4 enhancement. The Clip Hand requires FFmpeg and yt-dlp on the VM, which adds complexity. Defer until core tutoring is solid.

#### Hands NOT Used: Lead, Twitter, Browser

- **Lead Hand** — Designed for B2B lead generation (prospect discovery, ICP scoring). Not relevant to student tutoring.
- **Twitter Hand** — Social media management. Could be used for marketing RankerIQ but is not part of the core product.
- **Browser Hand** — Web automation with Playwright. Limited use case for an ed-tech platform. Could theoretically scrape educational content, but the Researcher Hand covers this more elegantly.

### 4.3 Core Runtime Features Used (Not Hands)

These are OpenFang's core runtime capabilities — always available, not scheduled autonomously.

#### A. Persistent Student Memory (HIGH IMPACT)

Part of the `openfang-memory` crate. SQLite-backed with vector embeddings, cross-channel canonical sessions, automatic LLM-based compaction, and JSONL session mirroring.

- The tutor remembers what Riya struggled with last Tuesday
- "Last time you had trouble with equivalent fractions — let's try again with a new approach"
- Automatic compaction keeps context small but relevant
- JSONL mirroring provides audit trail for parents

**Implementation:** Each student gets a canonical session in OpenFang memory. TutorAgent queries memory before each response to retrieve relevant historical context.

#### B. WhatsApp Channel Adapter (HIGH IMPACT)

Part of the `openfang-channels` crate. OpenFang ships a WhatsApp Web Gateway (`packages/whatsapp-gateway/`) that connects via QR code — no Meta Business account required for development. For production, use WhatsApp Cloud API.

- Auto-send daily/weekly session summaries to parent's WhatsApp
- "Riya practiced fractions for 12 min today. Accuracy improved to 58%."
- Parents can reply on WhatsApp to ask follow-up questions → routed to InsightAgent
- No app download needed — meets Indian parents where they already are

**Implementation:**
```bash
# Development: QR code gateway (no business account needed)
cd packages/whatsapp-gateway && npm install
node index.js
# Scan QR in dashboard → WhatsApp → Linked Devices

# Production: WhatsApp Cloud API via Meta Business account
# Configure in openfang.toml:
# [channels.whatsapp]
# mode = "cloud"
# default_agent = "insight-agent"
```

#### C. WASM Sandbox (FUTURE)

Part of the `openfang-runtime` crate. Dual-metered WASM sandbox (fuel + epoch interruption) with watchdog thread, path traversal prevention, and subprocess isolation.

- When expanding to computer science subjects, students can write and run code safely
- No risk of infinite loops, file system access, or network escape
- Supports Python, JavaScript, and Rust snippets via WASM compilation

#### D. 16 Security Systems (HIGH IMPACT)

Relevant security layers for a platform serving children:

| System | RankerIQ Benefit |
|--------|-----------------|
| WASM Sandbox | Safe code execution for future CS tutoring |
| Prompt Injection Scanner | Prevents students from jailbreaking the tutor ("ignore your instructions and...") |
| Taint Tracking | Ensures API keys and secrets never leak into chat responses |
| GCRA Rate Limiter | Prevents abuse of the tutoring API |
| Merkle Audit Trail | Tamper-proof log of all tutoring interactions (compliance) |
| Session Repair | Auto-recovers from corrupted conversation state |

### 4.4 OpenFang Integration Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         GCP VM                                        │
│                                                                        │
│  ┌──────────────┐    ┌──────────────────────────────────────┐         │
│  │ Axum Router  │───▶│ OpenFang Agent Runtime                │         │
│  │ /api/chat    │    │                                        │         │
│  │ /api/assess  │    │  AGENTS (request-driven)               │         │
│  └──────────────┘    │  ┌────────────────────────────────┐   │         │
│                       │  │ TutorAgent (with memory)       │   │         │
│                       │  │ AssessmentAgent                │   │         │
│                       │  │ InsightAgent                   │   │         │
│                       │  └────────────────────────────────┘   │         │
│                       │                                        │         │
│                       │  HANDS (autonomous, scheduled)         │         │
│                       │  ┌────────────────────────────────┐   │         │
│                       │  │ Researcher Hand (weekly)       │   │         │
│                       │  │  → curriculum KB + Q-bank      │   │         │
│                       │  │ Predictor Hand (daily)         │   │         │
│                       │  │  → exam readiness + at-risk    │   │         │
│                       │  │ Collector Hand (daily)         │   │         │
│                       │  │  → syllabus change detection   │   │         │
│                       │  └────────────────────────────────┘   │         │
│                       │                                        │         │
│                       │  RUNTIME FEATURES                      │         │
│                       │  ┌────────────────────────────────┐   │         │
│                       │  │ Persistent Memory (SQLite)     │   │         │
│                       │  │ WhatsApp Channel (parent)      │   │         │
│                       │  │ Prompt Injection Scanner       │   │         │
│                       │  │ Merkle Audit Trail             │   │         │
│                       │  └────────────────────────────────┘   │         │
│                       └──────────────────────────────────────┘         │
│                                                                        │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐          │
│  │ PostgreSQL   │  │ OpenFang      │  │ Next.js Frontend   │          │
│  │ (users,      │  │ Dashboard     │  │ :3000              │          │
│  │  sessions,   │  │ :4200         │  │                    │          │
│  │  assessments)│  │ (Hand status, │  │                    │          │
│  │ :5432        │  │  metrics)     │  │                    │          │
│  └──────────────┘  └───────────────┘  └────────────────────┘          │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.5 OpenAI-Compatible API — Simplest Integration Path

OpenFang exposes an **OpenAI-compatible API** at `/v1/chat/completions`. This means the Next.js frontend chat route (`app/src/app/api/chat/route.ts`) can point at OpenFang instead of proxying to our custom Rust backend for tutoring — no code changes in the frontend.

```
Current:  Next.js :3000 → /api/chat → Rust/Axum :8080 → swarms-rs → OpenAI API
With OF:  Next.js :3000 → /api/chat → OpenFang :4200/v1/chat/completions → OpenAI API
                                        ↑ memory, tools, skills all handled by OpenFang
```

**Frontend change:** Update `BACKEND_URL` in `.env.local` to point at OpenFang for chat endpoints, while keeping our Axum backend for auth, sessions, assessments, and parent dashboard APIs.

**JavaScript SDK:** OpenFang ships `@openfang/sdk` — can be used directly in the Next.js frontend for richer integration (agent selection, memory queries, hand status).

### 4.6 Migration Path from swarms-rs to OpenFang

OpenFang is Rust-native, so migration is incremental. swarms-rs and OpenFang can coexist during transition.

1. **Phase 1:** Install OpenFang binary on VM (`curl -fsSL https://openfang.sh/install | sh && openfang init`)
2. **Phase 2:** Fork OpenFang's built-in **`tutor` agent** — customize `agent.toml` for CBSE/ICSE, Hindi/Hinglish, Indian examples
3. **Phase 3:** Configure persistent memory — create per-student canonical sessions
4. **Phase 4:** Point Next.js `/api/chat` at OpenFang's `/v1/chat/completions` endpoint (keeps Axum for auth/sessions)
5. **Phase 5:** Activate **Researcher Hand** — build NCERT curriculum knowledge base
6. **Phase 6:** Activate **Predictor Hand** — daily student performance forecasting
7. **Phase 7:** Enable WhatsApp channel adapter for parent reports
8. **Phase 8:** Activate **Collector Hand** — monitor CBSE/ICSE syllabus changes
9. **Phase 9 (future):** Activate **Clip Hand** — educational video shorts

> **Stability note:** OpenFang is pre-1.0 (v0.5.1). The Researcher and Browser Hands are the most battle-tested. Pin to a specific commit for production use until v1.0 (targeted mid-2026).

### 4.7 OpenFang Docker Deployment

OpenFang ships its own `docker-compose.yml` — single service with volume persistence at port 4200:

```yaml
# Add to our root docker-compose.yml
openfang:
  image: ghcr.io/rightnow-ai/openfang:v0.5.1
  restart: always
  ports:
    - "4200:4200"
  volumes:
    - openfang_data:/data
  environment:
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - OPENFANG_DATA_DIR=/data
  depends_on:
    - postgres
```

**MCP Server Mode:** OpenFang can also run as an MCP server (`openfang mcp`), exposing all tools via the Model Context Protocol for IDE/tooling integration during development.

---

## 5. Key Enhancements for Student Productivity

### 5.1 Spaced Repetition Engine (Must-Have)

Students forget ~80% of what they learn within a week without review. Build a spaced repetition system:

- After each session, AssessmentAgent identifies weak topics
- Schedule review prompts at optimal intervals (1 day, 3 days, 7 days, 14 days)
- Store review schedule in `topic_mastery` table
- Push notifications: "Riya, time for a quick fractions review!"
- Track retention rate over time

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Session  │───▶│ Assess   │───▶│ Schedule │───▶│ Review   │
│ (learn)  │    │ (gaps)   │    │ (SRS)    │    │ (remind) │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                     │
                                     ▼
                              topic_mastery DB
                              (next_review_at)
```

### 5.2 Adaptive Difficulty Pipeline (Must-Have)

The TutorAgent already has adaptive behavior in its prompt, but it's not data-driven:

- Track per-topic accuracy in `topic_mastery`
- Feed last 5 assessment results into TutorAgent context
- Auto-adjust: <50% accuracy → easier examples, >85% → challenge mode
- Parent dashboard shows difficulty progression over time

### 5.3 Session Continuity (Must-Have)

Currently every page reload starts a fresh conversation:

- Persist messages to PostgreSQL `messages` table
- On page load, fetch last incomplete session
- TutorAgent receives conversation history as context
- "Welcome back, Riya! We were working on equivalent fractions — shall we continue?"

### 5.4 Gamification Layer (High Impact for Kids)

Students in Grades 5-12 respond strongly to game mechanics:

| Element | Implementation |
|---------|---------------|
| **XP Points** | +10 per correct concept, +5 per question asked, +25 per session completed |
| **Streaks** | Daily login streak with fire emoji counter (already exists as UI) — persist to DB |
| **Badges** | "Fraction Master", "7-Day Streak", "100 Questions Asked" — store in `badges` table |
| **Level System** | Levels 1-50 based on cumulative XP, with titles ("Math Explorer" → "Math Champion") |
| **Leaderboard** | Optional class/school leaderboard (anonymized by default) |
| **Weekly challenges** | "Complete 5 fractions sessions this week" with reward badges |

### 5.5 Visual Math & Science Aids (High Impact)

For STEM subjects, text-only tutoring is limited:

- Integrate a simple canvas/SVG renderer for fraction visualizations
- "Let me show you: [visual of 2/4 = 1/2 with pie chart]"
- Use server-side SVG generation or client-side Canvas API
- Particularly impactful for: fractions, geometry, graphs, chemistry diagrams

### 5.6 Practice Mode (Separate from Chat)

A dedicated quiz/practice mode distinct from conversational tutoring:

- Auto-generated questions based on weak topics from `topic_mastery`
- Multiple choice, fill-in-the-blank, and open-ended formats
- Timed challenges for exam preparation
- Immediate feedback with step-by-step solutions
- Results feed into assessment pipeline

### 5.7 Homework Help with Photo Upload (Future)

- Student photographs a textbook problem
- OCR + GPT-4o-mini vision interprets the problem
- TutorAgent guides through solution (still Socratic, never gives direct answer)
- Supports handwritten Hindi/English text recognition

### 5.8 Parent Dashboard — Live Data (Must-Have)

Currently the dashboard shows hardcoded mockup data. Connect it to real backend:

```
New API Endpoints:
  GET  /api/parent/child-stats/:student_id    → stats from assessments table
  GET  /api/parent/topic-mastery/:student_id  → from topic_mastery table
  GET  /api/parent/sessions/:student_id       → recent sessions with summaries
  GET  /api/parent/upcoming/:student_id       → SRS review schedule
```

### 5.9 Offline-First PWA (Future)

Indian students often have inconsistent internet:

- Cache last session's content for offline review
- Queue messages when offline, send when reconnected
- Service worker for app-like experience on mobile
- Download practice sets for offline use

---

## 6. Docker Compose Setup

```yaml
# docker-compose.yml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: rankeriq
      POSTGRES_USER: rankeriq
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rankeriq"]
      interval: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://rankeriq:${POSTGRES_PASSWORD}@postgres:5432/rankeriq
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      OPENAI_BASE_URL: ${OPENAI_BASE_URL:-https://api.openai.com/v1}
      JWT_SECRET: ${JWT_SECRET}
      RUST_LOG: info
    ports:
      - "127.0.0.1:8080:8080"

  frontend:
    build:
      context: ./app
      dockerfile: Dockerfile
    restart: always
    depends_on:
      - backend
    environment:
      BACKEND_URL: http://backend:8080
      ELEVENLABS_API_KEY: ${ELEVENLABS_API_KEY}
    ports:
      - "127.0.0.1:3000:3000"

  nginx:
    image: nginx:alpine
    restart: always
    depends_on:
      - frontend
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/letsencrypt:ro
      - ./nginx/webroot:/var/www/certbot:ro

volumes:
  pgdata:
```

---

## 7. Dockerfiles

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM rust:1.85-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/rankeriq-backend /usr/local/bin/
EXPOSE 8080
CMD ["rankeriq-backend"]
```

### Frontend Dockerfile

```dockerfile
# app/Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 8. Nginx Configuration

```nginx
# nginx/nginx.conf
events { worker_connections 1024; }

http {
    upstream frontend { server frontend:3000; }
    upstream backend  { server backend:8080;  }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
    limit_req_zone $binary_remote_addr zone=tts:10m rate=10r/m;

    server {
        listen 80;
        server_name rankeriq.com www.rankeriq.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name rankeriq.com www.rankeriq.com;

        ssl_certificate     /etc/letsencrypt/live/rankeriq.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/rankeriq.com/privkey.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.openai.com;";

        # Backend API routes
        location /api/auth/ {
            limit_req zone=api burst=10 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/chat {
            limit_req zone=api burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_read_timeout 60s;
        }

        location /api/assess {
            limit_req zone=api burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_read_timeout 60s;
        }

        # TTS route (rate limited more aggressively)
        location /api/tts {
            limit_req zone=tts burst=3 nodelay;
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Frontend (everything else)
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## 9. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GCP

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: SSH deploy
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.GCP_VM_IP }}
          username: deploy
          key: ${{ secrets.GCP_SSH_KEY }}
          script: |
            cd /opt/rankeriq
            git pull origin main
            docker compose build
            docker compose up -d --remove-orphans
            docker image prune -f
```

---

## 10. GCP VM Setup Script

```bash
#!/bin/bash
# Run once on a fresh Ubuntu 24.04 GCP VM

# System updates
sudo apt update && sudo apt upgrade -y

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Docker Compose
sudo apt install -y docker-compose-plugin

# Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Let's Encrypt (Certbot)
sudo apt install -y certbot
sudo certbot certonly --standalone -d rankeriq.com -d www.rankeriq.com

# Auto-renew certs
echo "0 3 * * * certbot renew --quiet --post-hook 'docker compose -f /opt/rankeriq/docker-compose.yml restart nginx'" | sudo crontab -

# Backup cron (daily pg_dump to GCS)
echo "0 2 * * * docker exec rankeriq-postgres-1 pg_dump -U rankeriq rankeriq | gzip > /tmp/rankeriq-backup-\$(date +\%Y\%m\%d).sql.gz && gsutil cp /tmp/rankeriq-backup-*.sql.gz gs://rankeriq-backups/ && rm /tmp/rankeriq-backup-*.sql.gz" | crontab -

# Clone and deploy
sudo mkdir -p /opt/rankeriq
sudo chown $USER:$USER /opt/rankeriq
cd /opt/rankeriq
git clone https://github.com/your-org/RankerIQ.git .
cp .env.example .env
# Edit .env with production values
docker compose up -d
```

---

## 11. Environment Variables (.env.example)

```env
# Database
POSTGRES_PASSWORD=<generate-with-openssl-rand-base64-32>

# Backend
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
JWT_SECRET=<generate-with-openssl-rand-base64-64>

# Frontend
ELEVENLABS_API_KEY=xi-...
BACKEND_URL=http://backend:8080
NEXT_PUBLIC_BACKEND_URL=https://rankeriq.com

# OpenFang (when integrated)
OPENFANG_WHATSAPP_TOKEN=...
OPENFANG_MEMORY_DIR=/data/openfang/memory
```

---

## 12. Security Hardening Checklist

- [ ] Replace `simple_hash()` with Argon2id (use `argon2` crate)
- [ ] Replace hardcoded JWT fallback secret with env-only strong key
- [ ] Restrict CORS to production domain only
- [ ] Enable rate limiting at Nginx layer (done in config above)
- [ ] Set `HttpOnly`, `Secure`, `SameSite=Strict` on auth cookies (or keep Bearer tokens but enforce HTTPS)
- [ ] Add CSRF protection for state-changing endpoints
- [ ] Input validation and sanitization on all user inputs
- [ ] SQL injection prevention (use parameterized queries — `sqlx` crate)
- [ ] Log authentication failures for abuse detection
- [ ] Set up GCP firewall rules: only 22, 80, 443 open
- [ ] Disable SSH password auth, use key-only
- [ ] Enable automatic security updates (`unattended-upgrades`)
- [ ] Regular dependency audits (`cargo audit`, `npm audit`)

---

## 13. Monitoring & Observability

| Tool | Purpose | Cost |
|------|---------|------|
| GCP Cloud Logging | Collect Docker container logs via logging agent | Free (first 50 GB/mo) |
| GCP Uptime Checks | Ping `/health` every 5 min, alert on failure | Free (first 100) |
| GCP Error Reporting | Auto-capture Rust panics and JS errors | Free tier |
| `htop` + `docker stats` | VM resource monitoring | Free |
| Sentry (optional) | Frontend error tracking with user context | Free tier (10K events/mo) |

---

## 14. Scaling Path (When You Outgrow Single VM)

```
Phase 1: Single VM (current plan)
  └── $50-60/mo, handles ~500 students

Phase 2: Vertical scale
  └── Upgrade to e2-standard-4 (4 vCPU, 16 GB) ~$100/mo
  └── Handles ~2,000 students

Phase 3: Split services
  └── Cloud SQL for PostgreSQL (managed, backups, replicas)
  └── Cloud Run for Rust backend (auto-scaling, pay-per-request)
  └── Vercel/Cloud Run for Next.js
  └── ~$200-400/mo, handles ~10,000 students

Phase 4: Full cloud-native
  └── GKE (Kubernetes) or Cloud Run fully managed
  └── Redis for session caching
  └── Cloud CDN for static assets
  └── ~$500-1000/mo, handles ~50,000+ students
```

---

## 15. Implementation Priority

| Priority | Enhancement | Effort | Impact |
|----------|------------|--------|--------|
| P0 | PostgreSQL migration (users, sessions, messages) | 2-3 days | Critical — no production without persistence |
| P0 | Argon2id password hashing | 0.5 day | Critical — security |
| P0 | Docker Compose + Nginx + SSL | 1-2 days | Critical — deployment |
| P1 | Session continuity (persist chat, resume on reload) | 1-2 days | High — core UX improvement |
| P1 | Live parent dashboard (real data from assessments) | 2-3 days | High — key differentiator |
| P1 | Streaks + XP + badges persistence | 1 day | High — student retention |
| P2 | OpenFang persistent memory integration | 2-3 days | High — tutor remembers context |
| P2 | Spaced repetition engine | 2-3 days | High — learning outcomes |
| P2 | OpenFang WhatsApp parent reports | 1-2 days | High — parent engagement |
| P3 | Adaptive difficulty pipeline (data-driven) | 2 days | Medium — better tutoring |
| P3 | Practice mode (quiz/test separate from chat) | 3-4 days | Medium — exam prep |
| P3 | Visual math aids (SVG fraction diagrams) | 2-3 days | Medium — comprehension |
| P4 | Curriculum knowledge graph | 3-5 days | Medium — prerequisite tracking |
| P4 | Homework photo upload (OCR + vision) | 2-3 days | Medium — convenience |
| P4 | Offline PWA support | 3-4 days | Medium — rural access |
