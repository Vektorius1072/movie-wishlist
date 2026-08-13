"use client";

import Image from "next/image";

export interface WishlistItemDTO {
  id: string;
  status: "wishlist" | "watched";
  movie: {
    mediaType: "movie" | "tv";
    title: string;
    posterPath: string | null;
    overview: string | null;
    releaseYear: number | null;
    genres: string | null;
  };
  addedBy: { id: string; name: string };
  averageScore: number | null;
  voteCount: number;
  myVote: number | null;
}

export default function MovieCard({
  item,
  onVote,
  onToggleWatched,
}: {
  item: WishlistItemDTO;
  onVote: (itemId: string, score: number) => void;
  onToggleWatched: (itemId: string) => void;
}) {
  const watched = item.status === "watched";

  return (
    <div className={`flex gap-4 bg-surface rounded-xl p-4 transition ${watched ? "opacity-60" : ""}`}>
      <div className="w-20 h-28 shrink-0 bg-surface-raised rounded-md overflow-hidden relative">
        {item.movie.posterPath ? (
          <Image src={item.movie.posterPath} alt={item.movie.title} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs text-center px-1">
            нет постера
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-2xl tracking-wide leading-tight">
            {item.movie.title}
            {item.movie.releaseYear && (
              <span className="text-muted text-base ml-2 font-body">{item.movie.releaseYear}</span>
            )}
          </h3>
          <button
            onClick={() => onToggleWatched(item.id)}
            title={watched ? "Вернуть в список" : "Отметить как просмотренный"}
            className={`shrink-0 text-xs px-2 py-1 rounded-full border transition ${
              watched ? "border-gold text-gold" : "border-muted text-muted hover:border-gold hover:text-gold"
            }`}
          >
            {watched ? "✓ Посмотрели" : "Посмотреть позже"}
          </button>
        </div>

        <p className="text-muted text-xs mt-1 uppercase tracking-wide">
          {item.movie.mediaType === "tv" ? "Сериал" : "Фильм"}
          {item.movie.genres && ` · ${item.movie.genres}`}
        </p>
        {item.movie.overview && (
          <p className="text-muted text-sm mt-2 line-clamp-2">{item.movie.overview}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted">Добавил(а) {item.addedBy.name}</span>
          <div className="flex items-center gap-2">
            {item.averageScore !== null && (
              <span className="text-xs text-gold">★ {item.averageScore.toFixed(1)} ({item.voteCount})</span>
            )}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => onVote(item.id, score)}
                  aria-label={`Оценка ${score}`}
                  className={`w-5 h-5 rounded-full text-[10px] leading-5 border transition ${
                    item.myVote && score <= item.myVote
                      ? "bg-gold border-gold text-bg"
                      : "border-muted text-muted hover:border-gold hover:text-gold"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
