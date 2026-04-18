import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">🍽️</p>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Recipe not found</h2>
      <p className="text-stone-500 mb-6">This recipe may have been deleted or the link is wrong.</p>
      <Link href="/recipes" className="text-amber-700 hover:text-amber-800 font-medium">
        ← Back to recipes
      </Link>
    </div>
  );
}
