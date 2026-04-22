"use client";

import { useFavorites } from "@/hooks/useFavorites";

type Props = {
  id: string;
  className?: string;
};

export default function FavoriteButton({ id, className = "" }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const saved = isFavorite(id);

  return (
    <button
      onClick={() => toggle(id)}
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      title={saved ? "Remove from favorites" : "Save to favorites"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
        saved
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          : "bg-white border-stone-300 text-stone-600 hover:bg-stone-50"
      } ${className}`}
    >
      <span aria-hidden>{saved ? "♥" : "♡"}</span>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
