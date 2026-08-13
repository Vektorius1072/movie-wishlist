import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _req: Request,
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

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { include: { user: true } },
      items: {
        include: { movie: true, addedBy: true, votes: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Группа не найдена" }, { status: 404 });
  }

  const items = group.items.map((item) => {
    const votes = item.votes;
    const averageScore =
      votes.length > 0 ? votes.reduce((sum, v) => sum + v.score, 0) / votes.length : null;
    const myVote = votes.find((v) => v.userId === user.id)?.score ?? null;

    return {
      id: item.id,
      status: item.status,
      createdAt: item.createdAt,
      movie: item.movie,
      addedBy: { id: item.addedBy.id, name: item.addedBy.name },
      averageScore,
      voteCount: votes.length,
      myVote,
    };
  });

  return NextResponse.json({
    group: {
      id: group.id,
      name: group.name,
      inviteCode: group.inviteCode,
      members: group.members.map((m) => ({ id: m.user.id, name: m.user.name, role: m.role })),
    },
    items,
    currentUserId: user.id,
  });
}