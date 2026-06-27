'use client';

import React from 'react';
import { MapPin, Search, ChevronDown, ArrowRight } from 'lucide-react';

interface HeroProps {
  shopName: string;
  shopTagline: string;
}

export default function Hero({ shopName, shopTagline }: HeroProps) {
  const handleScrollToCatalogue = (tab: 'bakery' | 'bakeware') => {
    const el = document.getElementById('catalogue');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    
    // Dispatch tab switch event
    window.dispatchEvent(new CustomEvent('change-catalogue-tab', { detail: tab }));
  };

  const handleSearchFocus = () => {
    const el = document.getElementById('catalogue');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      window.dispatchEvent(new Event('focus-storefront-search'));
    }, 400);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Orange Swiggy Hero Banner */}
      <section className="w-full bg-swiggy-orange text-white py-16 md:py-24 px-6 md:px-12 flex flex-col items-center justify-center relative overflow-hidden text-center">
        {/* Soft floating illustrations in background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute top-10 left-10 text-4xl rotate-12">🍞</div>
          <div className="absolute bottom-10 left-20 text-4xl -rotate-12">🧁</div>
          <div className="absolute top-20 right-20 text-4xl rotate-45">🎂</div>
          <div className="absolute bottom-16 right-12 text-4xl -rotate-6">🍪</div>
        </div>

        <div className="max-w-4xl w-full z-10 space-y-8 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tight text-white leading-tight">
            Order cakes. Shop tools. Bake & Joy it!
          </h1>
          <p className="text-sm md:text-lg font-medium text-white/90">
            {shopTagline}
          </p>

          {/* Search & Location Bar */}
          <div className="w-full max-w-3xl flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-2xl p-1 gap-1 border border-neutral-100">
            {/* Location selector */}
            <div className="flex items-center gap-2.5 px-4 py-3 md:py-4 bg-neutral-50 rounded-xl text-neutral-800 text-sm font-bold shrink-0 md:w-72 select-none border-b md:border-b-0 md:border-r border-neutral-100">
              <MapPin className="w-5 h-5 text-swiggy-orange shrink-0" />
              <span className="truncate text-left flex-1">Sweet Town, Foodville</span>
              <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
            </div>

            {/* Mock Search input acting as scroll trigger */}
            <div
              onClick={handleSearchFocus}
              className="flex-1 flex items-center gap-3 px-4 py-3 md:py-4 text-neutral-400 text-sm font-medium cursor-pointer bg-white rounded-xl hover:bg-neutral-50/50 transition-colors"
            >
              <Search className="w-5 h-5 text-neutral-400 shrink-0" />
              <span className="text-left flex-1">Search for cakes, molds, ingredients or more...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Explore Cards (Swiggy-style layout) */}
      <section className="w-full max-w-6xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {/* Bakery Delivery Card */}
        <div
          onClick={() => handleScrollToCatalogue('bakery')}
          className="bg-white hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 rounded-[32px] border border-neutral-200 overflow-hidden p-6 md:p-8 flex items-center justify-between cursor-pointer group shadow-sm"
        >
          <div className="space-y-3 flex-1 pr-4">
            <h3 className="text-2xl md:text-3xl font-sans font-black text-brand-brown uppercase tracking-tight">
              Bake Shop
            </h3>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
              Fresh cakes, breads & pastries
            </p>
            <span className="inline-block bg-swiggy-orange/10 text-swiggy-orange text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
              100% Fresh
            </span>
            <div className="pt-4">
              <span className="inline-flex items-center gap-2 bg-swiggy-orange text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md group-hover:bg-brand-brown transition-colors">
                Shop Bakery <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
          <div className="w-32 h-32 md:w-36 md:h-36 bg-brand-cream/60 rounded-2xl overflow-hidden flex items-center justify-center text-6xl group-hover:scale-105 transition-transform shrink-0 select-none">
            🍰
          </div>
        </div>

        {/* Bakeware Store Card */}
        <div
          onClick={() => handleScrollToCatalogue('bakeware')}
          className="bg-white hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 rounded-[32px] border border-neutral-200 overflow-hidden p-6 md:p-8 flex items-center justify-between cursor-pointer group shadow-sm"
        >
          <div className="space-y-3 flex-1 pr-4">
            <h3 className="text-2xl md:text-3xl font-sans font-black text-brand-brown uppercase tracking-tight">
              Bakeware Store
            </h3>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
              Pans, molds & ingredients
            </p>
            <span className="inline-block bg-brand-amber/10 text-brand-amber text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
              Baking Supplies
            </span>
            <div className="pt-4">
              <span className="inline-flex items-center gap-2 bg-brand-amber text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md group-hover:bg-brand-brown transition-colors">
                Shop Supplies <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
          <div className="w-32 h-32 md:w-36 md:h-36 bg-brand-rose/10 rounded-2xl overflow-hidden flex items-center justify-center text-6xl group-hover:scale-105 transition-transform shrink-0 select-none">
            🥣
          </div>
        </div>
      </section>
    </div>
  );
}
