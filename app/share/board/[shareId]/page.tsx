import { notFound } from 'next/navigation';
import { getServiceSupabase } from '@/lib/supabase';

export default async function SharedBoardPage({ params }: { params: { shareId: string } }) {
  const service = getServiceSupabase();
  const { data: share } = await service.from('shares').select('*').eq('share_id', params.shareId).eq('target_type', 'board').maybeSingle();
  if (!share) notFound();

  const { data: board } = await service.from('boards').select('*').eq('id', share.target_id).maybeSingle();
  const { data } = await service.from('board_items').select('media_items(*)').eq('board_id', share.target_id);
  const items = (data || []).map((x: any) => x.media_items).filter(Boolean);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Shared board: {board?.name}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item: any) => <div key={item.id} className="border border-slate-800 rounded p-2">{item.thumbnail_path && <img src={item.thumbnail_path} alt="thumb" className="w-full rounded" />}<p className="text-xs mt-2">{item.caption}</p></div>)}
      </div>
    </main>
  );
}
