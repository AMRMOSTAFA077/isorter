import { notFound } from 'next/navigation';
import { getServiceSupabase } from '@/lib/supabase';

export default async function SharedItemPage({ params }: { params: { shareId: string } }) {
  const service = getServiceSupabase();
  const { data: share } = await service.from('shares').select('*').eq('share_id', params.shareId).eq('target_type', 'item').maybeSingle();
  if (!share) notFound();

  const { data: item } = await service.from('media_items').select('*').eq('id', share.target_id).maybeSingle();
  if (!item) notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Shared item</h1>
      {item.thumbnail_path && <img src={item.thumbnail_path} alt="thumb" className="w-full rounded mb-4" />}
      <p className="mb-2">{item.caption}</p>
      <p className="text-sm text-slate-300">{(item.hashtags || []).join(' ')}</p>
      {item.note && <p className="mt-4">Note: {item.note}</p>}
      {item.rating && <p>Rating: {item.rating}/5</p>}
      <p className="text-sm mt-2">Tags: {(item.tags || []).join(', ')}</p>
    </main>
  );
}
