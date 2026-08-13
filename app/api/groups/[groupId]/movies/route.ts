import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: user.id, groupId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Нет доступа к этой группе" }, { status: 403 });
  }

  const { tmdbId, mediaType, title, posterPath, overview, releaseYear, genres } =
    await req.json();
  if (!tmdbId || !title) {
    return NextResponse.json({ error: "Некорректные данные фильма" }, { status: 400 });
  }
  const safeMediaType = mediaType === "tv" ? "tv" : "movie";

  const movie = await prisma.movie.upsert({
    where: { tmdbId_mediaType: { tmdbId, mediaType: safeMediaType } },
    create: { tmdbId, mediaType: safeMediaType, title, posterPath, overview, releaseYear, genres },
    update: {},
  });

  try {
    const item = await prisma.wishlistItem.create({
      data: { groupId, movieId: movie.id, addedById: user.id },
      include: { movie: true, addedBy: true },
    });
    return NextResponse.json({ item });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Этот фильм уже есть в списке группы" }, { status: 409 });
    }
    throw err;
  }
}