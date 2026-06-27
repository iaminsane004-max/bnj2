import React from 'react';
import { createClient } from '@/lib/supabase-server';
import AdminOrderList from '@/components/AdminOrderList';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading orders for admin:', error);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-black text-brand-brown">
          Customer Orders
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Review, manage, and coordinate payments for all customer orders.
        </p>
      </div>

      <AdminOrderList initialOrders={orders || []} />
    </div>
  );
}
