# ORP — Organization Resource Planning

Open-source internal management platform for non-profit organizations. Manage members, finances, tasks, documents, announcements, events, polls, assets, and reports — all in one place.

> **No server required.** Deploy for free on [Vercel](https://vercel.com) + [Supabase](https://supabase.com) in about 15 minutes.

---

## Modules

| Module | Description |
|--------|-------------|
| **Auth** | Login, role-based access, JWT sessions, first-boot setup |
| **Members** | Member directory, roles, active/inactive status |
| **Ledger** | Track income & expenses, view running balance |
| **Tasks** | Kanban board — TODO, In Progress, Review, Done |
| **Knowledge** | Internal wiki with Markdown support |
| **Announcements** | Pin, expire, and write announcements in Markdown |
| **Events** | Schedule events + track member attendance |
| **Polls** | Single or multiple-choice polls with live results |
| **Assets** | Inventory registry with checkout/return flow |
| **Reports** | Aggregated statistics across all modules |

**Available roles:** `Super Admin` · `Treasurer` · `Secretary` · `Instructor` · `Member`

---

## Deploy on Vercel + Supabase

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New project**, enter a project name and database password, then click **Create project**
3. Wait about 2 minutes for the project to be ready

### Step 2 — Get the connection string

In your Supabase dashboard:
1. Click **Project Settings** (gear icon in the left sidebar)
2. Go to the **Database** tab
3. Scroll to **Connection string**
4. Select the **Transaction** tab (not Session or Direct!)
5. Copy the URL — it looks like this:

```
postgresql://postgres.xxxxxxxxxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

6. Append `?pgbouncer=true` to the end of that URL

> **Required: use Transaction mode (port 6543) with `?pgbouncer=true`** — this is necessary for compatibility with Vercel serverless functions. Port 5432 and Direct mode will not work.

### Step 3 — Fork & clone the repo

```bash
# Fork this repo to your GitHub account, then clone it:
git clone https://github.com/HIMCOMSCI-BINUS-Online/organization-resource-planning.git
cd orp
npm install
```

### Step 4 — Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
# Database URL from Step 2
DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Secret key for sessions — generate one with the command below
SESSION_SECRET="replace-with-a-random-string-at-least-32-characters"

# Your organization's display name (shown in navbar & landing page)
NEXT_PUBLIC_ORG_NAME="Your Organization Name"
NEXT_PUBLIC_ORG_TAGLINE="Your tagline (optional)"
```

To generate a `SESSION_SECRET`, run:
```bash
openssl rand -base64 32
```

### Step 5 — Create the database tables

```bash
npm run db:deploy
```

This runs the migration SQL against your Supabase database and creates all required tables.

### Step 6 — Generate the Prisma client

```bash
npx prisma generate
```

### Step 7 — Run locally (optional, to verify first)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to the Super Admin setup page.

### Step 8 — Deploy to Vercel

1. Push your repo to GitHub (if you haven't already)
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your repo from GitHub
4. Under **Environment Variables**, add all the variables from your `.env.local`:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_ORG_NAME`
   - `NEXT_PUBLIC_ORG_TAGLINE` (optional)
   - `NEXT_PUBLIC_SOCIAL_*` (optional, see reference table below)
5. Click **Deploy** — wait about 1–2 minutes
6. Open the URL Vercel gives you → complete the Super Admin setup → done!

---

## First Boot

When the app is opened for the first time, ORP detects that no users exist and redirects to `/onboarding`. Here you create the **Super Admin** account — the account with full access to all features.

The setup page is automatically disabled once the first account is created.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Random string, min 32 characters, used for JWT signing |
| `NEXT_PUBLIC_ORG_NAME` | Yes | Organization name (displayed in navbar) |
| `NEXT_PUBLIC_ORG_TAGLINE` | No | Tagline shown on the landing page |
| `NEXT_PUBLIC_SOCIAL_LINKEDIN_HANDLE` | No | LinkedIn handle (e.g. `your-org`) |
| `NEXT_PUBLIC_SOCIAL_LINKEDIN_URL` | No | Full LinkedIn URL |
| `NEXT_PUBLIC_SOCIAL_INSTAGRAM_HANDLE` | No | Instagram handle (e.g. `@yourorg`) |
| `NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL` | No | Full Instagram URL |

Social links are **automatically hidden** on the landing page if left empty.

---

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org) version 20 or later
- [PostgreSQL](https://postgresql.org) version 15 or later

### Setup from scratch

```bash
# 1. Create a local database
psql -c "CREATE DATABASE orp_db;"

# 2. Install dependencies
npm install

# 3. Create the config file
cp .env.example .env.local
# Edit .env.local and set DATABASE_URL to your local connection:
# DATABASE_URL="postgresql://youruser@localhost:5432/orp_db?schema=public"

# 4. Create the tables
npm run db:deploy

# 5. Generate the Prisma client
npx prisma generate

# 6. Start the server
npm run dev
```

### Common commands

```bash
npm run dev           # Start development server at localhost:3000
npm run build         # Production build
npm run test          # Run all tests (unit + integration)
npm run test:unit     # Unit tests only — no database needed, fast
npm run test:db       # Integration tests — requires a database
npm run db:deploy     # Apply migrations to the database
npm run db:studio     # Open Prisma Studio (visual DB browser) at localhost:5555
npx prisma generate   # Regenerate the Prisma client
```

---

## Testing

ORP includes a full test suite to verify all features work correctly.

### Running tests

```bash
# All tests at once
npm run test

# Unit tests only — no database required, runs in under 1 second
npm run test:unit

# Integration tests — requires a running local database
npm run test:db
```

### Test coverage

| File | Coverage |
|------|----------|
| `tests/01-validation.test.ts` | Form validation (Zod schemas) — login, onboarding |
| `tests/02-session.test.ts` | JWT session — encrypt, decrypt, tampered tokens |
| `tests/03-database.test.ts` | All database models — CRUD, constraints, cascade deletes |
| `tests/04-permissions.test.ts` | Role permission matrix for all 5 roles |
| `tests/05-queries.test.ts` | Query helpers — filters, pagination, aggregations |

**Total: 97 tests** covering all 11 modules.

---

## Project Structure

```
orp/
├── app/
│   ├── (dashboard)/        # All pages after login
│   │   └── dashboard/
│   │       ├── members/
│   │       ├── ledger/
│   │       ├── tasks/
│   │       ├── knowledge/
│   │       ├── announcements/
│   │       ├── events/
│   │       ├── polls/
│   │       ├── assets/
│   │       └── reports/
│   ├── actions/            # Server Actions (create, update, delete)
│   ├── components/         # Shared UI components
│   ├── lib/                # Utilities: database, session, queries, validation
│   └── page.tsx            # Landing page
├── prisma/
│   ├── schema.prisma       # Database schema (all models)
│   └── migrations/         # Migration SQL (single clean file)
├── tests/                  # Test suite
└── proxy.ts                # Route protection (replaces middleware)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Prisma 7 |
| Auth | JWT (jose 6) + bcryptjs |
| Validation | Zod 4 |
| Animations | GSAP 3 + ScrollTrigger |
| Markdown | react-markdown + remark-gfm |
| Icons | lucide-react |
| Testing | Vitest |
| Hosting | Vercel |
| Database hosting | Supabase |

---

## FAQ

**Can I use a database other than Supabase?**
Yes — any PostgreSQL instance works. Update `DATABASE_URL` to your connection string. For Vercel deployments, use a connection pooler.

**Can I self-host?**
Yes. Run `npm run build && npm start` on any server with Node.js 20+.

**How do I add a new member?**
Log in as Super Admin or Secretary → Members → click **+ New Member**.

**What if someone forgets their password?**
There is currently no self-service password reset. A Super Admin can update a member's password via Members → Edit.

---

## License

MIT — free to use, modify, and deploy for your organization.
