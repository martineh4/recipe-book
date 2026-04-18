import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RecipeCard from "@/components/RecipeCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [recentRecipes, categories, recipeCount] = await Promise.all([
    prisma.recipe.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.category.findMany({
      include: { _count: { select: { recipes: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.recipe.count(),
  ]);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-10">
        <h1 className="text-4xl font-bold text-stone-800 mb-3">Your Recipe Book</h1>
        <p className="text-stone-500 text-lg mb-6">
          {recipeCount > 0
            ? `${recipeCount} recipe${recipeCount !== 1 ? "s" : ""} and counting`
            : "Start building your personal cookbook"}
        </p>
        <Link
          href="/recipes/new"
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          + Add Your First Recipe
        </Link>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/recipes?category=${cat.slug}`}
                className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm hover:border-amber-400 hover:text-amber-700 transition-colors"
              >
                {cat.name}{" "}
                <span className="text-stone-400">({cat._count.recipes})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent recipes */}
      {recentRecipes.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-stone-800">Recent Recipes</h2>
            <Link href="/recipes" className="text-sm text-amber-700 hover:text-amber-800 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentRecipes.map((r) => (
              <RecipeCard key={r.id} {...r} />
            ))}
          </div>
        </section>
      ) : (
        <section className="text-center py-16 border-2 border-dashed border-stone-200 rounded-xl">
          <p className="text-5xl mb-4">🍳</p>
          <p className="text-stone-500 mb-4">No recipes yet. Add your first one!</p>
          <Link
            href="/recipes/new"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm"
          >
            + Add Recipe
          </Link>
        </section>
      )}
    </div>
  );
}
