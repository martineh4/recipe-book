import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const breakfast = await prisma.category.upsert({
    where: { slug: "breakfast" },
    update: {},
    create: { name: "Breakfast", slug: "breakfast" },
  });
  const dinner = await prisma.category.upsert({
    where: { slug: "dinner" },
    update: {},
    create: { name: "Dinner", slug: "dinner" },
  });

  await prisma.recipe.upsert({
    where: { slug: "classic-pancakes" },
    update: {},
    create: {
      title: "Classic Pancakes",
      slug: "classic-pancakes",
      description: "Fluffy, golden pancakes perfect for weekend mornings.",
      servings: 4,
      prepTime: 10,
      cookTime: 20,
      categoryId: breakfast.id,
      ingredients: {
        create: [
          { name: "all-purpose flour", amount: "2", unit: "cups", order: 0 },
          { name: "baking powder", amount: "2", unit: "tsp", order: 1 },
          { name: "sugar", amount: "2", unit: "tbsp", order: 2 },
          { name: "salt", amount: "1/2", unit: "tsp", order: 3 },
          { name: "milk", amount: "1 1/2", unit: "cups", order: 4 },
          { name: "egg", amount: "1", unit: "", order: 5 },
          { name: "butter, melted", amount: "3", unit: "tbsp", order: 6 },
        ],
      },
      steps: {
        create: [
          { instruction: "Mix flour, baking powder, sugar, and salt in a large bowl.", order: 0 },
          { instruction: "Whisk together milk, egg, and melted butter in a separate bowl.", order: 1 },
          { instruction: "Pour wet ingredients into dry and stir until just combined — lumps are fine.", order: 2 },
          { instruction: "Heat a non-stick pan over medium heat. Pour 1/4 cup batter per pancake.", order: 3 },
          { instruction: "Cook until bubbles form on surface, then flip and cook 1 more minute.", order: 4 },
        ],
      },
      tags: {
        create: [
          { tag: { connectOrCreate: { where: { slug: "breakfast" }, create: { name: "breakfast", slug: "breakfast" } } } },
          { tag: { connectOrCreate: { where: { slug: "quick" }, create: { name: "quick", slug: "quick" } } } },
        ],
      },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "spaghetti-carbonara" },
    update: {},
    create: {
      title: "Spaghetti Carbonara",
      slug: "spaghetti-carbonara",
      description: "A rich, creamy Roman pasta made without cream — just eggs, cheese, and guanciale.",
      servings: 2,
      prepTime: 10,
      cookTime: 20,
      categoryId: dinner.id,
      ingredients: {
        create: [
          { name: "spaghetti", amount: "200", unit: "g", order: 0 },
          { name: "guanciale or pancetta", amount: "100", unit: "g", order: 1 },
          { name: "egg yolks", amount: "3", unit: "", order: 2 },
          { name: "Pecorino Romano, grated", amount: "50", unit: "g", order: 3 },
          { name: "black pepper, freshly cracked", amount: "1", unit: "tsp", order: 4 },
        ],
      },
      steps: {
        create: [
          { instruction: "Cook spaghetti in well-salted boiling water until al dente. Reserve 1 cup pasta water.", order: 0 },
          { instruction: "Meanwhile, cook guanciale in a large pan over medium heat until crispy.", order: 1 },
          { instruction: "Whisk egg yolks with Pecorino and black pepper in a bowl.", order: 2 },
          { instruction: "Add drained pasta to the pan with guanciale (off heat). Pour egg mixture over, tossing quickly.", order: 3 },
          { instruction: "Add pasta water a splash at a time, tossing until silky. Serve immediately.", order: 4 },
        ],
      },
      tags: {
        create: [
          { tag: { connectOrCreate: { where: { slug: "italian" }, create: { name: "italian", slug: "italian" } } } },
          { tag: { connectOrCreate: { where: { slug: "pasta" }, create: { name: "pasta", slug: "pasta" } } } },
        ],
      },
    },
  });

  console.log("✅ Seed complete");
}

main().catch(console.error).finally(() => prisma.$disconnect());
