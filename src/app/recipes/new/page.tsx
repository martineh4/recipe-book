import RecipeForm from "@/components/RecipeForm";

export default function NewRecipePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-8">Add New Recipe</h1>
      <RecipeForm mode="create" />
    </div>
  );
}
