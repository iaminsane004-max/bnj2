import React from 'react';
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import {
  Utensils,
  CheckCircle2,
  CalendarDays,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  const supabase = createClient();
  
  // Date boundary for "today" (local time start of day in UTC format)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const [
    totalProductsRes,
    availableProductsRes,
    totalOrdersTodayRes,
    pendingOrdersRes,
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_available', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return {
    totalProducts: totalProductsRes.count || 0,
    availableProducts: availableProductsRes.count || 0,
    totalOrdersToday: totalOrdersTodayRes.count || 0,
    pendingOrders: pendingOrdersRes.count || 0,
  };
}

export default async function AdminOverview() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-black text-brand-brown">
          Overview
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Here is what's happening at Bake & Joy today.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-white p-6 border border-neutral-200 rounded-3xl shadow-xs flex items-center gap-5">
          <div className="p-4 bg-brand-cream rounded-2xl text-brand-brown">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
              Total Products
            </p>
            <p className="text-2xl font-black text-brand-brown mt-0.5">
              {stats.totalProducts}
            </p>
          </div>
        </div>

        {/* Available Products */}
        <div className="bg-white p-6 border border-neutral-200 rounded-3xl shadow-xs flex items-center gap-5">
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
              Available
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">
              {stats.availableProducts}
            </p>
          </div>
        </div>

        {/* Orders Today */}
        <div className="bg-white p-6 border border-neutral-200 rounded-3xl shadow-xs flex items-center gap-5">
          <div className="p-4 bg-brand-rose/10 rounded-2xl text-brand-amber">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
              Orders Today
            </p>
            <p className="text-2xl font-black text-brand-brown mt-0.5">
              {stats.totalOrdersToday}
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 border border-neutral-200 rounded-3xl shadow-xs flex items-center gap-5 animate-pulse">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
              Pending Orders
            </p>
            <p className="text-2xl font-black text-amber-700 mt-0.5">
              {stats.pendingOrders}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-[#3B1F0E] text-[#FDF6EC] p-6 md:p-8 rounded-[32px] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            Quick Actions <TrendingUp className="w-5 h-5 text-brand-amber" />
          </h2>
          <p className="text-sm text-[#FDF6EC]/70 max-w-lg">
            Easily expand your menu catalog by adding new baked delicacies, or jump straight into fulfilling customer requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 shrink-0">
          <Link
            href="/admin/products/new"
            className="bg-brand-amber hover:bg-white hover:text-brand-brown text-brand-cream font-bold px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white/10 hover:bg-white/20 text-[#FDF6EC] font-bold px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2 text-xs uppercase tracking-wider border border-[#FDF6EC]/15"
          >
            Review Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
