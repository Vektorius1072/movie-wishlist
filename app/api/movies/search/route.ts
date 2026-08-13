import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { searchMovies } from "@/lib/tmdb";
import { checkRateLimit } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit(req, "search");
  if (!allowed) {
    return NextResponse.json(
      { error: "Слишком много запросов. Подождите немного." },
      { status: 429 }
    );
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchMovies(q);
    return NextResponse.json({ results });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Не удалось выполнить поиск. Проверьте TMDB_API_KEY в .env" },
      { status: 500 }
    );
  }
}
