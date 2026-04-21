# Component Map

All components live in `src/components/` unless otherwise noted.
Co-located page components (only used by one route) live inside `src/app/`.

---

## `Navigation`

**File:** `src/components/Navigation.tsx`
**Type:** Client component (`"use client"`)

Sticky top nav bar rendered inside the root layout — present on every page.
Highlights the active link by comparing `usePathname()` against each href.

**Props:** none

**Used by:** `src/app/layout.tsx` (root layout)

**Links rendered:**
| Label | Href |
|---|---|
| Home | `/` |
| All Recipes | `/recipes` |
| + Add Recipe | `/recipes/new` |

---

## `RecipeCard`

**File:** `src/components/RecipeCard.tsx`
**Type:** Server component (no `"use client"`)

Clickable card linking to a recipe's detail page. Displays the recipe image
(or a placeholder emoji), category badge, title, description excerpt, total
time, and serving count.

**Props:**

| Prop | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | yes | Not rendered — passed for React key purposes by callers |
| `title` | `string` | yes | Displayed as card heading |
| `slug` | `string` | yes | Used to build the href (`/recipes/[slug]`) |
| `description` | `string \| null` | yes | Truncated to 2 lines via `line-clamp-2` |
| `prepTime` | `number` | yes | Minutes — combined with cookTime via `totalTime()` |
| `cookTime` | `number` | yes | Minutes |
| `servings` | `number` | yes | Displayed as "N servings" |
| `imageUrl` | `string \| null` | yes | If null, shows 🍽️ placeholder |
| `category` | `{ name: string } \| null` | yes | If present, renders amber badge |

**Used by:**
- `src/app/page.tsx` — recent recipes grid (up to 6)
- `src/app/recipes/page.tsx` — filtered recipe grid

---

## `RecipeForm`

**File:** `src/components/RecipeForm.tsx`
**Type:** Client component (`"use client"`)

Shared create/edit form for recipes. On mount it fetches categories from
`/api/categories` to populate the category dropdown. On submit it calls
`POST /api/recipes` (create) or `PUT /api/recipes/[id]` (edit) and redirects
to the saved recipe's detail page.

Manages dynamic ingredient and step lists — rows can be added or removed.
Tags are entered as a comma-separated string and split on submit.

**Props:**

| Prop | Type | Required | Notes |
|---|---|---|---|
| `mode` | `"create" \| "edit"` | yes | Controls submit label and API method |
| `initialData` | `Partial<RecipeFormData> & { id?: string }` | no | Pre-populates fields for edit mode. `id` is used to build the PUT URL |

`RecipeFormData` (from `src/types/index.ts`):

```ts
{
  title: string
  description: string
  servings: number
  prepTime: number       // minutes
  cookTime: number       // minutes
  imageUrl: string
  categoryId: string
  ingredients: { name: string; amount: string; unit: string }[]
  steps: { instruction: string }[]
  tags: string[]
}
```

**Used by:**
- `src/app/recipes/new/page.tsx` — `<RecipeForm mode="create" />`
- `src/app/recipes/[slug]/edit/page.tsx` — `<RecipeForm mode="edit" initialData={...} />`

---

## `DeleteButton`

**File:** `src/app/recipes/[slug]/DeleteButton.tsx`
**Type:** Client component (`"use client"`) — co-located with the detail page

Renders a red "Delete" button. On click it shows a `window.confirm` dialog,
then calls `DELETE /api/recipes/[id]` and redirects to `/recipes`.

**Props:**

| Prop | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | yes | Database ID of the recipe to delete |

**Used by:**
- `src/app/recipes/[slug]/page.tsx` — recipe detail header

---

## Page components (not reusable)

These are route-specific server components that compose the above.

| File | Route | What it does |
|---|---|---|
| `src/app/layout.tsx` | (all routes) | Root layout — sets `<html>`, loads Geist font, renders `<Navigation>` and `<main>` |
| `src/app/page.tsx` | `/` | Fetches recent recipes, categories, and count; renders hero, category links, RecipeCard grid |
| `src/app/recipes/page.tsx` | `/recipes` | Fetches filtered recipes and category list; renders search input, category select, cook time select, RecipeCard grid |
| `src/app/recipes/new/page.tsx` | `/recipes/new` | No data fetch; renders `<RecipeForm mode="create">` |
| `src/app/recipes/[slug]/page.tsx` | `/recipes/[slug]` | Fetches full recipe with relations; renders meta panel, ingredients, steps, tags, Edit link, DeleteButton |
| `src/app/recipes/[slug]/edit/page.tsx` | `/recipes/[slug]/edit` | Fetches recipe; passes data to `<RecipeForm mode="edit">` |
| `src/app/recipes/[slug]/not-found.tsx` | (404 fallback) | Rendered by Next.js when `notFound()` is called in the detail or edit page |
