"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    router.push("/recipes");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors"
    >
      Delete
    </button>
  );
}
