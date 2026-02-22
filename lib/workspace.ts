import { getServerSupabase } from './supabase';

export async function ensureWorkspaceAndDefaultBoard(userId: string) {
  const supabase = getServerSupabase();
  let { data: workspace } = await supabase.from('workspaces').select('*').eq('user_id', userId).maybeSingle();

  if (!workspace) {
    const created = await supabase.from('workspaces').insert({ user_id: userId, plan: 'free' }).select('*').single();
    workspace = created.data;
  }

  const { count } = await supabase.from('boards').select('*', { count: 'exact', head: true }).eq('workspace_id', workspace!.id);
  if (!count) {
    await supabase.from('boards').insert({ workspace_id: workspace!.id, name: 'Default Board' });
  }

  return workspace!;
}
