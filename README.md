# Moeed Rana — AI Portfolio, CMS & Personal AI Agent

Two apps:

- **`portfolio-website/portfolio`** — Next.js 16 portfolio (public site + admin CMS), Postgres via Drizzle, contact email via Resend, media uploads.
- **`portfolio-website/agent`** — FastAPI service: RAG over the CMS content (pgvector) + a LangGraph agent behind `/ask-my-ai`.

The public site, admin CMS, contact form and email all work **without** the AI service running (`AI_ENABLED=false`). Only `/ask-my-ai` needs it.

## 1. Prerequisites

- Node.js 20+, Python 3.11+
- A [Neon](https://neon.tech) Postgres database (or any Postgres 15+ with the `vector` extension available)
- A [Resend](https://resend.com) account (for the contact form's owner notification + auto-reply)
- An OpenAI API key (only if you want `/ask-my-ai` to work)

## 2. Database

```bash
cd portfolio-website/portfolio
cp .env.example .env.local   # fill in DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD (12+ chars), RESEND_API_KEY, MAIL_FROM, OWNER_EMAIL
npm install
npm run db:migrate   # creates all tables + the pgvector extension
npm run db:seed      # creates your admin login + seeds site content, projects, theme presets
```

## 3. Run the website

```bash
npm run dev           # http://localhost:3000
```

Log in at `/admin/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set above. From there you can edit every section of the site, upload media, manage projects/testimonials, edit the theme, and read contact messages — no code changes needed.

## 4. Run the AI service (optional, for /ask-my-ai)

**OpenAI has no permanent free API tier** (a brand-new account gets a small trial credit, then it's pay-as-you-go). So the AI service defaults to **Google Gemini**, which has a genuinely free tier — no card required to start.

Get a free Gemini key: **https://aistudio.google.com/apikey** → "Create API key". The free tier is rate-limited (requests per minute, not unlimited), which is plenty for a portfolio's `/ask-my-ai`.

```bash
cd portfolio-website/agent
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in `portfolio-website/agent/.env`:

```
DATABASE_URL=<the SAME Neon connection string you put in portfolio-website/portfolio/.env.local>
INTERNAL_API_KEY=<any long random string you make up>
AI_ENABLED=true
AI_PROVIDER=gemini
GEMINI_API_KEY=<your free key from aistudio.google.com>
```

```bash
uvicorn app.main:app --reload --port 8000
```

Then in `portfolio-website/portfolio/.env.local`:

```
AI_ENABLED=true
AI_SERVICE_URL=http://localhost:8000
INTERNAL_API_KEY=<the exact same value as agent's .env — this is what lets web talk to agent>
```

Restart `npm run dev`, then in the admin panel go to **AI Knowledge → Sync all** to build the embeddings. `/ask-my-ai` will now answer grounded questions about your projects, services and profile, and will say plainly when it doesn't know something rather than making things up.

**Want OpenAI instead?** (paid, but arguably higher quality) — set `AI_PROVIDER=openai` and `OPENAI_API_KEY=...` in `portfolio-website/agent/.env` instead of the Gemini variables. Nothing else changes; the provider is swappable by design.

**Switching providers later:** re-run "Sync all" in AI Knowledge after switching `AI_PROVIDER` — old and new embeddings aren't compatible with each other, so a full re-sync is required (not a partial one).

## 5. Tests

```bash
cd portfolio-website/portfolio
npm test        # 28 unit tests: form/schema validation, link safety, theme tokens, content-block guards
```

## 6. Deployment

**Web (Vercel is easiest):**

1. Import `portfolio-website/portfolio` as the project root.
2. Set every variable from `.env.example` in the Vercel project settings.
3. **Media storage:** local file uploads (`public/uploads`) do **not** persist on serverless hosts like Vercel — files will vanish on redeploy. Either deploy `portfolio-website/portfolio` to a host with a persistent disk (a small VPS or a Docker container with a mounted volume), or swap `src/lib/storage.ts` for Cloudinary/S3 (the interface — `store`, `read`, `remove` — is deliberately small so this is a same-file change; nothing that calls it needs to change).
4. Run `npm run db:migrate` and `npm run db:seed` once against the production database (a one-off Vercel deploy hook or a local run pointed at the prod `DATABASE_URL` both work).

**AI service (Agent):** needs a long-lived process for SSE streaming, so it does not fit Vercel's serverless functions. Use Render, Railway, Fly.io or a small VPS: `uvicorn app.main:app --host 0.0.0.0 --port 8000`. Point `portfolio-website/portfolio`'s `AI_SERVICE_URL` at its public URL and keep `INTERNAL_API_KEY` identical on both sides — that key is the only thing authorizing web → AI agent calls, so keep it secret and never expose it to the browser.

## 7. What's configurable from the admin panel (no code changes)

Brand name/logo/favicon, hero copy, navigation & social links, footer, services & pricing, about/experience/skills, projects (full CRUD + images), testimonials, theme colors/radius/background pattern/presets, AI model settings (temperature, tokens, retrieval top-k/threshold, conversation memory), and the admin's own name/email/password.

## 8. Known gaps (by design, not oversight)

- **Local uploads need a persistent disk** — see §6.
- **Auto light/dark/system switching isn't automatic**; instead the Theme editor lets you hand-build a light theme (the "Minimal Light" preset is a starting point) and apply it — this was simpler and more reliable than auto-deriving a legible light palette from an arbitrary primary color.
- **Typography (font family) isn't admin-editable yet** — colors, radius, background pattern and motion are. Swapping fonts touches `next/font` imports in `app/layout.tsx`, which is code, not content.
- The in-memory rate limiter on `/api/contact` and `/api/ai/chat` resets on redeploy/restart; fine for a single-instance deployment, not for multi-instance scaling (swap for a Redis-backed limiter if you scale out).
