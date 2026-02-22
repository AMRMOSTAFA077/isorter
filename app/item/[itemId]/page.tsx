import { notFound, redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase';

type Props = { params: { itemId: string } };

export default async function ItemPage({ params }: Props) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: workspace } = await supabase.from('workspaces').select('*').eq('user_id', user.id).single();
  const { data: item } = await supabase.from('media_items').select('*').eq('id', params.itemId).eq('workspace_id', workspace.id).maybeSingle();
  if (!item) notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between mb-4"><h1 className="text-2xl font-semibold">Item details</h1>
        <form action="/api/share" method="post">
          <input type="hidden" name="type" value="item" />
          <input type="hidden" name="target_id" value={item.id} />
          <button>Share item</button>
        </form>
      </div>
      {item.thumbnail_path && <img src={item.thumbnail_path} alt="thumbnail" className="w-full rounded mb-4" />}
      <p className="mb-2">{item.caption}</p>
      <div className="flex gap-2 mb-4">
        <button type="button" onClick={() => navigator.clipboard.writeText(item.caption || '')}>Copy caption</button>
        <button type="button" onClick={() => navigator.clipboard.writeText((item.hashtags || []).join(' '))}>Copy hashtags</button>
      </div>
      <form action={`/api/item/${item.id}`} method="post" className="space-y-3">
        <textarea name="note" defaultValue={item.note || ''} className="w-full" placeholder="Note" />
        <input type="number" min={1} max={5} name="rating" defaultValue={item.rating || ''} placeholder="Rating 1-5" />
        <input name="tags" defaultValue={(item.tags || []).join(', ')} placeholder="tag1, tag2" className="w-full" />
        <button type="submit">Save</button>
      </form>
    </main>
  );
}
