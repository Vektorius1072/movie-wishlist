const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";

const GENRE_MAP: Record<number, string> = {
  28: "Боевик", 12: "Приключения", 16: "Мультфильм", 35: "Комедия",
  80: "Криминал", 99: "Документальный", 18: "Драма", 10751: "Семейный",
  14: "Фэнтези", 36: "История", 27: "Ужасы", 10402: "Музыка",
  9648: "Детектив", 10749: "Мелодрама", 878: "Фантастика", 10770: "Телефильм",
  53: "Триллер", 10752: "Военный", 37: "Вестерн",
};

export type TmdbMediaType = "movie" | "tv";

export interface TmdbMovieResult {
  tmdbId: number;
  mediaType: TmdbMediaType;
  title: string;
  posterPath: string | null;
  overview: string;
  releaseYear: number | null;
  genres: string;
}

interface TmdbApiMultiResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

export async function searchMovies(query: string): Promise<TmdbMovieResult[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY не задан в .env — получите ключ на themoviedb.org");
  }

  const url = new URL(`${TMDB_BASE_URL}/search/multi`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", query);
  url.searchParams.set("language", "ru-RU");
  url.searchParams.set("include_adult", "false");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB search failed: ${res.status}`);
  }

  const data = (await res.json()) as { results: TmdbApiMultiResult[] };

  return data.results
    .filter((m): m is TmdbApiMultiResult & { media_type: "movie" | "tv" } =>
      m.media_type === "movie" || m.media_type === "tv"
    )
    .slice(0, 12)
    .map((m) => {
      const title = m.media_type === "movie" ? m.title ?? "" : m.name ?? "";
      const date = m.media_type === "movie" ? m.release_date : m.first_air_date;
      return {
        tmdbId: m.id,
        mediaType: m.media_type,
        title,
        posterPath: m.poster_path ? `${TMDB_IMAGE_BASE_URL}${m.poster_path}` : null,
        overview: m.overview ?? "",
        releaseYear: date ? Number(date.slice(0, 4)) : null,
        genres: (m.genre_ids ?? []).map((id) => GENRE_MAP[id]).filter(Boolean).join(", "),
      };
    });
}
