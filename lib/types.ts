export type Plan = 'free' | 'pro';

export type Board = {
  id: string;
  name: string;
  workspace_id: string;
  created_at: string;
};

export type MediaItem = {
  id: string;
  workspace_id: string;
  ig_shortcode: string;
  ig_username: string;
  ig_url: string;
  type: 'post' | 'reel' | 'tagged';
  caption: string | null;
  hashtags: string[];
  taken_at: string | null;
  likes: number | null;
  comments: number | null;
  views: number | null;
  thumbnail_path: string | null;
  note: string | null;
  rating: number | null;
  tags: string[];
  created_at: string;
};
