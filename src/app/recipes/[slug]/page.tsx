import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatTime, totalTime } from "@/lib/utils";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export default async function RecipePage({ params }: { params: Params }) {
  const { slug } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      category: true,
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
    },
  });

  if (!recipe) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            {recipe.category && (
              <Link
                href={`/recipes?category=${recipe.category.slug}`}
                className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors"
              >
                {recipe.category.name}
              </Link>
            )}
            <h1 className="mt-2 text-3xl font-bold text-stone-800">{recipe.title}</h1>
            {recipe.description && (
              <p className="mt-2 text-stone-500">{recipe.description}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href={`/recipes/${recipe.slug}/edit`}
              className="px-3 py-1.5 border border-stone-300 hover:bg-stone-50 text-stone-700 text-sm font-medium rounded-lg transition-colors"
            >
              Edit
            </Link>
            <DeleteButton id={recipe.id} />
          </div>
        </div>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-500 bg-stone-100 rounded-xl p-4">
          <div className="text-center">
            <div className="font-semibold text-stone-700 text-base">{formatTime(recipe.prepTime)}</div>
            <div className="text-xs">Prep</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-stone-700 text-base">{formatTime(recipe.cookTime)}</div>
            <div className="text-xs">Cook</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-stone-700 text-base">{formatTime(totalTime(recipe.prepTime, recipe.cookTime))}</div>
            <div className="text-xs">Total</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-stone-700 text-base">{recipe.servings}</div>
            <div className="text-xs">Servings</div>
          </div>
        </div>
      </div>

      {/* Image */}
      {recipe.imageUrl && (
        <div className="rounded-xl overflow-hidden h-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex gap-3 items-baseline text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                <span>
                  <span className="font-medium text-stone-700">
                    {ing.amount}{ing.unit ? ` ${ing.unit}` : ""}
                  </span>{" "}
                  <span className="text-stone-600">{ing.name}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Steps */}
      {recipe.steps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">Instructions</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={step.id} className="flex gap-4">
                <span className="w-7 h-7 flex-shrink-0 bg-amber-100 text-amber-700 rounded-full text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-stone-700 leading-relaxed pt-0.5">{step.instruction}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <section className="flex flex-wrap gap-2 pt-4 border-t border-stone-100">
          {recipe.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/recipes?tag=${tag.slug}`}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs rounded-full transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
