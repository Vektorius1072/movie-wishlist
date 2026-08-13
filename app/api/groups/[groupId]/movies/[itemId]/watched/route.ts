import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  _req: Request,
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

  const item = await prisma.wishlistItem.findUnique({ where: { id: itemId } });
  if (!item || item.groupId !== groupId) {
    return NextResponse.json({ error: "Фильм не найден в этой группе" }, { status: 404 });
  }

  const updated = await prisma.wishlistItem.update({
    where: { id: itemId },
    data: { status: item.status === "watched" ? "wishlist" : "watched" },
  });

  return NextResponse.json({ item: updated });
}
