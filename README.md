# iSorter Dashboard (MVP)

Next.js + Supabase dashboard for storing and organizing Instagram content sent from the extension.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. Apply database schema from `supabase/schema.sql`.
4. Create private storage bucket named `thumbnails`.
5. Run dev server:
   ```bash
   npm run dev
   ```

## Routes
- `/login` login page
- `/boards` board list + create
- `/boards/[boardId]` board grid and filters
- `/item/[itemId]` item details + metadata editing
- `/api/ingest` extension ingest endpoint
- `/api/share` create share links
- `/share/board/[shareId]` public board view
- `/share/item/[shareId]` public item view

## Notes
- Free plan allows exactly one board.
- Upsert for media uses `(workspace_id, ig_shortcode)`.
- Share pages are public and fetch with service role on server side only.
