import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const withDetails = searchParams.get("details") === "true";

  if (withDetails) {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { recipe: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(favorites.map((f) => f.recipe));
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { recipeId: true },
  });
  return NextResponse.json(favorites.map((f) => f.recipeId));
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipeId } = await req.json();

  await prisma.favorite.upsert({
    where: { userId_recipeId: { userId: session.user.id, recipeId } },
    create: { userId: session.user.id, recipeId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipeId } = await req.json();

  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, recipeId },
  });

  return NextResponse.json({ ok: true });
}
