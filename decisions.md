# Architecture Decisions

A record of key decisions made during development to make it easy to resume or extend the project.

---

## 1. Next.js App Router (not Pages Router)

**Decision:** Use the App Router (`src/app/`) introduced in Next.js 13.

**Why:** App Router enables React Server Components, which let us query the database directly from page components without an intermediate API call. This simplifies code and improves performance (no client-side data fetching waterfalls for initial page loads).

**Impact:** Pages like `app/page.tsx` and `app/recipes/[slug]/page.tsx` are async server components that call `prisma` directly.

---

## 2. Prisma 7 with `prisma-client-js` generator

**Decision:** Use Prisma 7 with the classic `prisma-client-js` generator (not the new `prisma-client` generator).

**Why:** Prisma 7's new `prisma-client` generator requires Prisma Accelerate (their managed proxy service). Since we're connecting directly to Neon via a standard PostgreSQL connection string, `prisma-client-js` is the correct choice. It outputs to `node_modules/@prisma/client` as usual.

**Impact:** Import from `@prisma/client`. `package.json` includes `"build": "prisma generate && next build"` so Vercel regenerates the client on every deploy. The singleton pattern in `src/lib/prisma.ts` prevents multiple client instances in dev hot-reload.

---

## 3. Neon (serverless PostgreSQL)

**Decision:** Use Neon for the database instead of PlanetScale, Supabase, or Railway.

**Why:** Neon has a generous free tier, scales to zero automatically (costs nothing when idle), has native Vercel integration, and supports the standard PostgreSQL connection string that Prisma uses without any special adapters.

**Impact:** `DATABASE_URL` must include `?sslmode=require`. Set this in both `.env` (local) and Vercel environment variables (production).

---

## 4. `db:push` vs `db:migrate` for schema changes

**Decision:** Use `prisma db push` for development, `prisma migrate dev` when you need a migration history.

**Why:** `db push` is faster for early-stage development where the schema changes frequently. Once the schema stabilises, switch to `migrate dev` for proper migration history that can be deployed safely to production.

**Impact:** Run `npm run db:push` during active development. Use `npm run db:migrate` when you're ready to commit schema changes that need to be tracked.

---

## 5. Slug-based URLs (not ID-based)

**Decision:** Recipes use `slug` in URLs (e.g., `/recipes/spaghetti-carbonara`), not database IDs.

**Why:** Slugs are human-readable and SEO-friendly. The `slugify` utility in `src/lib/utils.ts` generates a slug from the title, with suffix deduplication (`-1`, `-2`, etc.) to handle duplicates.

**Impact:** `slug` is a unique field on the `Recipe` model. When updating a title, the slug is also regenerated. API internal routes (`/api/recipes/[id]`) still use the database ID for stability.

---

## 6. Server Components fetch directly from DB; Client Components use the API

**Decision:** Server components (pages) call `prisma` directly. Client components (forms, delete button) hit the REST API at `/api/recipes`.

**Why:** This keeps the architecture simple — no need for React Query or SWR for initial loads, while still supporting client-side interactivity where needed (forms with dynamic field lists, optimistic deletes).

**Impact:** `RecipeForm.tsx` and `DeleteButton.tsx` are `"use client"` components that use `fetch` to the API. All page-level data fetching is server-side.

---

## 7. Tags implemented as a many-to-many join table

**Decision:** `Tag` and `Recipe` have a many-to-many relationship via `RecipeTag`.

**Why:** Tags are shared across recipes (e.g., "italian" tag can apply to many recipes). A join table avoids duplication and enables filtering by tag.

**Impact:** When creating/editing a recipe, tags are accepted as a comma-separated string in the UI. The API upserts tags by slug, then creates `RecipeTag` records.

---

## 8. Tailwind CSS v4

**Decision:** Use Tailwind v4 (the version scaffolded by `create-next-app`).

**Why:** It's the latest version and ships with better performance. Tailwind v4 has no `tailwind.config.js` — configuration is done via CSS (`src/app/globals.css`) and PostCSS (`postcss.config.mjs`).

**Impact:** Stone colour palette used for neutral UI tones; amber for primary accents. No dark mode implemented yet.

---

## Current Status (as of initial build)

- **GitHub:** https://github.com/martineh4/recipe-book
- **Vercel:** not yet deployed — database must be connected first
- **Database:** schema written, not yet applied to a real Neon instance

## Resuming Development Checklist

When picking this project back up in a new session:

1. Ensure `.env` has a valid `DATABASE_URL` from [console.neon.tech](https://console.neon.tech)
2. Run `npm run db:push` to apply the schema (first time) or `npm run db:migrate` for tracked changes
3. Run `npm run db:generate` to regenerate the Prisma client (runs automatically on `npm run build`)
4. Run `npm run dev` to start the dev server at http://localhost:3000
5. Check `prisma/schema.prisma` for the current data model before making schema changes
6. Review this file for architectural constraints before adding features

## What Still Needs Doing

- [ ] Create Neon database and set `DATABASE_URL` in `.env`
- [ ] Run `npm run db:push` to apply schema to Neon
- [ ] Connect GitHub repo to Vercel and add `DATABASE_URL` as an env var
- [ ] (Optional) run `npm run db:seed` for sample recipes
- [ ] (Optional) set up a custom domain on Vercel
