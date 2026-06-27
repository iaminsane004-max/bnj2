'use client';

import React, { useState, useEffect } from 'react';
import { Bakeware } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';

interface BakewareFormProps {
  bakewareItem?: Bakeware;
}

const PREDEFINED_CATEGORIES = ['Pans & Molds', 'Tools & Utensils', 'Decorations', 'Ingredients'];

export default function BakewareForm({ bakewareItem }: BakewareFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(PREDEFINED_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Load existing details if editing
  useEffect(() => {
    if (bakewareItem) {
      setName(bakewareItem.name);
      setPrice(bakewareItem.price.toString());
      setDescription(bakewareItem.description || '');
      setStockCount(bakewareItem.stock_count !== null ? bakewareItem.stock_count.toString() : '');
      setIsAvailable(bakewareItem.is_available);
      setIsFeatured(bakewareItem.is_featured);
      setImageUrl(bakewareItem.image_url || '');
      setImagePreview(bakewareItem.image_url || '');

      if (PREDEFINED_CATEGORIES.includes(bakewareItem.category)) {
        setCategory(bakewareItem.category);
        setIsCustomCategory(false);
      } else {
        setCategory('Other');
        setCustomCategory(bakewareItem.category);
        setIsCustomCategory(true);
      }
    }
  }, [bakewareItem]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    if (val === 'Other') {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'warning');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `bakeware/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error('Upload failed:', err);
      showToast(err.message || 'Image upload failed.', 'error');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Item name is required', 'warning');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Please enter a valid price greater than 0', 'warning');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      showToast('Please specify a category', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      if (imageFile) {
        finalImageUrl = await handleUploadImage(imageFile);
      }

      const stock = stockCount.trim() === '' ? null : parseInt(stockCount);

      const payload = {
        name: name.trim(),
        price: priceNum,
        category: finalCategory,
        description: description.trim() || null,
        stock_count: stock,
        is_available: isAvailable,
        is_featured: isFeatured,
        image_url: finalImageUrl || null,
        updated_at: new Date().toISOString(),
      };

      if (bakewareItem) {
        // Update
        const { error } = await supabase
          .from('bakeware')
          .update(payload)
          .eq('id', bakewareItem.id);

        if (error) throw error;
        showToast('Bakeware item updated successfully!', 'success');
      } else {
        // Insert
        const { error } = await supabase
          .from('bakeware')
          .insert([payload]);

        if (error) throw error;
        showToast('Bakeware item added successfully!', 'success');
      }

      router.refresh();
      router.push('/admin/bakeware');
    } catch (error: any) {
      console.error('Save error:', error);
      showToast(error.message || 'Failed to save item details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-neutral-200 rounded-[32px] p-6 md:p-8 shadow-xs">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/bakeware"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-amber uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Supplies
        </Link>
        <span className="text-xs text-neutral-400 font-semibold">
          {bakewareItem ? 'Edit Mode' : 'New Creation'}
        </span>
      </div>

      <h2 className="text-2xl font-serif font-black text-brand-brown mb-6">
        {bakewareItem ? `Edit Item: ${bakewareItem.name}` : 'Add New Baking Supply'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-2">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Standard 12-Cup Muffin Pan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-brand-amber transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-brand-amber transition-colors bg-white"
            >
              {PREDEFINED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Other">Other / Custom Category...</option>
            </select>
          </div>

          {/* Custom Category */}
          {isCustomCategory && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-2">
                Specify Custom Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mixers, Scales"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-brand-amber transition-colors"
              />
            </div>
          )}

          {/* Price */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 299"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-brand-amber transition-colors"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-2">
              Stock Count
            </label>
            <input
              type="number"
              placeholder="Leave blank for unlimited"
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-brand-amber transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Details about dimensions, material, capacity, or ingredients specs..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-brand-amber transition-colors resize-none"
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-brand-brown">
                Available in Shop
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-brand-brown">
                Mark as Today's Special
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-amber" />
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-2">
            Item Image
          </label>
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {imagePreview ? (
              <div className="relative w-36 h-36 rounded-2xl border-2 border-brand-brown/10 bg-neutral-50 overflow-hidden flex items-center justify-center shrink-0">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 rounded-full text-white hover:bg-black transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center text-center p-4 text-neutral-400 shrink-0 select-none">
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-[10px] font-bold">No Image</span>
              </div>
            )}

            <div className="flex-1 space-y-2 text-left">
              <label className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer border border-neutral-300">
                <Upload className="w-3.5 h-3.5" /> Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Accepts JPEG, PNG, or WebP. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full bg-[#3B1F0E] hover:bg-brand-amber text-brand-cream py-4 rounded-xl font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider border-2 border-[#3B1F0E]"
        >
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />{' '}
              {isUploading ? 'Uploading Image...' : 'Saving Supplies Details...'}
            </>
          ) : (
            'Save Item'
          )}
        </button>
      </form>
    </div>
  );
}
