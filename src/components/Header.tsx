'use client';

import React from 'react';
import { ShoppingBag, Search, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'Bake & Joy';
  const whatsappNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || '';

  const handleSearchClick = () => {
    window.dispatchEvent(new Event('focus-storefront-search'));
  };

  return (
    <>
      {/* Floating Announcement Bar */}
      <div className="bg-brand-brown text-brand-cream text-center text-xs py-2 px-4 font-semibold tracking-wide border-b border-brand-amber">
        🎉 Free delivery on orders above ₹499 · Order by 6 PM for same-day delivery
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-brand-cream/80 backdrop-blur-md border-b border-brand-brown/10 py-4 px-6 md:px-12 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-serif font-black text-brand-brown tracking-wide hover:scale-102 transition-transform cursor-pointer">
            🍞 {shopName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Trigger */}
          <button
            onClick={handleSearchClick}
            className="p-2 rounded-full text-brand-brown hover:bg-brand-brown/5 transition-all active:scale-95"
            title="Search Products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Contact Owner Link */}
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-brown/80 hover:text-brand-amber transition-colors"
            >
              <Phone className="w-4 h-4" /> Support
            </a>
          )}

          {/* Cart Icon Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full bg-brand-brown text-brand-cream hover:bg-brand-amber transition-all shadow-md hover:shadow-lg active:scale-95 group"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-amber text-brand-cream text-[10px] font-bold w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-brand-cream animate-bounce">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>
    </>
  );
}
