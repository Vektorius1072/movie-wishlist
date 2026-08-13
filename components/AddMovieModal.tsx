"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SearchResult {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  overview: string;
  releaseYear: number | null;
  genres: string;
}

export default function AddMovieModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (movie: SearchResult) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? "Ошибка поиска");
        setResults([]);
        return;
      }
      setError(null);
      setResults(data.results);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleAdd(movie: SearchResult) {
    setAddingId(movie.tmdbId);
    await onAdd(movie);
    setAddingId(null);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center p-4 pt-16 z-50" onClick={onClose}>
      <div className="bg-surface rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-surface-raised">
          <h2 className="font-display text-2xl tracking-wide mb-2">Добавить фильм</h2>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Название фильма…"
            className="w-full bg-bg border border-surface-raised rounded-lg px-3 py-2 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="overflow-y-auto p-3 space-y-2">
          {loading && <p className="text-muted text-sm px-2">Ищем…</p>}
          {error && <p className="text-velvet text-sm px-2">{error}</p>}
          {!loading && query && results.length === 0 && !error && (
            <p className="text-muted text-sm px-2">Ничего не нашлось</p>
          )}

          {results.map((r) => (
            <button
              key={r.tmdbId}
              onClick={() => handleAdd(r)}
              disabled={addingId === r.tmdbId}
              className="w-full flex gap-3 items-center text-left bg-bg hover:bg-surface-raised rounded-lg p-2 transition disabled:opacity-50"
            >
              <div className="w-10 h-14 shrink-0 bg-surface-raised rounded overflow-hidden relative">
                {r.posterPath && (
                  <Image src={r.posterPath} alt={r.title} fill sizes="40px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {r.title} {r.releaseYear && <span className="text-muted">({r.releaseYear})</span>}
                </p>
                <p className="text-muted text-xs truncate">
                  <span className="uppercase tracking-wide">{r.mediaType === "tv" ? "Сериал" : "Фильм"}</span>
                  {r.genres && ` · ${r.genres}`}
                </p>
              </div>
              <span className="ml-auto text-gold text-xs shrink-0">
                {addingId === r.tmdbId ? "Добавляем…" : "+ Добавить"}
              </span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-surface-raised text-right">
          <button onClick={onClose} className="text-muted text-sm hover:text-paper">Закрыть</button>
        </div>
      </div>
    </div>
  );
}
