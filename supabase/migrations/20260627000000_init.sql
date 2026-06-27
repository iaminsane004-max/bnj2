-- Create products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null,
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  stock_count integer, -- nullable: null means unlimited
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  items jsonb not null, -- Array of {product_id, name, quantity, unit_price}
  total_amount numeric(10,2) not null,
  payment_method text not null, -- 'UPI', 'Cash on Delivery', 'Bank Transfer'
  special_instructions text,
  status text not null default 'pending', -- 'pending', 'confirmed', 'ready', 'delivered'
  created_at timestamptz not null default now()
);

-- Enable RLS on both tables
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Products policies
-- 1. Public SELECT
create policy "Allow public read access to products" 
  on public.products for select 
  using (true);

-- 2. Authenticated Insert/Update/Delete (Owner)
create policy "Allow authenticated write access to products" 
  on public.products for all 
  to authenticated 
  using (true) 
  with check (true);

-- Orders policies
-- 1. Public INSERT
create policy "Allow public insert access to orders" 
  on public.orders for insert 
  with check (true);

-- 2. Authenticated Select/Update (Owner)
create policy "Allow authenticated select/update access to orders" 
  on public.orders for all 
  to authenticated 
  using (true) 
  with check (true);

-- Enable Realtime for products table
begin;
  -- remove the table from publication if it exists
  alter publication supabase_realtime drop table if exists public.products;
  -- add the table to the publication
  alter publication supabase_realtime add table public.products;
commit;
