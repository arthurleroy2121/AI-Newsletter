# News IA - AI News Summary Generator

## Project Overview

Web application that generates a downloadable PDF summary of the top 3 AI news
stories from the last 24 hours. Single-page app with one button that triggers
the full workflow: search → summarize → generate PDF.

No authentication. No database. Stateless.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript, src/ directory)
- **UI**: Tailwind CSS v4 + shadcn/ui (New York style)
- **PDF**: jsPDF with embedded Inter TTF fonts (server-side generation)
- **AI**: OpenRouter API → perplexity/sonar-pro model (web search + summarization)
- **Deploy**: Vercel (GitHub integration)

### Key Directories
- `src/app/` — Next.js App Router (pages, layouts, API routes)
- `src/app/api/generate/` — Single POST endpoint for the entire workflow
- `src/components/` — React components (`ui/` for shadcn primitives)
- `src/lib/` — Core logic: OpenRouter client, PDF generator, prompts, types
- `src/config/` — App-wide constants (colors, app name, etc.)
- `public/fonts/` — Inter-Regular.ttf and Inter-Bold.ttf for PDF rendering
- `.claude/agents/` — Agent team definitions (frontend, backend, orchestrator)
- `docs/` — Detailed reference docs for each agent

### Single API Endpoint
`POST /api/generate` — Calls OpenRouter, generates PDF, returns:
- Body: PDF binary (application/pdf)
- Header `X-News-Data`: URL-encoded JSON of the 3 news items (for frontend preview)

## Coding Conventions

### TypeScript
- Strict mode enabled
- Use `interface` (not `type`) for object shapes
- All exported functions must have explicit return types
- Use `const` by default, `let` only when reassignment is needed
- No `any` — use `unknown` with type guards if needed

### React / Next.js
- App Router conventions: `page.tsx`, `layout.tsx`, `route.ts`
- Client components: `"use client"` directive at top of file
- Server components by default unless interactivity is needed
- Props interfaces: `{ComponentName}Props`
- State management: React hooks (`useState`, `useCallback`) — no external state lib

### Tailwind CSS + shadcn/ui
- shadcn/ui components live in `src/components/ui/`
- Use `cn()` from `src/lib/utils.ts` for conditional class merging
- Mobile-first responsive design
- Follow shadcn/ui theming via CSS variables in `globals.css`

### API Routes
- Use Next.js Route Handlers (`export async function POST(request)`)
- Always return typed JSON errors with appropriate HTTP status codes
- Wrap handler body in try/catch
- Log errors with `console.error` and include context

### PDF Generation
- All PDF logic in `src/lib/pdf-generator.ts`
- A4 format, millimeters as unit
- Embedded Inter fonts for French character support (accents)
- Color palette: white bg, `#1A1A2E` text, `#6C63FF` accent, `#4A4A6A` secondary
- Return `ArrayBuffer` from generator function

## Environment Variables
- `OPENROUTER_API_KEY` — Required. OpenRouter API key for perplexity/sonar-pro.
- `NEXT_PUBLIC_APP_URL` — Optional. Production URL (used in OpenRouter referer header).

## Commands
```bash
npm run dev          # Dev server on localhost:3000
npm run build        # Production build (TypeScript check + bundle)
npm run lint         # ESLint
npx shadcn@latest add <component>  # Add shadcn/ui component
```

## Agent Team

This project uses a 3-agent team for parallel development.
Each agent has specific scope and responsibilities.

### Agent References
- Frontend agent → see @docs/FRONTEND.md for component specs, state machine, styling rules
- Backend agent → see @docs/BACKEND.md for API design, OpenRouter integration, PDF layout specs
- Orchestrator agent → see @docs/ORCHESTRATOR.md for coordination protocol, setup steps, deploy checklist

### Agent Files
Agent definitions live in `.claude/agents/`:
- `frontend.md` — UI components, page, Tailwind/shadcn
- `backend.md` — API route, OpenRouter, PDF generator
- `orchestrator.md` — Project setup, integration, deployment

## Error Handling Strategy
- **OpenRouter failures**: Return HTTP 500 with `{ error: "..." }` JSON
- **JSON parse failures**: Strip markdown fences, retry parse, then fail with descriptive error
- **PDF generation failures**: Return HTTP 500 with error detail
- **Client-side**: Show `ErrorState` component with retry button

## Design System
- **Font**: Inter (Google Fonts for web, embedded TTF for PDF)
- **Primary text**: `#1A1A2E`
- **Secondary text**: `#4A4A6A`
- **Accent**: `#6C63FF` (purple)
- **Light accent bg**: `#F4F3FF`
- **Background**: white
- **Style**: Minimalist, elegant, professional

## Deployment & Push to GitHub/Vercel

- **Platform**: Vercel (auto-deploy on push to `main`)
- **GitHub repo**: `https://github.com/arthurleroy2121/news-ia.git` (remote: `origin`)
- **Branch**: `main`
- **Vercel env vars**: `OPENROUTER_API_KEY` (required)
- **Function timeout**: 60s (configured in `vercel.json`)
- No database, no auth, no edge config needed

### How to push updates (for Claude)

When the user asks to push/deploy/update on GitHub or Vercel, run these steps
from the project directory `news-ia/`:

```bash
# 1. Stage all changed and new files (exclude .env, secrets, node_modules)
git add -A

# 2. Commit with a descriptive message in English
git commit -m "descriptive message here"

# 3. Push to GitHub — Vercel auto-deploys from main
git push origin main
```

**Important notes:**
- Always check `git status` first to see what changed
- Never commit `.env`, `.env.local`, or files containing API keys
- The `.claude/` directory can be committed (agent config, not secrets)
- Vercel picks up the push automatically — no manual deploy needed
- If push fails with "rejected" error, run `git pull --rebase origin main` first then push again
