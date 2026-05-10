'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative mb-8">
      <input
        type="text"
        placeholder="Search for a team or competition..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-panel border border-line rounded-xl px-5 py-3 pr-14 text-sm text-ink placeholder:text-muted focus:border-accent outline-none transition"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-accent text-bg text-xs font-semibold px-3 py-1.5 rounded-lg"
      >
        Search
      </button>
    </form>
  );
}
