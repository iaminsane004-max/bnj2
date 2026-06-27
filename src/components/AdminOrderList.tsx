'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { ChevronDown, ChevronUp, MessageSquare, Clock, CheckCircle, Package, Truck, Calendar } from 'lucide-react';

interface AdminOrderListProps {
  initialOrders: Order[];
}

type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'delivered';

export default function AdminOrderList({ initialOrders }: AdminOrderListProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

  // Sync server prop changes
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Realtime subscription setup for order modifications
  useEffect(() => {
    const channel = supabase
      .channel('orders_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders((prev) => [newOrder, ...prev]);
            showToast(`New order received from ${newOrder.customer_name}!`, 'info');
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            setOrders((prev) =>
              prev.map((item) => (item.id === updatedOrder.id ? updatedOrder : item))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old as { id: string };
            setOrders((prev) => prev.filter((item) => item.id !== deletedOrder.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const previousStatus = orders.find((o) => o.id === orderId)?.status;
    if (!previousStatus) return;

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      showToast(`Order status updated to "${newStatus}"!`, 'success');
    } catch (error: any) {
      // Revert optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: previousStatus } : o))
      );
      showToast(error.message || 'Failed to update order status', 'error');
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Filter orders list
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'All') return true;
    return order.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
            <Package className="w-3.5 h-3.5" /> Ready
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            <Truck className="w-3.5 h-3.5" /> Delivered
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Filter Tab Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {['All', 'Pending', 'Confirmed', 'Ready', 'Delivered'].map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === filter
                ? 'bg-[#3B1F0E] text-white shadow-xs scale-102'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-3xl p-16 text-center shadow-xs">
            <span className="text-4xl mb-3 block">📋</span>
            <p className="font-bold text-lg text-brand-brown mb-1">No orders found</p>
            <p className="text-xs text-neutral-400">
              There are no orders listed under "{statusFilter}" status.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = !!expandedOrders[order.id];
            const shortId = order.id.substring(0, 8);
            const cleanPhone = order.customer_phone.replace(/\D/g, '');
            const dateStr = new Date(order.created_at).toLocaleString();

            return (
              <div
                key={order.id}
                className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs hover:border-neutral-300 transition-all"
              >
                {/* Order Summary Header Row */}
                <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8 flex-1">
                    {/* Order ID */}
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-400 block tracking-wider">
                        Order ID
                      </span>
                      <span className="font-mono font-bold text-brand-brown text-sm uppercase">
                        #{shortId}
                      </span>
                    </div>

                    {/* Customer */}
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-400 block tracking-wider">
                        Customer
                      </span>
                      <span className="font-bold text-brand-brown block">{order.customer_name}</span>
                    </div>

                    {/* Total Amount */}
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-400 block tracking-wider">
                        Total Amount
                      </span>
                      <span className="font-extrabold text-brand-brown text-base">
                        ₹{order.total_amount}
                      </span>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-400 block tracking-wider">
                        Payment
                      </span>
                      <span className="font-semibold text-neutral-600 text-xs">
                        {order.payment_method}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-[10px] font-black uppercase text-neutral-400 block tracking-wider">
                        Date & Time
                      </span>
                      <span className="text-neutral-500 text-xs font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {dateStr}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto border-t md:border-t-0 pt-4 md:pt-0">
                    {/* Status Badge & Dropdown */}
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-bold text-brand-brown focus:outline-none focus:border-brand-amber cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      {getStatusBadge(order.status)}
                    </div>

                    {/* Contact Customer Link */}
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
                      title="Contact Customer on WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>

                    {/* Expand Toggle */}
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-2.5 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-all cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 bg-neutral-50/50 p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Delivery Address */}
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-2">
                          Delivery Address
                        </h4>
                        <div className="bg-white border border-neutral-200 rounded-2xl p-4 text-xs font-semibold leading-relaxed text-brand-brown">
                          {order.customer_address || 'None'}
                        </div>
                      </div>

                      {/* Instructions */}
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-2">
                          Special Instructions
                        </h4>
                        <div className="bg-white border border-neutral-200 rounded-2xl p-4 text-xs font-semibold leading-relaxed text-brand-brown">
                          {order.special_instructions || 'None'}
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items Summary */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-3">
                        Items Ordered
                      </h4>
                      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-neutral-50/80 border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              <th className="py-2.5 px-4">Item Name</th>
                              <th className="py-2.5 px-4 text-center">Quantity</th>
                              <th className="py-2.5 px-4 text-right">Unit Price</th>
                              <th className="py-2.5 px-4 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-xs font-semibold text-brand-brown">
                            {order.items.map((item, index) => (
                              <tr key={index}>
                                <td className="py-3 px-4">{item.name}</td>
                                <td className="py-3 px-4 text-center">{item.quantity}</td>
                                <td className="py-3 px-4 text-right">₹{item.unit_price}</td>
                                <td className="py-3 px-4 text-right">
                                  ₹{item.unit_price * item.quantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
