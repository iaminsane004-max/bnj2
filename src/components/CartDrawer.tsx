'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import CheckoutModal from './CheckoutModal';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const {
    cart,
    totalItems,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
  } = useCart();

  const { showToast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const handleProceed = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty!', 'warning');
      return;
    }
    // Open checkout modal, close cart drawer
    setIsCheckoutOpen(true);
    setIsCartOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-brand-brown/50 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setIsCartOpen(false)}
        />

        {/* Sliding Panel */}
        <div className="relative w-full max-w-md h-full bg-brand-cream border-l-2 border-brand-brown shadow-2xl flex flex-col z-10 animate-slide-left text-left">
          {/* Header */}
          <div className="p-6 border-b border-brand-brown/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-amber" />
              <h2 className="text-xl font-serif font-black text-brand-brown">
                Your Basket ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-brand-brown/60 hover:text-brand-brown hover:bg-brand-brown/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-brand-brown/5 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-brand-brown/40" />
                </div>
                <p className="text-brand-brown/80 font-bold mb-1">Your cart is empty</p>
                <p className="text-xs text-brand-brown/50 max-w-[200px]">
                  Browse our catalogue and add some freshly baked joy!
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product_id}
                  className="flex gap-4 p-3 bg-white rounded-2xl border border-brand-brown/10 hover:shadow-sm transition-all"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl bg-brand-cream border border-brand-brown/5 shrink-0 overflow-hidden relative flex items-center justify-center text-xl font-serif">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      '🍞'
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-brand-brown leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-xs text-brand-brown/60 mt-0.5">
                        ₹{item.unit_price} each
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-brand-cream border border-brand-brown/10 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 hover:bg-brand-brown/5 rounded text-brand-brown transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-brand-brown">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 hover:bg-brand-brown/5 rounded text-brand-brown transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          removeItem(item.product_id);
                          showToast(`${item.name} removed from cart`, 'info');
                        }}
                        className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-brand-brown/10 bg-white rounded-t-3xl">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm text-brand-brown/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-brown">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-xs text-brand-brown/50">
                  <span>Delivery Charges</span>
                  <span className="italic text-brand-amber font-semibold">Discussed with owner</span>
                </div>
                <div className="pt-2 border-t border-brand-brown/10 flex justify-between items-center text-lg font-black text-brand-brown">
                  <span>Total Amount</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <button
                onClick={handleProceed}
                className="w-full bg-brand-brown hover:bg-brand-amber text-brand-cream py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer text-sm tracking-wide uppercase"
              >
                Proceed to Order <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  );
}
