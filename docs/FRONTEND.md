# Frontend Agent Reference

## Component Architecture

### Page (`src/app/page.tsx`)
Client component with state machine:
```
idle → (click) → loading → success | error
success → (re-click) → loading
error → (retry) → loading
```

State variables:
- `status`: `"idle" | "loading" | "success" | "error"`
- `pdfBlob`: `Blob | null`
- `newsItems`: `NewsItem[] | null`
- `errorMessage`: `string | null`

### Components

| Component | File | Props | Description |
|-----------|------|-------|-------------|
| HeroSection | `src/components/hero-section.tsx` | none | App title "News IA", subtitle, current date. Static. |
| GenerateButton | `src/components/generate-button.tsx` | `onClick`, `isLoading` | Main CTA. Uses shadcn Button. Disabled + spinner when loading. |
| LoadingState | `src/components/loading-state.tsx` | none | 3 skeleton cards + animated pulse. Uses shadcn Skeleton. |
| NewsPreview | `src/components/news-preview.tsx` | `news: NewsItem[]` | Renders 3 NewsCard in a column. |
| NewsCard | `src/components/news-card.tsx` | `news: NewsItem`, `index: number` | Single card: number badge, title, description, source. Uses shadcn Card. |
| DownloadButton | `src/components/download-button.tsx` | `pdfBlob: Blob` | Creates object URL, triggers download with date-named file. |
| ErrorState | `src/components/error-state.tsx` | `message: string`, `onRetry` | Error message + retry button. |

### API Call Pattern
```typescript
const response = await fetch("/api/generate", { method: "POST" });
if (!response.ok) {
  const { error } = await response.json();
  throw new Error(error);
}
const newsHeader = response.headers.get("X-News-Data");
const newsItems = JSON.parse(decodeURIComponent(newsHeader!));
const pdfBlob = await response.blob();
```

### Styling Rules
- Max width: `max-w-2xl` centered container
- Spacing: `space-y-8` between sections
- Cards: shadcn Card with subtle border, `p-6`
- Colors: use CSS variables from globals.css (shadcn theme)
- Responsive: single column, padding adjusts on mobile (`px-4 sm:px-6`)
- Font: Inter via `next/font/google`

### Do NOT Touch
- `src/app/api/` — backend scope
- `src/lib/openrouter.ts` — backend scope
- `src/lib/pdf-generator.ts` — backend scope
- `src/lib/prompts.ts` — backend scope
