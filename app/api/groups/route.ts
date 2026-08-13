import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

function generateInviteCode() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: {
      group: {
        include: { _count: { select: { members: true, items: true } } },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const groups = memberships.map((m) => ({
    id: m.group.id,
    name: m.group.name,
    inviteCode: m.group.inviteCode,
    role: m.role,
    memberCount: m.group._count.members,
    itemCount: m.group._count.items,
  }));

  return NextResponse.json({ groups });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Введите название группы" }, { status: 400 });
  }

  let group;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      group = await prisma.group.create({
        data: {
          name: name.trim().slice(0, 60),
          inviteCode: generateInviteCode(),
          members: { create: { userId: user.id, role: "admin" } },
        },
      });
      break;
    } catch (err: any) {
      if (err.code === "P2002") continue;
      throw err;
    }
  }

  if (!group) {
    return NextResponse.json(
      { error: "Не удалось создать группу, попробуйте ещё раз" },
      { status: 500 }
    );
  }

  return NextResponse.json({ group });
}
