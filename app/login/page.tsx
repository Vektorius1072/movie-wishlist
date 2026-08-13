"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const verified = params.get("verified") === "1";
  const tokenError = params.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Не удалось войти");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-5xl text-gold tracking-wide text-center">СИНЕКЛУБ</h1>
        <div className="film-perforation my-4" />

        {verified && <p className="text-sm text-center text-gold mb-4">Почта подтверждена — теперь можно войти.</p>}
        {tokenError === "expired_token" && (
          <p className="text-sm text-center text-velvet mb-4">
            Ссылка для подтверждения устарела. Зарегистрируйтесь ещё раз — мы вышлем новую.
          </p>
        )}
        {tokenError === "invalid_token" && <p className="text-sm text-center text-velvet mb-4">Ссылка недействительна.</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-surface border border-surface-raised rounded-lg px-4 py-3 text-paper placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full bg-surface border border-surface-raised rounded-lg px-4 py-3 text-paper placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button disabled={busy} className="w-full bg-gold text-bg font-semibold rounded-lg py-3 hover:bg-gold-dim transition disabled:opacity-50">
            Войти
          </button>
        </form>
        {error && <p className="text-velvet mt-3 text-sm text-center">{error}</p>}

        <p className="text-muted text-sm text-center mt-6">
          Нет аккаунта? <Link href="/register" className="text-gold hover:underline">Зарегистрироваться</Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
