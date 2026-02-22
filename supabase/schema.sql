create extension if not exists "uuid-ossp";

create table if not exists workspaces (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique,
  plan text not null default 'free' check (plan in ('free','pro')),
  created_at timestamptz not null default now()
);

create table if not exists boards (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists media_items (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  ig_username text not null,
  ig_shortcode text not null,
  ig_url text not null,
  type text not null check (type in ('post','reel','tagged')),
  caption text,
  hashtags text[] not null default '{}',
  taken_at timestamptz,
  likes int,
  comments int,
  views int,
  thumbnail_path text,
  note text,
  rating int check (rating between 1 and 5),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(workspace_id, ig_shortcode)
);

create table if not exists board_items (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid not null references boards(id) on delete cascade,
  media_item_id uuid not null references media_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(board_id, media_item_id)
);

create table if not exists shares (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  share_id text not null unique,
  target_type text not null check (target_type in ('board','item')),
  target_id uuid not null,
  created_at timestamptz not null default now()
);

alter table workspaces enable row level security;
alter table boards enable row level security;
alter table media_items enable row level security;
alter table board_items enable row level security;
alter table shares enable row level security;

create policy "workspace owner" on workspaces for all using (auth.uid() = user_id);
create policy "boards via workspace" on boards for all using (workspace_id in (select id from workspaces where user_id = auth.uid()));
create policy "media via workspace" on media_items for all using (workspace_id in (select id from workspaces where user_id = auth.uid()));
create policy "board_items via board" on board_items for all using (board_id in (select id from boards where workspace_id in (select id from workspaces where user_id = auth.uid())));
create policy "shares via workspace" on shares for all using (workspace_id in (select id from workspaces where user_id = auth.uid()));
