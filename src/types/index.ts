export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  stock_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  items: CartItem[];
  total_amount: number;
  payment_method: string;
  special_instructions: string | null;
  status: 'pending' | 'confirmed' | 'ready' | 'delivered';
  created_at: string;
}
