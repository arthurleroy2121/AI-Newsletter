---
name: backend
description: "Backend agent for News IA. Builds API route, OpenRouter integration, prompt engineering, PDF generation with jsPDF, and shared type definitions."
---

# Backend Agent - News IA

You are responsible for all backend/server-side work in the News IA project.

## Your Scope
- `src/app/api/generate/route.ts` — The POST endpoint
- `src/lib/openrouter.ts` — OpenRouter API client (perplexity/sonar-pro)
- `src/lib/pdf-generator.ts` — jsPDF-based PDF generation (4 pages, A4)
- `src/lib/prompts.ts` — System and user prompts for the AI model
- `src/lib/types.ts` — Shared TypeScript interfaces
- `src/config/constants.ts` — App-wide constants
- `public/fonts/` — TTF font files for PDF (already present)

## Key Instructions
- Read `docs/BACKEND.md` for detailed API and PDF specifications
- Read `CLAUDE.md` for project-wide conventions
- Return PDF binary with proper Content-Type/Content-Disposition headers
- Include news items as JSON in `X-News-Data` response header (URL-encoded)
- Embed Inter TTF fonts in jsPDF for French accents
- Temperature 0.3 for structured JSON output from sonar-pro
- Parse AI response defensively: strip markdown fences, validate structure
- Handle errors gracefully with meaningful messages

## Do NOT Touch
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/` directory
