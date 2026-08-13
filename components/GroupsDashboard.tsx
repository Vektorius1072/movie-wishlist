"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GroupSummary {
  id: string;
  name: string;
  inviteCode: string;
  role: string;
  memberCount: number;
  itemCount: number;
}

export default function GroupsDashboard({ userName }: { userName: string }) {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    refreshGroups();
  }, []);

  async function refreshGroups() {
    const res = await fetch("/api/groups");
    if (res.ok) {
      const data = await res.json();
      setGroups(data.groups);
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!groupNameInput.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: groupNameInput }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Не удалось создать группу");
      return;
    }
    setGroupNameInput("");
    await refreshGroups();
  }

  async function handleJoinGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: inviteCodeInput }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Не удалось присоединиться");
      return;
    }
    setInviteCodeInput("");
    await refreshGroups();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      <header className="flex items-baseline justify-between mb-2">
        <h1 className="font-display text-4xl text-gold tracking-wide">СИНЕКЛУБ</h1>
        <div className="flex items-center gap-3">
          <span className="text-muted text-sm">Привет, {userName}</span>
          <button onClick={handleLogout} className="text-muted text-xs hover:text-velvet">Выйти</button>
        </div>
      </header>
      <div className="film-perforation mb-8" />

      <section className="grid gap-3 mb-10">
        {groups.length === 0 && (
          <p className="text-muted">Пока нет ни одной группы — создайте свою или введите код приглашения ниже.</p>
        )}
        {groups.map((g) => (
          <Link key={g.id} href={`/group/${g.id}`} className="block bg-surface hover:bg-surface-raised transition rounded-xl px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl tracking-wide">{g.name}</span>
              <span className="text-xs text-muted uppercase tracking-widest">код {g.inviteCode}</span>
            </div>
            <span className="text-muted text-sm">{g.memberCount} участник(ов) · {g.itemCount} фильм(ов) в списке</span>
          </Link>
        ))}
      </section>

      {error && <p className="text-velvet mb-4 text-sm">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-6">
        <form onSubmit={handleCreateGroup} className="bg-surface rounded-xl p-5">
          <h2 className="font-display text-xl tracking-wide mb-3">Новая группа</h2>
          <input
            value={groupNameInput}
            onChange={(e) => setGroupNameInput(e.target.value)}
            placeholder="Например, «Семья»"
            className="w-full bg-bg border border-surface-raised rounded-lg px-3 py-2 mb-3 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button disabled={busy} className="w-full bg-gold text-bg font-semibold rounded-lg py-2 hover:bg-gold-dim transition disabled:opacity-50">
            Создать
          </button>
        </form>

        <form onSubmit={handleJoinGroup} className="bg-surface rounded-xl p-5">
          <h2 className="font-display text-xl tracking-wide mb-3">Есть код приглашения?</h2>
          <input
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
            placeholder="Например, K3F9QZ"
            className="w-full bg-bg border border-surface-raised rounded-lg px-3 py-2 mb-3 uppercase tracking-widest placeholder:text-muted placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button disabled={busy} className="w-full border border-gold text-gold font-semibold rounded-lg py-2 hover:bg-gold hover:text-bg transition disabled:opacity-50">
            Присоединиться
          </button>
        </form>
      </div>
    </main>
  );
}
