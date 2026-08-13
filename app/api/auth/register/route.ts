import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sendVerificationEmail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/ratelimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

async function issueVerificationToken(userId: string) {
  await prisma.verificationToken.deleteMany({ where: { userId } });
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { token, userId, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });
  return token;
}

export async function POST(req: NextRequest) {
  const { allowed } = await checkRateLimit(req, "auth");
  if (!allowed) {
    return NextResponse.json(
      { error: "Слишком много попыток. Подождите минуту и попробуйте снова." },
      { status: 429 }
    );
  }

  const { name, email, password } = await req.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Введите имя" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Введите корректный email" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Пароль должен быть не короче 8 символов" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existing) {
    if (existing.emailVerifiedAt) {
      return NextResponse.json(
        { error: "Этот email уже зарегистрирован. Попробуйте войти." },
        { status: 409 }
      );
    }
    const token = await issueVerificationToken(existing.id);
    await sendVerificationEmail(existing.email, token);
    return NextResponse.json({
      message: "На вашу почту повторно отправлена ссылка для подтверждения",
    });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name: name.trim().slice(0, 40), email: normalizedEmail, passwordHash },
  });

  const token = await issueVerificationToken(user.id);
  await sendVerificationEmail(user.email, token);

  return NextResponse.json({
    message: "Проверьте почту — мы отправили ссылку для подтверждения аккаунта",
  });
}
