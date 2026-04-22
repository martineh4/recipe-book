"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";
import { useFavorites } from "@/hooks/useFavorites";

type Recipe = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  prepTime: number;
  cookTime: number;
  servings: number;
  imageUrl: string | null;
  category: { name: string } | null;
};

export default function FavoritesPage() {
  const { loading: favLoading, isFavorite } = useFavorites();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites?details=true")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Recipe[]) => {
        setRecipes(data);
        setRecipesLoading(false);
      })
      .catch(() => setRecipesLoading(false));
  }, []);

  // While favorites context loads, show all fetched recipes to avoid a flash.
  // Once loaded, filter to reflect any optimistic toggles.
  const visibleRecipes = favLoading ? recipes : recipes.filter((r) => isFavorite(r.id));
  const isLoading = recipesLoading || favLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Favorites</h1>
        <p className="mt-1 text-stone-500">Recipes you&apos;ve saved</p>
      </div>

      {isLoading ? (
        <div className="text-stone-400 text-sm">Loading…</div>
      ) : visibleRecipes.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-5xl">♡</p>
          <p className="text-stone-500">No favorites yet.</p>
          <Link href="/recipes" className="text-amber-700 hover:underline text-sm">
            Browse recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
