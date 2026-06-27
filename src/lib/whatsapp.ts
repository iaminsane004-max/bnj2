import { CartItem } from '@/types';

export function formatWhatsAppMessage(order: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  items: CartItem[];
  totalAmount: number;
  specialInstructions?: string;
  orderId: string;
}): string {
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'Bake & Joy';
  const shortId = order.orderId.substring(0, 8);
  const instructions = order.specialInstructions?.trim() || 'None';

  const detailsList = order.items
    .map((item) => `${item.quantity}x ${item.name} — ₹${item.unit_price * item.quantity}`)
    .join('\n');

  return `🍞 *New Order — ${shopName}*

*Customer:* ${order.customerName}
*Phone:* ${order.customerPhone}
*Address:* ${order.customerAddress || 'None'}
*Payment:* ${order.paymentMethod}

*Order Details:*
${detailsList}

*Order Total:* ₹${order.totalAmount}

*Special Instructions:* ${instructions}
*Order ID:* ${shortId}`;
}

export function buildWhatsAppLink(message: string): string {
  const phoneNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || '';
  // Clean phone number: remove any non-digit characters
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
