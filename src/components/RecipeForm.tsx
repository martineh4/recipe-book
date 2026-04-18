"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RecipeFormData } from "@/types";

type Category = { id: string; name: string };

type Props = {
  initialData?: Partial<RecipeFormData> & { id?: string };
  mode: "create" | "edit";
};

const emptyIngredient = { name: "", amount: "", unit: "" };
const emptyStep = { instruction: "" };

export default function RecipeForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<RecipeFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    servings: initialData?.servings ?? 4,
    prepTime: initialData?.prepTime ?? 0,
    cookTime: initialData?.cookTime ?? 0,
    imageUrl: initialData?.imageUrl ?? "",
    categoryId: initialData?.categoryId ?? "",
    ingredients: initialData?.ingredients?.length ? initialData.ingredients : [{ ...emptyIngredient }],
    steps: initialData?.steps?.length ? initialData.steps : [{ ...emptyStep }],
    tags: initialData?.tags ?? [],
  });

  const [tagInput, setTagInput] = useState(form.tags.join(", "));

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  function setField<K extends keyof RecipeFormData>(key: K, value: RecipeFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateIngredient(i: number, field: string, value: string) {
    const updated = [...form.ingredients];
    updated[i] = { ...updated[i], [field]: value };
    setField("ingredients", updated);
  }

  function updateStep(i: number, value: string) {
    const updated = [...form.steps];
    updated[i] = { instruction: value };
    setField("steps", updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      tags: tagInput.split(",").map((t) => t.trim()).filter(Boolean),
    };

    const url = mode === "edit" && initialData?.id ? `/api/recipes/${initialData.id}` : "/api/recipes";
    const method = mode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const recipe = await res.json();
    router.push(`/recipes/${recipe.slug}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">Basic Info</h2>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="e.g. Classic Spaghetti Carbonara"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            placeholder="A short description of the recipe..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
          <input
            value={form.imageUrl}
            onChange={(e) => setField("imageUrl", e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="https://..."
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Servings</label>
            <input
              type="number" min={1}
              value={form.servings}
              onChange={(e) => setField("servings", parseInt(e.target.value) || 1)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Prep (min)</label>
            <input
              type="number" min={0}
              value={form.prepTime}
              onChange={(e) => setField("prepTime", parseInt(e.target.value) || 0)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Cook (min)</label>
            <input
              type="number" min={0}
              value={form.cookTime}
              onChange={(e) => setField("cookTime", parseInt(e.target.value) || 0)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setField("categoryId", e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Tags (comma-separated)</label>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="italian, pasta, quick"
            />
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="space-y-3">
        <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">Ingredients</h2>
        {form.ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={ing.amount}
              onChange={(e) => updateIngredient(i, "amount", e.target.value)}
              className="w-24 border border-stone-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Amount"
            />
            <input
              value={ing.unit}
              onChange={(e) => updateIngredient(i, "unit", e.target.value)}
              className="w-24 border border-stone-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Unit"
            />
            <input
              value={ing.name}
              onChange={(e) => updateIngredient(i, "name", e.target.value)}
              className="flex-1 border border-stone-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Ingredient name"
            />
            {form.ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => setField("ingredients", form.ingredients.filter((_, j) => j !== i))}
                className="text-stone-400 hover:text-red-500 text-lg leading-none"
              >×</button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setField("ingredients", [...form.ingredients, { ...emptyIngredient }])}
          className="text-sm text-amber-700 hover:text-amber-800 font-medium"
        >+ Add ingredient</button>
      </section>

      {/* Steps */}
      <section className="space-y-3">
        <h2 className="font-semibold text-stone-700 text-sm uppercase tracking-wide">Instructions</h2>
        {form.steps.map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="mt-2 w-6 h-6 flex-shrink-0 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <textarea
              value={step.instruction}
              onChange={(e) => updateStep(i, e.target.value)}
              rows={2}
              className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              placeholder={`Step ${i + 1}...`}
            />
            {form.steps.length > 1 && (
              <button
                type="button"
                onClick={() => setField("steps", form.steps.filter((_, j) => j !== i))}
                className="mt-2 text-stone-400 hover:text-red-500 text-lg leading-none"
              >×</button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setField("steps", [...form.steps, { ...emptyStep }])}
          className="text-sm text-amber-700 hover:text-amber-800 font-medium"
        >+ Add step</button>
      </section>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
        >
          {loading ? "Saving..." : mode === "edit" ? "Update Recipe" : "Create Recipe"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
