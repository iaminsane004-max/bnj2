'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addItem, updateQuantity } = useCart();
  const { showToast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);

  // Find if item already exists in cart
  const cartItem = cart.find((item) => item.product_id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    if (!product.is_available) return;

    // Check stock count limit
    if (product.stock_count !== null && quantityInCart >= product.stock_count) {
      showToast(`Only ${product.stock_count} units available in stock`, 'warning');
      return;
    }

    setIsAnimating(true);
    addItem(product, 1);
    showToast(`Added ${product.name} to cart`, 'success');
    
    // Reset animation trigger
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const handleDecrease = () => {
    updateQuantity(product.id, quantityInCart - 1);
    if (quantityInCart === 1) {
      showToast(`Removed ${product.name} from cart`, 'info');
    }
  };

  const isOutOfStock = !product.is_available || (product.stock_count !== null && product.stock_count <= 0);

  return (
    <div
      className={`group relative bg-white border border-brand-brown/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between ${
        isOutOfStock ? 'opacity-75' : ''
      }`}
    >
      {/* Product Image & Out of Stock Overlay */}
      <div className="aspect-square bg-[#FDF6EC] relative overflow-hidden flex items-center justify-center select-none shrink-0 border-b border-brand-brown/5">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl font-serif">🍞</span>
        )}

        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-brand-cream/90 backdrop-blur-md text-brand-brown text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-brand-brown/10 uppercase tracking-wider">
          {product.category}
        </span>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-brand-brown/70 backdrop-blur-xs flex items-center justify-center">
            <span className="text-white text-sm font-black uppercase tracking-widest px-4 py-2 border-2 border-white rounded-xl">
              Out of Stock
            </span>
          </div>
        )}

        {/* Featured Tag */}
        {product.is_featured && !isOutOfStock && (
          <span className="absolute top-3 right-3 bg-brand-amber text-brand-cream text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
            Special
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between text-left">
        <div>
          <h3 className="font-serif font-black text-brand-brown text-base md:text-lg leading-tight group-hover:text-brand-amber transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-brand-brown/65 mt-1.5 line-clamp-2 min-h-[32px] leading-relaxed">
            {product.description || 'Freshly prepared with love.'}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-brown/5">
          <div className="flex flex-col">
            <span className="text-lg font-black text-brand-brown">
              ₹{product.price}
            </span>
            {product.stock_count !== null && (
              <span className="text-[10px] text-brand-amber font-semibold mt-0.5">
                {product.stock_count - quantityInCart <= 0 
                  ? 'No stock remaining' 
                  : `${product.stock_count - quantityInCart} left`}
              </span>
            )}
          </div>

          {/* Action Button with morphing quantity controls */}
          <div className="relative">
            {!isOutOfStock && (
              quantityInCart > 0 ? (
                <div className="flex items-center gap-2 bg-brand-brown text-brand-cream rounded-xl p-1 shadow-md border border-brand-amber">
                  <button
                    onClick={handleDecrease}
                    className="p-1 hover:bg-brand-amber rounded-lg transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center">
                    {quantityInCart}
                  </span>
                  <button
                    onClick={handleAdd}
                    className="p-1 hover:bg-brand-amber rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className={`bg-brand-brown text-brand-cream hover:bg-brand-amber font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ${
                    isAnimating ? 'animate-bounce border border-brand-amber' : ''
                  }`}
                >
                  Add
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
