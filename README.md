# News IA — AI-Powered Newsletter Generator

> Turn any topic into a ready-to-read AI news briefing in seconds. No manual curation. No setup. Just results.

**Live demo:** [news-ia-rosy.vercel.app](https://news-ia-rosy.vercel.app)

---

## What it does

News IA is a single-page web application that automates the full newsletter workflow end-to-end:

1. **Collect** — Searches the web for the latest AI news using Perplexity Sonar Pro via OpenRouter
2. **Summarize** — Distills the top 3 stories into clean, structured summaries
3. **Generate** — Produces a polished, downloadable PDF — fonts embedded, French accents supported, no layout drift

One button. One request. One PDF ready to share.

---

## Architecture

```
Browser (Next.js 15 App Router)
        │
        │  POST /api/generate
        ▼
┌─────────────────────────────────┐
│         API Route               │
│   src/app/api/generate/         │
│                                 │
│  1. OpenRouter call             │
│     └─ perplexity/sonar-pro     │  ← web search + summarization
│  2. JSON parse + validation     │
│  3. PDF generation (jsPDF)      │
└─────────────────────────────────┘
        │
        │  Response
        ├─ Body: PDF binary (application/pdf)
        └─ Header X-News-Data: JSON of the 3 news items (for frontend preview)
```

No database. No authentication. Fully stateless.

---

## The agent team

This project was built and is maintained using a **3-agent Claude Code team** that works in parallel. Each agent owns a strict scope.

| Agent | Scope | Reference |
|---|---|---|
| `frontend` | UI components, page, Tailwind/shadcn, state machine | `docs/FRONTEND.md` |
| `backend` | API route, OpenRouter integration, PDF layout | `docs/BACKEND.md` |
| `orchestrator` | Setup, integration, deploy checklist | `docs/ORCHESTRATOR.md` |

Agent definitions live in `.claude/agents/`. Editing a spec there changes what the relevant agent does on the next run.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript, `src/` directory) |
| UI | Tailwind CSS v4 + shadcn/ui (New York style) |
| AI / Search | OpenRouter API → `perplexity/sonar-pro` |
| PDF | jsPDF with embedded Inter TTF fonts (server-side) |
| Deployment | Vercel (auto-deploy on push to `main`) |

---

## Quick start

### Prerequisites

- Node.js ≥ 18
- An [OpenRouter](https://openrouter.ai) API key

### Install & run

```bash
git clone https://github.com/arthurleroy2121/AI-Newsletter.git
cd AI-Newsletter
npm install
```

Create a `.env.local` at the root:

```env
OPENROUTER_API_KEY=your_openrouter_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000   # optional
```

```bash
npm run dev
# → http://localhost:3000
```

### Other commands

```bash
npm run build        # Production build (TypeScript check + bundle)
npm run lint         # ESLint
npx shadcn@latest add <component>   # Add a shadcn/ui component
```

---

## Repo layout

```
.
├── README.md
├── CLAUDE.md                    ← architecture & coding conventions for AI agents
├── AGENTS.md                    ← agent team protocol
│
├── .claude/agents/              ← agent definitions (frontend, backend, orchestrator)
│
├── src/
│   ├── app/
│   │   ├── page.tsx             ← single-page UI
│   │   ├── layout.tsx
│   │   └── api/generate/        ← POST endpoint: search → summarize → PDF
│   ├── components/
│   │   └── ui/                  ← shadcn/ui primitives
│   ├── lib/
│   │   ├── openrouter.ts        ← OpenRouter client
│   │   ├── pdf-generator.ts     ← jsPDF A4 layout, embedded fonts
│   │   ├── prompts.ts           ← system prompts for the AI
│   │   └── types.ts             ← shared TypeScript interfaces
│   └── config/                  ← app-wide constants (colors, app name)
│
├── public/fonts/                ← Inter-Regular.ttf + Inter-Bold.ttf (PDF rendering)
├── docs/                        ← FRONTEND.md, BACKEND.md, ORCHESTRATOR.md
└── vercel.json                  ← function timeout: 60s
```

---

## Design system

| Token | Value |
|---|---|
| Font | Inter (Google Fonts on web, embedded TTF in PDF) |
| Primary text | `#1A1A2E` |
| Secondary text | `#4A4A6A` |
| Accent | `#6C63FF` (purple) |
| Light accent bg | `#F4F3FF` |
| Background | White |

---

## Deployment

The app auto-deploys to Vercel on every push to `main`. No manual step needed.

Required env var on Vercel: `OPENROUTER_API_KEY`.
