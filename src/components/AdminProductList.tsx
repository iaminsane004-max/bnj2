'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { Edit, Trash2, Search, ToggleLeft, ToggleRight, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface AdminProductListProps {
  initialProducts: Product[];
}

export default function AdminProductList({ initialProducts }: AdminProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  // Sync state with server products on mount or prop change
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Realtime subscription setup
  useEffect(() => {
    const channel = supabase
      .channel('products_admin')
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

  // Toggle availability
  const toggleAvailable = async (productId: string, currentValue: boolean) => {
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_available: !currentValue } : p))
    );

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !currentValue })
        .eq('id', productId);

      if (error) throw error;
      showToast('Product availability updated!', 'success');
    } catch (error: any) {
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_available: currentValue } : p))
      );
      showToast(error.message || 'Failed to update availability', 'error');
    }
  };

  // Toggle featured status
  const toggleFeatured = async (productId: string, currentValue: boolean) => {
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_featured: !currentValue } : p))
    );

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentValue })
        .eq('id', productId);

      if (error) throw error;
      showToast('Product special status updated!', 'success');
    } catch (error: any) {
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_featured: currentValue } : p))
      );
      showToast(error.message || 'Failed to update special status', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('Product deleted successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  // Extract distinct categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter products list
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Category filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-brand-amber bg-neutral-50 focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-brown text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table/Card List */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-black uppercase tracking-wider text-neutral-500">
                <th className="py-4 px-6">Image</th>
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6 text-center">Available</th>
                <th className="py-4 px-6 text-center">Special</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-neutral-500">
                    <p className="font-bold text-lg mb-1">No products found</p>
                    <p className="text-xs">Add a new product or adjust your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors">
                    {/* Image Thumbnail */}
                    <td className="py-4 px-6 shrink-0">
                      <div className="w-12 h-12 bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center border border-neutral-200 text-lg relative">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          '🧁'
                        )}
                      </div>
                    </td>

                    {/* Product Name & Description */}
                    <td className="py-4 px-6 max-w-xs">
                      <span className="font-bold text-brand-brown block">{product.name}</span>
                      <span className="text-xs text-neutral-400 line-clamp-1">
                        {product.description || 'No description provided.'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="bg-brand-cream border border-brand-brown/15 text-brand-brown text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 font-bold text-brand-brown">
                      ₹{product.price}
                    </td>

                    {/* Available Toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => toggleAvailable(product.id, product.is_available)}
                        className="text-neutral-400 hover:text-brand-brown transition-colors cursor-pointer"
                        title={product.is_available ? 'Make Unavailable' : 'Make Available'}
                      >
                        {product.is_available ? (
                          <ToggleRight className="w-9 h-9 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-neutral-300" />
                        )}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => toggleFeatured(product.id, product.is_featured)}
                        className="text-neutral-400 hover:text-brand-brown transition-colors cursor-pointer"
                        title={product.is_featured ? 'Remove from Specials' : 'Mark as Special'}
                      >
                        {product.is_featured ? (
                          <ToggleRight className="w-9 h-9 text-brand-amber" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-neutral-300" />
                        )}
                      </button>
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-6">
                      {product.stock_count === null ? (
                        <span className="text-neutral-400 font-medium text-xs">Unlimited</span>
                      ) : (
                        <span
                          className={`font-semibold ${
                            product.stock_count === 0
                              ? 'text-red-500 font-black'
                              : product.stock_count <= 5
                              ? 'text-amber-600'
                              : 'text-neutral-700'
                          }`}
                        >
                          {product.stock_count} units
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        {/* Edit Button */}
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-neutral-600 hover:text-brand-amber hover:bg-neutral-100 rounded-xl transition-all"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-sm w-full text-center shadow-xl">
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-brand-brown mb-1.5">Delete Product?</h4>
            <p className="text-xs text-neutral-500 leading-relaxed mb-6">
              Are you sure you want to delete this product? This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
