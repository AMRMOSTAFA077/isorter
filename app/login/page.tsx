'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    window.location.href = '/';
  }

  return (
    <main className="max-w-md mx-auto pt-24">
      <h1 className="text-2xl font-semibold mb-6">Login to iSorter</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="w-full">Sign in</button>
      </form>
    </main>
  );
}
