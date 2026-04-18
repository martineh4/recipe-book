import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      category: true,
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
    },
  });

  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const { title, description, servings, prepTime, cookTime, imageUrl, categoryId, ingredients, steps, tags } = body;

  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let slug = existing.slug;
  if (title && title !== existing.title) {
    const baseSlug = slugify(title);
    slug = baseSlug;
    let suffix = 1;
    while (await prisma.recipe.findFirst({ where: { slug, NOT: { id } } })) {
      slug = `${baseSlug}-${suffix++}`;
    }
  }

  await prisma.ingredient.deleteMany({ where: { recipeId: id } });
  await prisma.step.deleteMany({ where: { recipeId: id } });
  await prisma.recipeTag.deleteMany({ where: { recipeId: id } });

  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      slug,
      description: description ?? existing.description,
      servings: servings ?? existing.servings,
      prepTime: prepTime ?? existing.prepTime,
      cookTime: cookTime ?? existing.cookTime,
      imageUrl: imageUrl ?? existing.imageUrl,
      categoryId: categoryId ?? existing.categoryId,
      ingredients: {
        create: (ingredients ?? []).map(
          (ing: { name: string; amount: string; unit?: string }, i: number) => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit || null,
            order: i,
          })
        ),
      },
      steps: {
        create: (steps ?? []).map(
          (step: { instruction: string }, i: number) => ({
            instruction: step.instruction,
            order: i,
          })
        ),
      },
      tags: tags?.length
        ? {
            create: await Promise.all(
              tags.map(async (tagName: string) => {
                const tagSlug = slugify(tagName);
                const tag = await prisma.tag.upsert({
                  where: { slug: tagSlug },
                  update: {},
                  create: { name: tagName, slug: tagSlug },
                });
                return { tagId: tag.id };
              })
            ),
          }
        : undefined,
    },
    include: { category: true, ingredients: true, steps: true, tags: { include: { tag: true } } },
  });

  return NextResponse.json(recipe);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
