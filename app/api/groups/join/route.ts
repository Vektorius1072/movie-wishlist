import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit(req, "inviteGuess");
  if (!allowed) {
    return NextResponse.json(
      { error: "Слишком много попыток. Подождите минуту и попробуйте снова." },
      { status: 429 }
    );
  }

  const { inviteCode } = await req.json();
  if (!inviteCode || typeof inviteCode !== "string") {
    return NextResponse.json({ error: "Введите код приглашения" }, { status: 400 });
  }

  const group = await prisma.group.findUnique({
    where: { inviteCode: inviteCode.trim().toUpperCase() },
  });

  if (!group) {
    return NextResponse.json({ error: "Группа с таким кодом не найдена" }, { status: 404 });
  }

  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: user.id, groupId: group.id } },
    create: { userId: user.id, groupId: group.id, role: "member" },
    update: {},
  });

  return NextResponse.json({ group });
}
