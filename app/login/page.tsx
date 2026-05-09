'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { browserClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const supabase = browserClient();
    const fn = mode === 'signin' ? supabase.auth.signInWithPassword
                                 : supabase.auth.signUp;
    const { error } = await fn({ email, password });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    if (mode === 'signup') {
      setMsg('Check your inbox to confirm your email, then sign in.');
      setMode('signin');
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 rounded-xl border border-line bg-panel p-6">
      <h1 className="font-display text-2xl mb-1">
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </h1>
      <p className="text-muted text-sm mb-5">
        Follow teams, save preferences, get notified.
      </p>
      <form onSubmit={submit} className="grid gap-3">
        <input
          type="email" required placeholder="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="bg-bg border border-line rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
        />
        <input
          type="password" required placeholder="password (min 6)" minLength={6}
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="bg-bg border border-line rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
        />
        <button
          disabled={busy}
          className="bg-accent text-bg font-semibold rounded-lg py-2 disabled:opacity-60"
        >
          {busy ? '…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
        </button>
        {msg && <p className="text-sm text-live">{msg}</p>}
      </form>
      <button
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        className="mt-4 text-sm text-muted hover:text-ink"
      >
        {mode === 'signin' ? 'No account? Create one' : 'Have an account? Sign in'}
      </button>
    </div>
  );
}
