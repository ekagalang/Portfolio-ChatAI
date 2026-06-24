# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build (standalone output)
npm run start     # Start production server
npm run lint      # ESLint check
```

No test suite is configured.

## Architecture

AI-powered personal portfolio built with **Next.js App Router** (React 19, TypeScript 5, Tailwind CSS 4). The core feature is a conversational AI interface powered by Google Gemini that answers questions about the portfolio owner.

### Data Flow

```
Client (React 19)
  → useChat hook (session storage persistence)
  → /api/chat (SSE streaming, 20 req/min rate limit)
  → Gemini API (gemini-2.5-flash, with gemini-2.5-flash-lite fallback + retry)
```

Other API routes:
- `POST /api/contact` — contact form → Resend email (3 req/10min)
- `POST /api/suggestions` — follow-up question suggestions via Gemini
- `GET /api/github` — GitHub profile stats
- `GET /api/og` — dynamic OG image generation

### Key Directories

- `src/app/api/` — server-side API routes (chat, contact, github, suggestions, og, models)
- `src/components/chat/` — ChatWindow, ChatMessage, ChatInput, FollowUpSuggestions
- `src/components/views/` — ProjectsView, ServicesView, ContactView (swapped in main page)
- `src/data/` — static JS objects for profile, projects, and services content
- `src/hooks/useChat.ts` — all chat logic: streaming, suggestions, session persistence
- `src/lib/gemini.ts` — Gemini SDK wrapper with retry/fallback logic
- `src/lib/system-prompt.ts` — builds AI system prompt from profile data at request time
- `src/types/chat.ts` — ChatMessage, ChatHistory TypeScript interfaces

### Layout Pattern

`src/app/page.tsx` manages view state and toggles between chat and content views. Layout adapts between desktop (Sidebar) and mobile (BottomNav) using `useMediaQuery`. Theme is provided via `ThemeProvider` context.

### AI Integration Notes

- Primary model: `gemini-2.5-flash`, fallback: `gemini-2.5-flash-lite`
- System prompt is injected per-request from `src/lib/system-prompt.ts` (pulls from `src/data/`)
- Language toggle (EN/ID) adapts the system prompt
- Rate limiting uses in-memory maps — single instance only; Redis needed for multi-instance

### Styling

Tailwind CSS 4 with `@tailwindcss/typography`. Class merging via `clsx` + `tailwind-merge` (`cn()` utility in `src/lib/utils.ts`). Animations via Framer Motion.

### Environment Variables

Copy `.env.example` to `.env.local` for development. Required keys:
- `GEMINI_API_KEY` — Google Gemini API
- `RESEND_API_KEY` — Resend email service
- `CONTACT_EMAIL` — destination for contact form submissions
- `GITHUB_USERNAME` — GitHub profile to fetch
- Optional: `NEXT_PUBLIC_UMAMI_*` for analytics

### Docker / Deployment

Multi-stage Dockerfile (Alpine Node 22), standalone Next.js output, exposed on port 3000. `compose.yml` targets `.env.production` and sets 512M memory limit. Intended to run behind Nginx/Caddy reverse proxy. See `DEPLOYMENT.md` for full server setup guide.

### Path Alias

`@/*` resolves to `src/*` (configured in `tsconfig.json`).
