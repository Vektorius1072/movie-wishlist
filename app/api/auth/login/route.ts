import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { checkRateLimit } from "@/lib/ratelimit";

const GENERIC_ERROR = "Неверный email или пароль";

export async function POST(req: NextRequest) {
  const { allowed } = await checkRateLimit(req, "auth");
  if (!allowed) {
    return NextResponse.json(
      { error: "Слишком много попыток. Подождите минуту и попробуйте снова." },
      { status: 429 }
    );
  }

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });

  if (!user) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      { error: "Подтвердите почту — мы отправили вам ссылку при регистрации" },
      { status: 403 }
    );
  }

  await setSessionCookie(user.id);

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
}
