import Link from 'next/link';
import { serverClient } from '@/lib/supabase';

export default async function Header() {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b border-line bg-bg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="font-display text-lg tracking-wide">
          THE <span className="text-accent">ARENA</span>
        </Link>
        <nav className="flex gap-4 text-sm text-muted">
          <Link href="/"          className="hover:text-ink">Live</Link>
          <Link href="/?tab=fixtures" className="hover:text-ink">Fixtures</Link>
          <Link href="/?tab=news"     className="hover:text-ink">News</Link>
        </nav>
        <div className="ml-auto text-sm">
          {user ? (
            <form action="/api/auth/signout" method="post">
              <span className="text-muted mr-3">{user.email}</span>
              <button className="text-accent hover:underline">Sign out</button>
            </form>
          ) : (
            <Link href="/login" className="text-accent hover:underline">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
