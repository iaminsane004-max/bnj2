-- Create bakeware table
create table public.bakeware (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null, -- 'Pans & Molds', 'Tools & Utensils', 'Decorations', 'Ingredients'
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  stock_count integer, -- null means unlimited
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.bakeware enable row level security;

-- Bakeware RLS policies
-- 1. Public SELECT
create policy "Allow public read access to bakeware" 
  on public.bakeware for select 
  using (true);

-- 2. Authenticated write (Owner)
create policy "Allow authenticated write access to bakeware" 
  on public.bakeware for all 
  to authenticated 
  using (true) 
  with check (true);

-- Enable Realtime for bakeware
begin;
  alter publication supabase_realtime drop table if exists public.bakeware;
  alter publication supabase_realtime add table public.bakeware;
commit;

-- Seed sample bakeware items
insert into public.bakeware (name, description, price, category, is_available, is_featured, stock_count) values
('Non-Stick 9-Inch Springform Pan', 'Heavy-duty carbon steel cake pan with a quick-release latch and removable bottom.', 450.00, 'Pans & Molds', true, true, 8),
('12-Piece Piping Bags & Tips Kit', 'Reusable silicone pastry bags with 10 stainless steel icing nozzles and couplers.', 299.00, 'Tools & Utensils', true, true, 15),
('Premium Rainbow Sprinkles (200g)', 'Colorful sugar sprinkles for decorating cakes, cupcakes, and cookies.', 85.00, 'Decorations', true, false, null),
('Instant Active Dry Yeast (100g)', 'Professional-grade fast-acting yeast for baking soft breads and pizza doughs.', 120.00, 'Ingredients', true, false, 50),
('Silicon Baking Mat (Half Sheet)', 'Non-stick food-grade silicone mat, oven-safe up to 250°C. Perfect for cookies.', 199.00, 'Tools & Utensils', true, false, 12),
('Belgian Dark Chocolate Chips (500g)', '54% cocoa baking chocolate chips, perfect for cookies, brownies, and melting.', 380.00, 'Ingredients', true, true, 20);
