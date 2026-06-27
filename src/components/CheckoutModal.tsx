'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatWhatsAppMessage, buildWhatsAppLink } from '@/lib/whatsapp';
import { X, CheckCircle, Send, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, totalAmount, clearCart } = useCart();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [shortOrderId, setShortOrderId] = useState('');

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, max 10 digits
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhone(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter your full name', 'warning');
      return;
    }
    if (phone.length !== 10) {
      showToast('Please enter a valid 10-digit WhatsApp number', 'warning');
      return;
    }
    if (!address.trim()) {
      showToast('Please enter your delivery address', 'warning');
      return;
    }
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullPhone = `+91${phone}`;
      const itemsData = cart.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      // Generate the UUID client-side to prevent RLS read/select violation
      const orderId = crypto.randomUUID();
      setShortOrderId(orderId.substring(0, 8));

      // 1. Insert order to Supabase without retrieving it via .select()
      const { error } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer_name: name,
          customer_phone: fullPhone,
          customer_address: address,
          items: itemsData,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          special_instructions: instructions || null,
          status: 'pending',
        });

      if (error) throw error;

      // 2. Format WhatsApp Message
      const message = formatWhatsAppMessage({
        customerName: name,
        customerPhone: fullPhone,
        customerAddress: address,
        paymentMethod: paymentMethod,
        items: cart,
        totalAmount: totalAmount,
        specialInstructions: instructions,
        orderId: orderId,
      });

      // 3. Build wa.me link
      const whatsappLink = buildWhatsAppLink(message);

      // 4. Open in new tab
      window.open(whatsappLink, '_blank');

      // 5. Success screen and confetti
      setOrderSuccess(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D97706', '#3B1F0E', '#F9A8D4', '#FDF6EC'],
      });

      // 6. Clear cart
      clearCart();
      showToast('Order saved and WhatsApp opened!', 'success');
    } catch (error: any) {
      console.error('Checkout error:', error);
      showToast(error.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state and close
    setName('');
    setPhone('');
    setAddress('');
    setPaymentMethod('UPI');
    setInstructions('');
    setOrderSuccess(false);
    setShortOrderId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-brand-cream border-2 border-brand-brown rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-brand-brown/60 hover:text-brand-brown hover:bg-brand-brown/5 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!orderSuccess ? (
          <>
            <h3 className="text-2xl font-serif font-black text-brand-brown mb-2 pr-8">
              Complete Your Order
            </h3>
            <p className="text-sm text-brand-brown/70 mb-6">
              Fill in your details. We will automatically generate your WhatsApp order message.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-brand-brown/20 rounded-xl px-4 py-3 text-sm text-brand-brown focus:outline-none focus:border-brand-amber transition-colors"
                />
              </div>

              {/* WhatsApp Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-1.5">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="relative flex rounded-xl border border-brand-brown/20 overflow-hidden bg-white focus-within:border-brand-amber transition-colors">
                  <span className="flex items-center justify-center bg-brand-brown/5 border-r border-brand-brown/10 px-3.5 text-sm font-semibold text-brand-brown/70">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 text-sm text-brand-brown focus:outline-none bg-transparent"
                  />
                </div>
                <p className="text-[10px] text-brand-brown/50 mt-1">
                  We'll use this to connect with you on WhatsApp.
                </p>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-1.5">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Street Name, House No, Landmark, Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-brand-brown/20 rounded-xl px-4 py-3 text-sm text-brand-brown focus:outline-none focus:border-brand-amber transition-colors resize-none"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-1.5">
                  Preferred Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white border border-brand-brown/20 rounded-xl px-4 py-3 text-sm text-brand-brown focus:outline-none focus:border-brand-amber transition-colors"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/80 mb-1.5">
                  Special Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. eggless, deliver by 4 PM, less sugar"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-white border border-brand-brown/20 rounded-xl px-4 py-3 text-sm text-brand-brown focus:outline-none focus:border-brand-amber transition-colors resize-none"
                />
              </div>

              {/* Total Summary */}
              <div className="bg-brand-brown/5 rounded-2xl p-4 border border-brand-brown/10 flex items-center justify-between mt-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-brand-brown/60 tracking-wider">Order Total</p>
                  <p className="text-xl font-black text-brand-brown">₹{totalAmount}</p>
                </div>
                <div className="text-right text-[11px] text-brand-brown/60 max-w-[200px]">
                  Payment will be coordinated directly with the owner on WhatsApp.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-brown text-brand-cream hover:bg-brand-amber hover:text-brand-cream disabled:bg-brand-brown/50 font-bold py-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm tracking-wide uppercase"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing Order...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Order on WhatsApp
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center bg-brand-amber/10 p-4 rounded-full mb-6 animate-pulse">
              <CheckCircle className="w-16 h-16 text-brand-amber" />
            </div>
            <h3 className="text-3xl font-serif font-black text-brand-brown mb-3">
              Order Sent! 🎉
            </h3>
            <p className="text-brand-brown/85 font-medium mb-6 leading-relaxed">
              We've notified the shop on WhatsApp. The owner will confirm your order and payment details shortly.
            </p>
            <div className="bg-brand-brown/5 rounded-2xl p-4 border border-brand-brown/10 mb-8 max-w-sm mx-auto">
              <span className="text-xs text-brand-brown/60 block mb-1">Your Order ID:</span>
              <span className="text-lg font-mono font-bold text-brand-brown select-all uppercase">#{shortOrderId}</span>
            </div>
            <button
              onClick={handleClose}
              className="bg-brand-brown text-brand-cream hover:bg-brand-amber font-bold py-3.5 px-8 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer uppercase text-xs tracking-wider"
            >
              Continue Shopping
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
