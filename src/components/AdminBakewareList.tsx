'use client';

import React, { useState, useEffect } from 'react';
import { Bakeware } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { Edit, Trash2, Search, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface AdminBakewareListProps {
  initialBakeware: Bakeware[];
}

export default function AdminBakewareList({ initialBakeware }: AdminBakewareListProps) {
  const [bakeware, setBakeware] = useState<Bakeware[]>(initialBakeware);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setBakeware(initialBakeware);
  }, [initialBakeware]);

  // Realtime subscription setup
  useEffect(() => {
    const channel = supabase
      .channel('bakeware_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bakeware' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as Bakeware;
            setBakeware((prev) => [newItem, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Bakeware;
            setBakeware((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item))
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string };
            setBakeware((prev) => prev.filter((item) => item.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Toggle availability
  const toggleAvailable = async (itemId: string, currentValue: boolean) => {
    setBakeware((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, is_available: !currentValue } : item))
    );

    try {
      const { error } = await supabase
        .from('bakeware')
        .update({ is_available: !currentValue })
        .eq('id', itemId);

      if (error) throw error;
      showToast('Item availability updated!', 'success');
    } catch (error: any) {
      setBakeware((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, is_available: currentValue } : item))
      );
      showToast(error.message || 'Failed to update availability', 'error');
    }
  };

  // Toggle featured status
  const toggleFeatured = async (itemId: string, currentValue: boolean) => {
    setBakeware((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, is_featured: !currentValue } : item))
    );

    try {
      const { error } = await supabase
        .from('bakeware')
        .update({ is_featured: !currentValue })
        .eq('id', itemId);

      if (error) throw error;
      showToast('Special status updated!', 'success');
    } catch (error: any) {
      setBakeware((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, is_featured: currentValue } : item))
      );
      showToast(error.message || 'Failed to update special status', 'error');
    }
  };

  const handleDelete = async (itemId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('bakeware').delete().eq('id', itemId);
      if (error) throw error;
      setBakeware((prev) => prev.filter((item) => item.id !== itemId));
      showToast('Item deleted successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete item', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const categories = ['All', ...Array.from(new Set(bakeware.map((b) => b.category)))];

  const filteredItems = bakeware.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

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
            placeholder="Search bakeware & supplies..."
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

      {/* Bakeware Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-black uppercase tracking-wider text-neutral-500">
                <th className="py-4 px-6">Image</th>
                <th className="py-4 px-6">Item Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6 text-center">Available</th>
                <th className="py-4 px-6 text-center">Special</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-neutral-500">
                    <p className="font-bold text-lg mb-1">No items found</p>
                    <p className="text-xs">Add a new bakeware item or adjust filters.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                    {/* Image */}
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center border border-neutral-200 text-lg relative">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          '🥣'
                        )}
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-4 px-6 max-w-xs">
                      <span className="font-bold text-brand-brown block">{item.name}</span>
                      <span className="text-xs text-neutral-400 line-clamp-1">
                        {item.description || 'No description provided.'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="bg-brand-cream border border-brand-brown/15 text-brand-brown text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 font-bold text-brand-brown">
                      ₹{item.price}
                    </td>

                    {/* Available */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => toggleAvailable(item.id, item.is_available)}
                        className="text-neutral-400 hover:text-brand-brown transition-colors cursor-pointer"
                      >
                        {item.is_available ? (
                          <ToggleRight className="w-9 h-9 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-neutral-300" />
                        )}
                      </button>
                    </td>

                    {/* Featured */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => toggleFeatured(item.id, item.is_featured)}
                        className="text-neutral-400 hover:text-brand-brown transition-colors cursor-pointer"
                      >
                        {item.is_featured ? (
                          <ToggleRight className="w-9 h-9 text-brand-amber" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-neutral-300" />
                        )}
                      </button>
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-6">
                      {item.stock_count === null ? (
                        <span className="text-neutral-400 font-medium text-xs">Unlimited</span>
                      ) : (
                        <span
                          className={`font-semibold ${
                            item.stock_count === 0
                              ? 'text-red-500 font-black'
                              : 'text-neutral-700'
                          }`}
                        >
                          {item.stock_count} units
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/admin/bakeware/${item.id}/edit`}
                          className="p-2 text-neutral-600 hover:text-brand-amber hover:bg-neutral-100 rounded-xl transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
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
            <h4 className="text-lg font-black text-brand-brown mb-1.5">Delete Item?</h4>
            <p className="text-xs text-neutral-500 leading-relaxed mb-6">
              Are you sure you want to delete this bakeware item? This action is permanent and cannot be undone.
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
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
