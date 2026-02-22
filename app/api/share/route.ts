import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const type = String(formData.get('type')) as 'board' | 'item';
  const targetId = String(formData.get('target_id'));

  const { data: workspace } = await supabase.from('workspaces').select('*').eq('user_id', user.id).single();
  const shareId = randomUUID();
  await supabase.from('shares').insert({ workspace_id: workspace.id, share_id: shareId, target_type: type, target_id: targetId });

  return NextResponse.json({ shareUrl: `${new URL(request.url).origin}/share/${type}/${shareId}` });
}
