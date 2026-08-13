"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }

    setBusy(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Не удалось зарегистрироваться");
      return;
    }
    setSent(data.message);
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-4xl text-gold tracking-wide mb-4">Почти готово</h1>
          <p className="text-paper mb-2">{sent}</p>
          <p className="text-muted text-sm">Если письмо не пришло за пару минут — проверьте папку «Спам».</p>
          <Link href="/login" className="text-gold hover:underline block mt-6">Перейти ко входу</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-5xl text-gold tracking-wide text-center">СИНЕКЛУБ</h1>
        <div className="film-perforation my-4" />
        <p className="text-muted text-center mb-8">Создайте аккаунт</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как вас зовут?"
            className="w-full bg-surface border border-surface-raised rounded-lg px-4 py-3 text-paper placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <input
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
            placeholder="Пароль (минимум 8 символов)"
            className="w-full bg-surface border border-surface-raised rounded-lg px-4 py-3 text-paper placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Повторите пароль"
            className="w-full bg-surface border border-surface-raised rounded-lg px-4 py-3 text-paper placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button disabled={busy} className="w-full bg-gold text-bg font-semibold rounded-lg py-3 hover:bg-gold-dim transition disabled:opacity-50">
            Зарегистрироваться
          </button>
        </form>
        {error && <p className="text-velvet mt-3 text-sm text-center">{error}</p>}

        <p className="text-muted text-sm text-center mt-6">
          Уже есть аккаунт? <Link href="/login" className="text-gold hover:underline">Войти</Link>
        </p>
      </div>
    </main>
  );
}
