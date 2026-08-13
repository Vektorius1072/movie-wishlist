import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = process.env.APP_URL || req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_token`);
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || record.expiresAt < new Date()) {
    if (record) await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.redirect(`${appUrl}/login?error=expired_token`);
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });
  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(`${appUrl}/login?verified=1`);
}
