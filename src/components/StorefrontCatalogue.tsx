'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';
import { Search, SlidersHorizontal, Loader2, ArrowUp } from 'lucide-react';

const categoryEmojis: Record<string, string> = {
  All: '🍽️',
  Cakes: '🎂',
  Breads: '🍞',
  Cookies: '🍪',
  Pastries: '🧁',
  Seasonal: '🍩',
};

interface StorefrontCatalogueProps {
  initialProducts: Product[];
}

export default function StorefrontCatalogue({ initialProducts }: StorefrontCatalogueProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Default');
  const [isLoading, setIsLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Expose search focus handler globally or via ref simulation
  useEffect(() => {
    const handleFocusSearch = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    window.addEventListener('focus-storefront-search', handleFocusSearch);
    return () => window.removeEventListener('focus-storefront-search', handleFocusSearch);
  }, []);

  // Back to top visibility listener
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Realtime subscription setup
  useEffect(() => {
    const channel = supabase
      .channel('products_storefront')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProduct = payload.new as Product;
            setProducts((prev) => [newProduct, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedProduct = payload.new as Product;
            setProducts((prev) =>
              prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedProduct = payload.old as { id: string };
            setProducts((prev) => prev.filter((item) => item.id !== deletedProduct.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Dynamic Categories list
  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(list)];
  }, [products]);

  // Featured / Today's Specials
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.is_featured && p.is_available);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'Price: Low to High') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      list.sort((a, b) => b.price - a.price);
    } else {
      // Default: featured first, then newest
      list.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const scrollToCatalogue = () => {
    const el = document.getElementById('catalogue');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <section className="py-10 px-6 md:px-12 bg-brand-rose/10 border-b border-brand-brown/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-brand-amber bg-brand-cream border border-brand-amber/20 px-3 py-1 rounded-full">
                  Chef's Selection
                </span>
                <h2 className="text-3xl font-serif font-black text-brand-brown mt-2">
                  Today's Specials
                </h2>
              </div>
            </div>

            {/* Horizontal scroll strip */}
            <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-brand-amber scrollbar-track-transparent">
              {featuredProducts.map((product) => (
                <div key={product.id} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Catalogue Section */}
      <section id="catalogue" className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Search, Sort, Filter Controls */}
        <div className="bg-white border border-brand-brown/10 rounded-3xl p-6 md:p-8 shadow-sm mb-10 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-brand-brown/40" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search fresh cakes, breads, pastries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-cream/40 border border-brand-brown/15 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-brand-brown placeholder-brand-brown/50 focus:outline-none focus:border-brand-amber focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
              <SlidersHorizontal className="w-4 h-4 text-brand-brown/60" />
              <span className="text-xs font-bold text-brand-brown/65 uppercase tracking-wider hidden sm:inline">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-brand-cream/40 border border-brand-brown/15 rounded-xl px-4 py-2.5 text-xs font-bold text-brand-brown focus:outline-none focus:border-brand-amber focus:bg-white cursor-pointer"
              >
                <option value="Default">Default (Featured First)</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Categories Horizontal Scroll - Circular Swiggy style */}
          <div className="border-t border-brand-brown/5 pt-6 text-center">
            <h3 className="text-left font-serif font-black text-brand-brown text-lg mb-6">
              Order our best bakery options
            </h3>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none justify-start">
              {categories.map((category) => {
                const emoji = categoryEmojis[category] || '🧁';
                const isActive = selectedCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="flex flex-col items-center gap-2.5 group shrink-0 cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xs border-2 transition-all duration-300 ${
                        isActive
                          ? 'bg-swiggy-orange/10 border-swiggy-orange scale-105 shadow-md'
                          : 'bg-brand-cream/40 border-transparent hover:bg-neutral-100'
                      }`}
                    >
                      {emoji}
                    </div>
                    <span
                      className={`text-xs font-bold tracking-wide uppercase transition-colors ${
                        isActive ? 'text-swiggy-orange font-black' : 'text-brand-brown/70 group-hover:text-brand-brown'
                      }`}
                    >
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 text-brand-amber animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-brand-brown/10 rounded-3xl p-8 max-w-md mx-auto">
            <span className="text-5xl mb-4 block">🧁</span>
            <h3 className="text-xl font-serif font-black text-brand-brown mb-2">No delicacies found</h3>
            <p className="text-sm text-brand-brown/60 leading-relaxed">
              We couldn't find any products matching "{searchQuery || selectedCategory}". Try looking for something else!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 bg-brand-brown hover:bg-brand-amber text-brand-cream p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer border border-brand-amber"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
