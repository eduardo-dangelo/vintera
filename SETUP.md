# Vintera setup guide

Forked from manager-pro with a **clean start**: no database data, no shared Clerk app, and new secrets. Use this checklist after cloning the repo.

## Quick start

1. Copy the env template: `cp .env.example .env`
2. Fill in **required** variables (see below)
3. Install and run:

```bash
npm install
npm run dev
```

4. Open http://localhost:3000 and sign up with a **new** Clerk user.

Variable names are defined in [`.env.example`](.env.example).

---

## Required for local development

### Clerk (authentication)

1. Create a new application at [clerk.com](https://clerk.com) named **Vintera** (do not reuse manager-pro).
2. Copy keys into `.env`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. In Clerk Dashboard → **Domains / URLs**, add:
   - `http://localhost:3000` for development
   - Your production URL when you deploy
4. Sign-in routes: `/sign-in`, `/sign-up` (locale-prefixed when using i18n).

### Database (schema only, no data copy)

- **Do not** copy `local.db` or any dump from manager-pro.
- `npm run dev` starts PGlite (`pglite-server --db=local.db`) and creates a **new** empty database.
- Set `DATABASE_URL` in `.env` (default in `.env.example` works with local PGlite).
- Drizzle migrations run on startup and create **empty tables** (see `src/instrumentation.ts` → `DBMigration.ts`).
- Migrations in `migrations/` define table structure; they are not data.

### Required env vars

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client |
| `CLERK_SECRET_KEY` | Clerk server |
| `DATABASE_URL` | PostgreSQL connection (local PGlite or remote) |

---

## Production and CI

### PostgreSQL

Provision a **new** database for Vintera. Do not point `DATABASE_URL` at manager-pro’s production DB. Migrations run at build/start automatically.

### Vercel

1. Create a **new** Vercel project linked to `eduardo-dangelo/vintera`.
2. Copy env vars from `.env` into the Vercel project settings.
3. Set `NEXT_PUBLIC_APP_URL` to your production domain.
4. Set `CRON_SECRET` for the reminder cron (`vercel.json` → `/api/cron/check-event-reminders`).

### GitHub Actions

Add repository secret:

- `CLERK_SECRET_KEY` — required for E2E tests in CI

CI sets `NEXT_PUBLIC_SENTRY_DISABLED=true` for builds. You may need Clerk and `DATABASE_URL` configured for `npm run build` in Actions.

---

## Optional services

| Service | Env vars | Notes |
|---------|----------|--------|
| Vercel Blob | `BLOB_READ_WRITE_TOKEN` | Production uploads; dev uses `/public/uploads` |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_*` | Or keep `NEXT_PUBLIC_SENTRY_DISABLED=true` |
| Arcjet | `ARCJET_KEY` | Bot/rate limiting in middleware |
| PostHog | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Analytics |
| Better Stack | `NEXT_PUBLIC_BETTER_STACK_*` | Logging |
| DVLA / MOT | `DVLA_*`, `MOT_HISTORY_*` | UK vehicle lookup only |
| Checkly | `CHECKLY_*` | Monitoring (workflow commented out in repo) |
| Crowdin | `CROWDIN_*` | i18n sync (workflow commented out) |

---

## What not to commit

See [`.gitignore`](.gitignore). Never commit:

- `.env` or any file with real secrets
- `local.db/` or `.pglite/` (local database **data**)
- `node_modules/`, `.next/`, build output
- `/public/uploads` (local dev uploads)
- `.vercel/` (deployment link)

**Safe to commit:** `.env.example`, `SETUP.md`, `migrations/` (schema scripts only), application source.

Verify before pushing:

```bash
git status
git check-ignore -v .env local.db .next node_modules
```

---

## Easy to overlook

- **Clerk vs DB users:** Signing in creates users in your new Clerk app; the app syncs to the DB on first use. Manager-pro users do not carry over.
- **localStorage:** Keys use prefix `vintera:assetsListPrefs:` — old manager-pro prefs in the browser are not used.
- **Third-party dashboards:** Create new Sentry, PostHog, Arcjet, Blob, etc. projects for Vintera, or leave optional integrations disabled.
