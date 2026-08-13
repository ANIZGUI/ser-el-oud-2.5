alter table public.products
  add column if not exists line text,
  add column if not exists volume text,
  add column if not exists concentration text,
  add column if not exists rating numeric,
  add column if not exists mood text,
  add column if not exists notes text[],
  add column if not exists description text,
  add column if not exists tag text,
  add column if not exists swatch text,
  add column if not exists image_position text,
  add column if not exists image_url text;
