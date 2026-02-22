import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import { ensureWorkspaceAndDefaultBoard } from '@/lib/workspace';

export async function POST(request: Request) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const workspace = await ensureWorkspaceAndDefaultBoard(user.id);
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  if (!name) return NextResponse.redirect(new URL('/boards', request.url));

  const { count } = await supabase.from('boards').select('*', { count: 'exact', head: true }).eq('workspace_id', workspace.id);
  if (workspace.plan === 'free' && (count || 0) >= 1) {
    return NextResponse.json({ error: 'Free plan supports 1 board only.' }, { status: 403 });
  }

  await supabase.from('boards').insert({ workspace_id: workspace.id, name });
  return NextResponse.redirect(new URL('/boards', request.url));
}
