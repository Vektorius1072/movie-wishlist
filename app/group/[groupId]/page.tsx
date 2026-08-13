"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MovieCard, { WishlistItemDTO } from "@/components/MovieCard";
import AddMovieModal from "@/components/AddMovieModal";

interface GroupDetail {
  id: string;
  name: string;
  inviteCode: string;
  members: { id: string; name: string; role: string }[];
}

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [items, setItems] = useState<WishlistItemDTO[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    load();
  }, [groupId]);

  async function load() {
    const res = await fetch(`/api/groups/${groupId}`);
    const data = await res.json();
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (!res.ok) {
      setError(data.error ?? "Не удалось загрузить группу");
      return;
    }
    setGroup(data.group);
    setItems(data.items);
  }

  async function handleAddMovie(movie: {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath: string | null;
    overview: string;
    releaseYear: number | null;
    genres: string;
  }) {
    const res = await fetch(`/api/groups/${groupId}/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movie),
    });
    if (res.ok) {
      setShowAddModal(false);
      await load();
    } else {
      const data = await res.json();
      alert(data.error ?? "Не удалось добавить фильм");
    }
  }

  async function handleVote(itemId: string, score: number) {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, myVote: score } : it)));
    await fetch(`/api/groups/${groupId}/movies/${itemId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
    });
    await load();
  }

  async function handleToggleWatched(itemId: string) {
    await fetch(`/api/groups/${groupId}/movies/${itemId}/watched`, { method: "POST" });
    await load();
  }

  function copyInvite() {
    if (!group) return;
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-velvet">{error}</p>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Загрузка…</p>
      </main>
    );
  }

  const wishlist = items.filter((i) => i.status === "wishlist");
  const watched = items.filter((i) => i.status === "watched");

  return (
    <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <Link href="/" className="text-muted text-sm hover:text-gold">← Все группы</Link>

      <header className="flex items-baseline justify-between mt-3 mb-2">
        <h1 className="font-display text-4xl tracking-wide text-gold">{group.name}</h1>
        <button
          onClick={copyInvite}
          className="ticket-notch bg-surface px-4 py-1.5 rounded text-xs uppercase tracking-widest text-muted hover:text-gold transition"
          title="Скопировать код приглашения"
        >
          {copied ? "Скопировано!" : `Код: ${group.inviteCode}`}
        </button>
      </header>
      <div className="film-perforation mb-6" />

      <p className="text-muted text-sm mb-6">Участники: {group.members.map((m) => m.name).join(", ")}</p>

      <button onClick={() => setShowAddModal(true)} className="w-full bg-gold text-bg font-semibold rounded-lg py-3 mb-8 hover:bg-gold-dim transition">
        + Добавить фильм
      </button>

      <section className="mb-10">
        <h2 className="font-display text-2xl tracking-wide mb-3">Хотим посмотреть</h2>
        {wishlist.length === 0 ? (
          <p className="text-muted text-sm">Список пуст — самое время добавить первый фильм.</p>
        ) : (
          <div className="space-y-3">
            {wishlist.map((item) => (
              <MovieCard key={item.id} item={item} onVote={handleVote} onToggleWatched={handleToggleWatched} />
            ))}
          </div>
        )}
      </section>

      {watched.length > 0 && (
        <section>
          <h2 className="font-display text-2xl tracking-wide mb-3 text-muted">Уже посмотрели</h2>
          <div className="space-y-3">
            {watched.map((item) => (
              <MovieCard key={item.id} item={item} onVote={handleVote} onToggleWatched={handleToggleWatched} />
            ))}
          </div>
        </section>
      )}

      {showAddModal && <AddMovieModal onClose={() => setShowAddModal(false)} onAdd={handleAddMovie} />}
    </main>
  );
}
