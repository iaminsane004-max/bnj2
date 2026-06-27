'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  PlusCircle,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Skip layout on the login page
  const isLoginPage = pathname === '/admin/login';
  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showToast('Logged out successfully', 'info');
      router.refresh();
      router.push('/admin/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      showToast(error.message || 'Logout failed', 'error');
    }
  };

  const navLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: UtensilsCrossed },
    { href: '/admin/products/new', label: 'Add Product', icon: PlusCircle },
    { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#3B1F0E] text-[#FDF6EC] p-6 text-left">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#FDF6EC]/10 mb-8 shrink-0">
        <div>
          <span className="text-xl font-serif font-black text-white tracking-wide">
            Chef Dashboard
          </span>
          <span className="block text-[10px] text-brand-amber font-bold uppercase tracking-wider mt-0.5">
            Bake & Joy
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-white/5 hover:bg-brand-rose/20 text-brand-rose hover:text-white transition-all cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all group ${
                isActive
                  ? 'bg-brand-amber text-brand-cream shadow-md'
                  : 'hover:bg-white/5 text-[#FDF6EC]/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-cream' : 'text-brand-amber'}`} />
                <span>{link.label}</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="pt-6 border-t border-[#FDF6EC]/10 shrink-0 text-center">
        <Link
          href="/"
          className="text-xs font-bold text-brand-amber hover:underline inline-flex items-center gap-1.5"
        >
          &larr; View Storefront
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex min-h-screen bg-neutral-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 border-r border-[#3B1F0E]/5 shrink-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Nav Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#3B1F0E] text-[#FDF6EC] px-6 border-b border-[#FDF6EC]/5 flex items-center justify-between z-30 shadow-md">
        <span className="font-serif font-black text-lg">Bake & Joy Admin</span>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20 flex">
          <div className="fixed inset-0 bg-brand-brown/50" onClick={() => setIsMobileOpen(false)} />
          <div className="relative w-72 h-full animate-slide-left pt-16">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen pt-16 lg:pt-0 overflow-x-hidden">
        <div className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto text-left">
          {children}
        </div>
      </main>
    </div>
  );
}
