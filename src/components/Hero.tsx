'use client';

import React from 'react';

interface HeroProps {
  shopName: string;
  shopTagline: string;
}

export default function Hero({ shopName, shopTagline }: HeroProps) {
  const handleShopNowClick = () => {
    const el = document.getElementById('catalogue');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearchMenuClick = () => {
    window.dispatchEvent(new Event('focus-storefront-search'));
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-6 md:px-12 bg-gradient-to-b from-brand-rose/5 to-brand-cream border-b border-brand-brown/5 flex items-center">
      {/* Soft background illustrations / visual patterns */}
      <div className="absolute inset-0 opacity-4 select-none pointer-events-none bg-[radial-gradient(#3B1F0E_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="text-left space-y-6 md:max-w-xl">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-amber bg-brand-amber/10 px-4.5 py-2 rounded-full border border-brand-amber/20">
            🥐 100% Homemade & Fresh
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tight text-brand-brown leading-[1.05]">
            {shopName}
          </h1>
          <p className="text-lg md:text-xl font-medium text-brand-brown/80 leading-relaxed font-sans">
            {shopTagline}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleShopNowClick}
              className="bg-brand-brown hover:bg-brand-amber text-brand-cream font-bold px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer text-sm uppercase tracking-wider"
            >
              Shop Now
            </button>
            <button
              onClick={handleSearchMenuClick}
              className="bg-white hover:bg-brand-brown/5 border border-brand-brown/20 text-brand-brown font-bold px-7 py-4 rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer text-sm uppercase tracking-wider"
            >
              Search Menu
            </button>
          </div>
        </div>

        {/* Hero Appetizing Placeholder Photo */}
        <div className="relative flex items-center justify-center">
          <div className="w-full max-w-[420px] aspect-square rounded-[40px] bg-gradient-to-tr from-brand-amber to-brand-rose p-1.5 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full bg-brand-cream rounded-[34px] overflow-hidden flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-brand-brown/20 relative group">
              <span className="text-7xl mb-4 group-hover:scale-110 transition-transform">🥞</span>
              <h3 className="font-serif font-black text-2xl text-brand-brown mb-2">Baked with Joy</h3>
              <p className="text-xs text-brand-brown/65 max-w-[240px] leading-relaxed">
                Cakes, cookies, breads, and pastries crafted with the finest ingredients and delivered fresh to your door.
              </p>
              <div className="absolute bottom-4 text-[10px] uppercase font-bold text-brand-amber tracking-widest bg-brand-cream border border-brand-amber/15 px-3 py-1 rounded-full">
                Pure Vegetarian
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
