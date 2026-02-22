import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase';
import { ensureWorkspaceAndDefaultBoard } from '@/lib/workspace';

export default async function BoardsPage() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const workspace = await ensureWorkspaceAndDefaultBoard(user.id);
  const { data: boards } = await supabase.from('boards').select('*').eq('workspace_id', workspace.id).order('created_at');

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Boards</h1>
        <form action="/api/boards" method="post" className="flex gap-2">
          <input name="name" placeholder="New board" required />
          <button type="submit">Create board</button>
        </form>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards?.map((board) => (
          <Link href={`/boards/${board.id}`} key={board.id} className="block p-4 border border-slate-800 rounded hover:bg-slate-900">
            <h2 className="font-medium">{board.name}</h2>
            <p className="text-xs text-slate-400">{new Date(board.created_at).toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
