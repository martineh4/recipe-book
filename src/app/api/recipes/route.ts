import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");

  const recipes = await prisma.recipe.findMany({
    where: {
      ...(category ? { category: { slug: category } } : {}),
      ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(recipes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, servings, prepTime, cookTime, imageUrl, categoryId, ingredients, steps, tags } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.recipe.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const recipe = await prisma.recipe.create({
    data: {
      title,
      slug,
      description: description || null,
      servings: servings ?? 4,
      prepTime: prepTime ?? 0,
      cookTime: cookTime ?? 0,
      imageUrl: imageUrl || null,
      categoryId: categoryId || null,
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

  return NextResponse.json(recipe, { status: 201 });
}
