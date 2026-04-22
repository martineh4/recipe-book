"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type FavoritesContextValue = {
  favorites: string[];
  loading: boolean;
  toggle: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  loading: true,
  toggle: async () => {},
  isFavorite: () => false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: sessionPending } = useSession();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (sessionPending) return;
    if (!session?.user) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : []))
      .then((ids: string[]) => {
        setFavorites(ids);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session?.user?.id, sessionPending]);

  const toggle = useCallback(
    async (recipeId: string) => {
      if (!session?.user) {
        router.push("/login");
        return;
      }
      const isFav = favorites.includes(recipeId);
      setFavorites((prev) =>
        isFav ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
      );
      await fetch("/api/favorites", {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
    },
    [favorites, session?.user, router]
  );

  const isFavorite = useCallback(
    (recipeId: string) => favorites.includes(recipeId),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, loading, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  return useContext(FavoritesContext);
}
