# Bake & Joy Storefront & Owner Dashboard

A full-stack quick commerce storefront and owner management portal inspired by Swiggy Instamart, optimized for local artisan bakers. Built with **Next.js (App Router)**, **Tailwind CSS**, and **Supabase** (Auth, Database, Storage, and Realtime).

---

## Features

### 🛒 Customer Storefront (Public, no login required)
- **Elegant Hero & Tagline**: Cozy bakery aesthetics using curated HSL color themes.
- **Announcement Strip**: Floating announcement banner for promotion info.
- **Today's Specials**: Row displaying featured products tagged by the owner.
- **Interactive Product Catalog**: Grid with instant client-side search, category filter tabs, price sorting, and dynamic out-of-stock badges.
- **Instamart-Style Cart Drawer**: Slide-out cart displaying subtotals, custom delivery notes, and instant quantity adjustments.
- **Instant WhatsApp Checkout**: Integrates checkout forms with a validation schema. On submission, details are logged to the database and a formatted `wa.me` deep link opens automatically in a new tab to complete order and payment arrangements directly.

### 🔐 Owner Dashboard (Protected by Supabase Auth)
- **Real-Time Overview Panel**: Dashboard metrics (Total Products, Active Products, Orders Today, and Pending Orders).
- **Product Inventory Manager**: Real-time product directory with inline toggles (`is_available` and `is_featured`) updating the database and storefront instantly.
- **Product Form (New/Edit)**: Allows text entry, category creation, stock settings, and product file uploads to a Supabase Storage bucket (`product-images`).
- **Orders Dispatch Panel**: List of customer orders, status changes (Pending, Confirmed, Ready, Delivered), and deep links to chat with clients directly on WhatsApp.

---

## 🛠️ Step-by-Step Setup

### 1. Clone the project and Install Dependencies
Navigate to your workspace directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to a new file named `.env.local`:
```bash
cp .env.local.example .env.local
```
Fill in the values inside `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in your Supabase project under Settings > API.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role secret found under Settings > API (used for administrative tasks).
- `NEXT_PUBLIC_OWNER_WHATSAPP`: The owner's WhatsApp number with country code, without the leading `+` (e.g. `919876543210` for India).
- `NEXT_PUBLIC_SHOP_NAME`: e.g. `Bake & Joy`
- `NEXT_PUBLIC_SHOP_ADDRESS`: e.g. `123 Bakery Lane, Sweet Town`
- `NEXT_PUBLIC_SHOP_TAGLINE`: Tagline displayed on landing page.

---

## 💾 Supabase Project Configurations

### 1. Run Schema Migrations
1. Go to your **Supabase Dashboard** > **SQL Editor**.
2. Click **New Query**.
3. Copy the contents of the initialization migration file [init.sql](file:///c:/Users/adith/Desktop/bnj/supabase/migrations/20260627000000_init.sql) and run it. This will create tables `products` and `orders`, enable Row Level Security (RLS) policies, and register the products table to the realtime publication channel.

### 2. Seed Sample Products
1. Open a new query window in the **Supabase SQL Editor**.
2. Copy the contents of the seeding script [seed.sql](file:///c:/Users/adith/Desktop/bnj/supabase/migrations/20260627000001_seed.sql) and run it. This populates your inventory with various cakes, pastries, breads, and cookies.

### 3. Create the Storage Bucket
1. In your **Supabase Dashboard**, navigate to **Storage**.
2. Create a new bucket named exactly **`product-images`**.
3. Toggle the bucket configuration to **Public** (so public URLs are readable by clients).
4. Save the configuration.

### 4. Create the Owner Admin Account
To access the private dashboard at `/admin`, you need to register a user account:
1. Go to your **Supabase Dashboard** > **Authentication** > **Users**.
2. Click **Add User** > **Create User**.
3. Enter an email and password for the owner (e.g., `chef@bakenjoy.com` / `securepassword123`).
4. Toggle "Auto-confirm user" on to skip email confirmations, then save.
5. You can now use these credentials to log in at the `/admin/login` page.

---

## 🚀 Running Locally

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Storefront**: `http://localhost:3000/`
- **Dashboard**: `http://localhost:3000/admin`
