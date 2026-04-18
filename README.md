# Recipe Book

A personal recipe management web app built with Next.js, TypeScript, Prisma, and Neon (PostgreSQL), deployed to Vercel.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 7 |
| Database | Neon (serverless PostgreSQL) |
| Hosting | Vercel |

## Features

- Browse, search, and filter recipes
- Create, edit, and delete recipes with full CRUD
- Ingredients list with amounts and units
- Step-by-step instructions
- Categories and tags for organisation
- Recipe image support (via URL)
- Responsive layout

## Project Structure

```
src/
  app/
    page.tsx                    # Home page — recent recipes + categories
    recipes/
      page.tsx                  # All recipes with search/filter
      new/page.tsx              # Create recipe form
      [slug]/
        page.tsx                # Recipe detail view
        edit/page.tsx           # Edit recipe form
        DeleteButton.tsx        # Client-side delete button
        not-found.tsx           # 404 for missing recipes
    api/
      recipes/route.ts          # GET all, POST new
      recipes/[id]/route.ts     # GET one, PUT, DELETE
      categories/route.ts       # GET all, POST new
  components/
    Navigation.tsx              # Top nav bar
    RecipeCard.tsx              # Recipe preview card
    RecipeForm.tsx              # Shared create/edit form
  lib/
    prisma.ts                   # Prisma client singleton
    utils.ts                    # slugify, formatTime helpers
  types/
    index.ts                    # Shared TypeScript types
  generated/prisma/             # Auto-generated Prisma client (gitignored)
prisma/
  schema.prisma                 # Database schema
  seed.ts                       # Sample data seed script
```

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd recipe-book
npm install
```

### 2. Set up Neon database

1. Create a free database at [console.neon.tech](https://console.neon.tech)
2. Copy your connection string
3. Create `.env` from the example:

```bash
cp .env.example .env
```

4. Replace the `DATABASE_URL` in `.env` with your Neon connection string:

```
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/recipebook?sslmode=require"
```

### 3. Apply schema and generate client

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database (no migration history)
# or for migrations:
npm run db:migrate    # Apply migrations
```

### 4. Seed sample data (optional)

```bash
npm run db:seed
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate` | Create and apply a new migration |
| `npm run db:push` | Push schema changes without migration history |
| `npm run db:seed` | Seed sample recipes |
| `npm run db:studio` | Open Prisma Studio (GUI) |

## Deploying to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Link to Vercel: `vercel link`
3. Add environment variable in Vercel dashboard: `DATABASE_URL`
4. Deploy: `vercel --prod`

Or connect the GitHub repo to Vercel for automatic deployments on every push.

## Adding Features (future ideas)

- Meal planning / weekly planner
- Shopping list generation from ingredients
- Recipe rating and favourites
- Upload images to Vercel Blob instead of external URLs
- Authentication (Clerk or NextAuth) for multi-user support
- Nutritional information via an external API
- Print-friendly recipe view
