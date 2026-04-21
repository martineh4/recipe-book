# Architecture

## Request Flow

```
Browser
  │
  ▼
Vercel Edge (CDN / routing)
  │
  ├─── Static pages (/_not-found, /recipes/new)
  │         served from CDN — no server hit
  │
  └─── Dynamic pages & API routes
            │
            ▼
        Next.js App Router (Node.js 24, iad1)
            │
            ├── Server Components (pages)
            │     query Prisma directly
            │     │
            │     ▼
            │   PrismaNeonHttp adapter
            │     │
            │     ▼
            │   Neon PostgreSQL (serverless, us-east-1)
            │
            └── Client Components → REST API routes
                  │                    │
                  │  fetch()           ▼
                  │              /api/recipes
                  │              /api/recipes/[id]
                  │              /api/categories
                  │                    │
                  │                    ▼
                  │              PrismaNeonHttp adapter
                  │                    │
                  │                    ▼
                  │              Neon PostgreSQL
                  │
                  └── (response → router.push / router.refresh)
```

## Page Map

```
app/
├── layout.tsx                    Root layout — wraps every page
│     └── <Navigation />          Sticky top nav (client component)
│
├── page.tsx                      Home — recent recipes + category links
│     └── <RecipeCard />          ×N (one per recent recipe)
│
└── recipes/
      ├── page.tsx                All Recipes — search, category, cook time filter
      │     └── <RecipeCard />    ×N (one per result)
      │
      ├── new/
      │     └── page.tsx          Create Recipe
      │           └── <RecipeForm mode="create" />
      │
      └── [slug]/
            ├── page.tsx          Recipe Detail — ingredients, steps, tags
            │     └── <DeleteButton />
            │
            ├── edit/
            │     └── page.tsx    Edit Recipe
            │           └── <RecipeForm mode="edit" initialData={...} />
            │
            └── not-found.tsx     404 — shown when slug has no match
```

## Data Flow by Page

```
Home (/)
  Server → prisma.recipe.findMany (take 6, desc)
         → prisma.category.findMany
         → prisma.recipe.count
  Renders: RecipeCard × recent, category links

All Recipes (/recipes)
  Server → prisma.recipe.findMany (filtered by ?q, ?category, ?cookTime)
         → prisma.category.findMany (for filter dropdown)
  Renders: search form, RecipeCard × results

Recipe Detail (/recipes/[slug])
  Server → prisma.recipe.findUnique (includes ingredients, steps, tags)
  Renders: meta panel, ingredient list, step list, tag links
  Client  → DeleteButton → DELETE /api/recipes/[id]

New Recipe (/recipes/new)
  No server fetch
  Client  → RecipeForm → GET /api/categories (populate dropdown)
                       → POST /api/recipes → redirect to /recipes/[slug]

Edit Recipe (/recipes/[slug]/edit)
  Server → prisma.recipe.findUnique (includes ingredients, steps, tags)
  Client  → RecipeForm → GET /api/categories (populate dropdown)
                       → PUT /api/recipes/[id] → redirect to /recipes/[slug]
```

## API Routes

```
GET  /api/recipes          → prisma.recipe.findMany (all, with category)
POST /api/recipes          → prisma.recipe.create (with ingredients, steps, tags)

GET    /api/recipes/[id]   → prisma.recipe.findUnique
PUT    /api/recipes/[id]   → prisma.recipe.update (replaces ingredients, steps, tags)
DELETE /api/recipes/[id]   → prisma.recipe.delete (cascades to ingredients, steps, tags)

GET  /api/categories       → prisma.category.findMany
POST /api/categories       → prisma.category.create
```

## Database Schema

```
Category
  id (cuid)  name (unique)  slug (unique)  createdAt
  └─< Recipe (categoryId, nullable)

Recipe
  id (cuid)  title  slug (unique)  description?  servings
  prepTime   cookTime  imageUrl?  categoryId?  createdAt  updatedAt
  ├─< Ingredient (recipeId, cascade delete)
  ├─< Step      (recipeId, cascade delete)
  └─< RecipeTag (recipeId, cascade delete)

Ingredient
  id  recipeId  name  amount  unit?  order

Step
  id  recipeId  instruction  order

Tag
  id (cuid)  name (unique)  slug (unique)
  └─< RecipeTag (tagId, cascade delete)

RecipeTag                        ← join table
  recipeId + tagId (composite PK)
```

## Key Libraries

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js | 16.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| ORM | Prisma | 7.7.0 |
| DB adapter | @prisma/adapter-neon + PrismaNeonHttp | 7.7.0 |
| DB driver | @neondatabase/serverless | 1.1.0 |
| Database | Neon PostgreSQL | serverless |
