import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase';
import { ensureWorkspaceAndDefaultBoard } from '@/lib/workspace';

export default async function Home() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  await ensureWorkspaceAndDefaultBoard(user.id);
  redirect('/boards');
}
