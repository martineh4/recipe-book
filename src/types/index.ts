export type RecipeWithRelations = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  servings: number;
  prepTime: number;
  cookTime: number;
  imageUrl: string | null;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string } | null;
  ingredients: Ingredient[];
  steps: Step[];
  tags: { tag: { id: string; name: string; slug: string } }[];
};

export type Ingredient = {
  id: string;
  recipeId: string;
  name: string;
  amount: string;
  unit: string | null;
  order: number;
};

export type Step = {
  id: string;
  recipeId: string;
  instruction: string;
  order: number;
};

export type RecipeFormData = {
  title: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  imageUrl: string;
  categoryId: string;
  ingredients: { name: string; amount: string; unit: string }[];
  steps: { instruction: string }[];
  tags: string[];
};
