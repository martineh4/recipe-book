import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RecipeCard from "@/components/RecipeCard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ category?: string; tag?: string; q?: string }>;

export default async function RecipesPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, tag, q } = await searchParams;

  const recipes = await prisma.recipe.findMany({
    where: {
      ...(category ? { category: { slug: category } } : {}),
      ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const activeFilter = category || tag || q;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            {q ? `Search: "${q}"` : category ? `Category: ${category}` : tag ? `Tag: ${tag}` : "All Recipes"}
          </h1>
          <p className="text-stone-500 text-sm mt-1">{recipes.length} recipe{recipes.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/recipes/new"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Recipe
        </Link>
      </div>

      {/* Search bar */}
      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search recipes..."
          className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Search
        </button>
        {activeFilter && (
          <Link
            href="/recipes"
            className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-sm font-medium rounded-lg transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map((r) => (
            <RecipeCard key={r.id} {...r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-xl">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-stone-500">No recipes found.</p>
        </div>
      )}
    </div>
  );
}
