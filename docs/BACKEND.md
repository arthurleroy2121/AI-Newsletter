# Backend Agent Reference

## API Route: `POST /api/generate`

File: `src/app/api/generate/route.ts`

### Flow
1. Call `fetchAINews()` from `src/lib/openrouter.ts`
2. Call `generatePDF(news)` from `src/lib/pdf-generator.ts`
3. Return Response with PDF binary + `X-News-Data` header

### Response Format
```typescript
return new Response(pdfBuffer, {
  status: 200,
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="news-ia-${dateStr}.pdf"`,
    "X-News-Data": encodeURIComponent(JSON.stringify(news)),
  },
});
```

## OpenRouter Integration

File: `src/lib/openrouter.ts`

### Config
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Model: `perplexity/sonar-pro`
- Temperature: 0.3
- Max tokens: 4000

### Headers
```
Authorization: Bearer ${OPENROUTER_API_KEY}
Content-Type: application/json
HTTP-Referer: ${NEXT_PUBLIC_APP_URL}
X-Title: News IA
```

### Response Parsing
1. Extract `data.choices[0].message.content`
2. Strip markdown code fences: `content.replace(/```json\n?/g, "").replace(/```\n?/g, "")`
3. `JSON.parse()` → validate 3 items with title, description, source, url
4. Throw descriptive error if structure is invalid

### Prompts (in `src/lib/prompts.ts`)
- System prompt: French tech journalist persona, strict JSON schema output
- User prompt: Ask for top 3 AI news from last 24h in JSON

## PDF Generation

File: `src/lib/pdf-generator.ts`

### Setup
- jsPDF: `new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })`
- Embed Inter fonts via `doc.addFileToVFS()` + `doc.addFont()`
- Read font files from `public/fonts/` using `fs.readFileSync` + base64

### Color Palette
- Background: `#FFFFFF`
- Primary text: `#1A1A2E` → RGB(26, 26, 46)
- Secondary text: `#4A4A6A` → RGB(74, 74, 106)
- Accent: `#6C63FF` → RGB(108, 99, 255)
- Light accent bg: `#F4F3FF` → RGB(244, 243, 255)

### Page 1 — Cover
- Light purple rectangle covering top 60% of page
- "NEWS IA" centered at y=80mm, 48pt bold, primary color
- Accent line (40mm wide, 1pt) centered below title
- Subtitle: "Resume quotidien de l'intelligence artificielle" at y=110mm, 14pt
- Date centered at y=160mm, 12pt secondary
- "Top 3 des actualites IA des dernieres 24 heures" at y=175mm, 11pt

### Pages 2-4 — News Items
- Header bar: "NEWS IA" left + "Actualite N/3" center + date right, 10pt
- Accent line full width below header
- Large number (N) at y=45mm, 60pt bold, accent color
- Title at y=58mm, 22pt bold, primary — use `splitTextToSize(title, 170)`
- Short accent line (20mm) below title
- Description body at y=80mm, 12pt, secondary — use `splitTextToSize(desc, 170)`
- Footer: source + URL at bottom, accent line, page number centered

### Font Embedding
```typescript
import fs from "fs";
import path from "path";

const fontDir = path.join(process.cwd(), "public", "fonts");
const regularFont = fs.readFileSync(path.join(fontDir, "Inter-Regular.ttf")).toString("base64");
const boldFont = fs.readFileSync(path.join(fontDir, "Inter-Bold.ttf")).toString("base64");

doc.addFileToVFS("Inter-Regular.ttf", regularFont);
doc.addFont("Inter-Regular.ttf", "Inter", "normal");
doc.addFileToVFS("Inter-Bold.ttf", boldFont);
doc.addFont("Inter-Bold.ttf", "Inter", "bold");
doc.setFont("Inter");
```

### Return
`doc.output("arraybuffer")` → `ArrayBuffer`

## Do NOT Touch
- `src/app/page.tsx` — frontend scope
- `src/app/layout.tsx` — frontend scope
- `src/components/` — frontend scope
