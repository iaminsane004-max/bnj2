import React from 'react';
import { createClient } from '@/lib/supabase-server';
import AdminProductList from '@/components/AdminProductList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading products for admin:', error);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-black text-brand-brown">
            Menu Products
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create, update, and manage products on your storefront menu.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-brand-amber hover:bg-brand-brown text-brand-cream font-bold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 text-xs uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <AdminProductList initialProducts={products || []} />
    </div>
  );
}
