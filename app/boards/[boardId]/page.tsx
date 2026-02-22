import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase';

type Props = { params: { boardId: string }, searchParams: Record<string, string | undefined> };

export default async function BoardPage({ params, searchParams }: Props) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: workspace } = await supabase.from('workspaces').select('*').eq('user_id', user.id).single();
  const { data: board } = await supabase.from('boards').select('*').eq('id', params.boardId).eq('workspace_id', workspace.id).maybeSingle();
  if (!board) notFound();

  let query = supabase.from('board_items').select('media_items(*)').eq('board_id', board.id);
  if (searchParams.type) query = query.eq('media_items.type', searchParams.type);
  if (searchParams.min_likes) query = query.gte('media_items.likes', Number(searchParams.min_likes));
  if (searchParams.min_views) query = query.gte('media_items.views', Number(searchParams.min_views));
  const { data } = await query;

  let items = (data || []).map((x: any) => x.media_items).filter(Boolean);
  if (searchParams.search) {
    const q = searchParams.search.toLowerCase();
    items = items.filter((i: any) => `${i.caption || ''} ${(i.hashtags || []).join(' ')}`.toLowerCase().includes(q));
  }
  const sortBy = searchParams.sort || 'date';
  items.sort((a: any, b: any) => (b[sortBy] || 0) - (a[sortBy] || 0));

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">{board.name}</h1>
        <form action="/api/share" method="post">
          <input type="hidden" name="type" value="board" />
          <input type="hidden" name="target_id" value={board.id} />
          <button>Share board</button>
        </form>
      </div>

      <form className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
        <input name="search" placeholder="Search" defaultValue={searchParams.search} />
        <select name="type" defaultValue={searchParams.type}><option value="">All</option><option>post</option><option>reel</option><option>tagged</option></select>
        <input name="min_likes" type="number" placeholder="Min likes" defaultValue={searchParams.min_likes} />
        <input name="min_views" type="number" placeholder="Min views" defaultValue={searchParams.min_views} />
        <select name="sort" defaultValue={searchParams.sort}><option value="date">date</option><option value="likes">likes</option><option value="views">views</option><option value="comments">comments</option></select>
        <button type="submit">Apply</button>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item: any) => (
          <Link key={item.id} href={`/item/${item.id}`} className="border border-slate-800 rounded p-3 hover:bg-slate-900">
            {item.thumbnail_path && <img src={item.thumbnail_path} className="w-full aspect-square object-cover rounded mb-2" alt="thumbnail" />}
            <div className="text-xs bg-slate-800 inline-block px-2 py-1 rounded mb-2">{item.type}</div>
            <p className="text-xs">❤️ {item.likes || 0} · ▶️ {item.views || 0} · 💬 {item.comments || 0}</p>
            <p className="text-xs text-slate-400">{item.taken_at ? new Date(item.taken_at).toLocaleDateString() : '-'}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
