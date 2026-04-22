"use client";

import Link from "next/link";
import { formatTime, totalTime } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

type Props = {
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

export default function RecipeCard({ id, title, slug, description, prepTime, cookTime, servings, imageUrl, category }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const saved = isFavorite(id);

  return (
    <div className="relative group">
      <Link
        href={`/recipes/${slug}`}
        className="block bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="h-44 bg-stone-100 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <span className="text-5xl">🍽️</span>
          )}
        </div>
        <div className="p-4">
          {category && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {category.name}
            </span>
          )}
          <h3 className="mt-2 font-semibold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-stone-500 line-clamp-2">{description}</p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-stone-400">
            <span>⏱ {formatTime(totalTime(prepTime, cookTime))}</span>
            <span>·</span>
            <span>🍴 {servings} servings</span>
          </div>
        </div>
      </Link>

      {/* Favorite button — sits above the link so clicks don't navigate */}
      <button
        onClick={() => toggle(id)}
        aria-label={saved ? "Remove from favorites" : "Save to favorites"}
        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-base shadow-sm border transition-all ${
          saved
            ? "bg-red-50 border-red-200 text-red-500"
            : "bg-white/90 border-stone-200 text-stone-400 opacity-0 group-hover:opacity-100"
        }`}
      >
        {saved ? "♥" : "♡"}
      </button>
    </div>
  );
}
