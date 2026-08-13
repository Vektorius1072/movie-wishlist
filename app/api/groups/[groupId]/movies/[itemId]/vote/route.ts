import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string; itemId: string }> }
) {
  const { groupId, itemId } = await params;

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

  const { score } = await req.json();
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return NextResponse.json({ error: "Оценка должна быть от 1 до 5" }, { status: 400 });
  }

  const item = await prisma.wishlistItem.findUnique({ where: { id: itemId } });
  if (!item || item.groupId !== groupId) {
    return NextResponse.json({ error: "Фильм не найден в этой группе" }, { status: 404 });
  }

  const vote = await prisma.vote.upsert({
    where: { wishlistItemId_userId: { wishlistItemId: itemId, userId: user.id } },
    create: { wishlistItemId: itemId, userId: user.id, score },
    update: { score },
  });

  return NextResponse.json({ vote });
}
