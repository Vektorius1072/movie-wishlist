import { cookies } from "next/headers";
import { prisma } from "./prisma";

// MVP-упрощение сессии: httpOnly-cookie с id пользователя.
// Начиная с Next.js 15, cookies() стал асинхронным API — поэтому все
// функции здесь тоже async и требуют await на вызывающей стороне.
const COOKIE_NAME = "uid";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const uid = cookieStore.get(COOKIE_NAME)?.value;
  if (!uid) return null;

  const user = await prisma.user.findUnique({ where: { id: uid } });
  return user;
}

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
