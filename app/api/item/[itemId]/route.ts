import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

export async function POST(request: Request, { params }: { params: { itemId: string } }) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const { data: workspace } = await supabase.from('workspaces').select('*').eq('user_id', user.id).single();
  const formData = await request.formData();
  const note = String(formData.get('note') || '');
  const rating = Number(formData.get('rating') || 0);
  const tags = String(formData.get('tags') || '').split(',').map((s) => s.trim()).filter(Boolean);

  await supabase.from('media_items').update({ note, rating: rating || null, tags }).eq('id', params.itemId).eq('workspace_id', workspace.id);
  return NextResponse.redirect(new URL(`/item/${params.itemId}`, request.url));
}
