# Claude Code Instructions for Kairo Frontend

> **This file is automatically read by Claude Code.**

## This is the Frontend Repository

**Path:** `/Users/mohamed/Documents/kairo-frontend`
**Framework:** Next.js 16 with React 19, Tailwind CSS 4
**Actual app location:** `ui/` subfolder (important for deployment!)

## The Backend Exists Too

**Don't forget:** The backend is at `/Users/mohamed/Documents/Kairo-system`

Most features require changes to BOTH repos. If you're only looking at frontend code, you're probably missing half the picture.

## Read the Main Context

The primary context files are in the backend repo:
- `/Users/mohamed/Documents/Kairo-system/.claude/CONTEXT.md`
- `/Users/mohamed/Documents/Kairo-system/.claude/STATE.md`
- `/Users/mohamed/Documents/Kairo-system/docs/deployment_prep_plan.md`

## Frontend Structure

```
ui/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── brands/[brandId]/
│   │   │   ├── today/          # Today board (opportunities)
│   │   │   ├── onboarding/     # Brand setup wizard
│   │   │   └── strategy/       # Brand strategy view
│   │   └── page.tsx            # Homepage
│   ├── components/             # Reusable components
│   │   ├── onboarding/         # Wizard steps
│   │   └── today/              # Opportunity cards
│   └── lib/
│       ├── api/                # API client (Zod-validated)
│       └── env.ts              # Environment config
├── .env.local                  # Local environment variables
└── package.json
```

## Key Environment Variables

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000  # Backend URL
NEXT_PUBLIC_API_MODE=real                        # "real" or "mock"
NEXT_PUBLIC_SUPABASE_URL=...                    # For auth (Phase 1)
NEXT_PUBLIC_SUPABASE_ANON_KEY=...               # For auth (Phase 1)
```

## Mohamed's Rules (Same as Backend)

- He does NOT touch code or files. You do everything.
- Long sessions until complete.
- High quality bar. Do it right the first time.
