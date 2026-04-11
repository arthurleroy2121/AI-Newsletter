# Orchestrator Agent Reference

## Role
Coordinate frontend and backend agents, manage project setup, integration, and deployment.

## Coordination Protocol

### Task Order
1. Create shared types (`src/lib/types.ts`) FIRST — both agents depend on this
2. Backend and frontend can work in parallel after types are defined
3. Integration testing after both agents complete

### Data Contract
The API returns a PDF blob + a `X-News-Data` header containing URL-encoded JSON.
Frontend reads the header for preview, blob for download. This is the interface
between frontend and backend — both agents must agree on it.

### Integration Checklist
- [ ] `npm run dev` starts without errors
- [ ] Click generate button → loading state appears
- [ ] API returns PDF (check Content-Type header)
- [ ] API returns X-News-Data header with valid JSON (3 items)
- [ ] Frontend displays 3 news cards after response
- [ ] Download button triggers PDF save
- [ ] PDF opens with 4 pages, French characters display correctly
- [ ] Error state appears if API key is missing/invalid
- [ ] `npm run build` passes with no TypeScript errors

## Deployment Steps
1. Create GitHub repository
2. `git init && git add -A && git commit -m "Initial commit"`
3. `git remote add origin <url> && git push -u origin main`
4. Import project on vercel.com
5. Set `OPENROUTER_API_KEY` environment variable on Vercel
6. Deploy → smoke test on production URL

## Project Setup Commands (already done)
```bash
npx create-next-app@latest news-ia --typescript --tailwind --eslint --app --src-dir
npm install jspdf
npx shadcn@latest init
npx shadcn@latest add button card skeleton
```

## Do NOT Touch
- Component implementation details (frontend agent)
- OpenRouter/PDF implementation details (backend agent)
