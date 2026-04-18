import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RecipeForm from "@/components/RecipeForm";

type Params = Promise<{ slug: string }>;

export default async function EditRecipePage({ params }: { params: Params }) {
  const { slug } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
    },
  });

  if (!recipe) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-8">Edit Recipe</h1>
      <RecipeForm
        mode="edit"
        initialData={{
          id: recipe.id,
          title: recipe.title,
          description: recipe.description ?? "",
          servings: recipe.servings,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          imageUrl: recipe.imageUrl ?? "",
          categoryId: recipe.categoryId ?? "",
          ingredients: recipe.ingredients.map((i) => ({
            name: i.name,
            amount: i.amount,
            unit: i.unit ?? "",
          })),
          steps: recipe.steps.map((s) => ({ instruction: s.instruction })),
          tags: recipe.tags.map((t) => t.tag.name),
        }}
      />
    </div>
  );
}
