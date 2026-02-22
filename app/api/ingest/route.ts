import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const service = getServiceSupabase();
  const { data: userData } = await service.auth.getUser(token);
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await request.formData();
  const boardId = String(form.get('board_id'));
  const { data: workspace } = await service.from('workspaces').select('*').eq('user_id', user.id).single();
  const { data: board } = await service.from('boards').select('*').eq('id', boardId).eq('workspace_id', workspace.id).maybeSingle();
  if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 });

  const file = form.get('thumbnail') as File | null;
  let thumbnailPath: string | null = null;
  if (file) {
    const key = `${workspace.id}/${form.get('ig_shortcode')}-${Date.now()}.jpg`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const uploaded = await service.storage.from('thumbnails').upload(key, bytes, { contentType: file.type || 'image/jpeg', upsert: true });
    if (!uploaded.error) {
      const signed = await service.storage.from('thumbnails').createSignedUrl(key, 60 * 60 * 24 * 30);
      thumbnailPath = signed.data?.signedUrl || null;
    }
  }

  const payload = {
    workspace_id: workspace.id,
    ig_username: String(form.get('ig_username') || ''),
    ig_shortcode: String(form.get('ig_shortcode') || ''),
    ig_url: String(form.get('ig_url') || ''),
    type: String(form.get('type') || 'post'),
    caption: String(form.get('caption') || ''),
    hashtags: JSON.parse(String(form.get('hashtags') || '[]')),
    taken_at: form.get('taken_at') ? String(form.get('taken_at')) : null,
    likes: Number(form.get('likes') || 0),
    comments: Number(form.get('comments') || 0),
    views: Number(form.get('views') || 0),
    thumbnail_path: thumbnailPath,
    note: form.get('note') ? String(form.get('note')) : null,
    rating: form.get('rating') ? Number(form.get('rating')) : null,
    tags: form.get('tags') ? JSON.parse(String(form.get('tags'))) : [],
  };

  const { data: mediaItem, error } = await service
    .from('media_items')
    .upsert(payload, { onConflict: 'workspace_id,ig_shortcode' })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await service.from('board_items').upsert({ board_id: board.id, media_item_id: mediaItem.id }, { onConflict: 'board_id,media_item_id' });

  return NextResponse.json({ ok: true, item_id: mediaItem.id });
}
