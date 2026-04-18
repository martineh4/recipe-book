import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { recipes: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const slug = slugify(name);
  const category = await prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
  return NextResponse.json(category, { status: 201 });
}
