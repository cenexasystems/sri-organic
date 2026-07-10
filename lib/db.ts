import { createClient } from './supabase';

const supabase = createClient();

export interface ProductSize {
  size: string;
  price: number;
  isAvailable?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  herbs?: string;
  benefits: string[];
  sizes: ProductSize[];
  isAvailable?: boolean;
  details?: string;
  howToUse?: string;
  tamilName?: string;
  nutritionalInfo?: { label: string; value: string }[];
}

export interface OrderItem {
  productId: string;
  name: string;
  size?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  source: string;
  items: OrderItem[];
  subtotal: number;
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  createdAt: string;
  couponCode?: string;
  couponDiscount: number;
  manualDiscount: number;
  deliveryCharge: number;
  cashReceived: number;
  changeReturned: number;
}

export interface Coupon {
  code: string;
  discount: number;
  minOrder: number;
  expiryDate?: string;
  usageLimit: number;
  usedCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UserProfile {
  id: string;
  role: string;
  email: string;
  name: string;
  mobile: string;
  joinedDate: string;
}

export interface WhatsappRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  items: any[];
  createdAt: string;
}

// ============================
// PROFILES
// ============================
export const fetchProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return data.map((p: any) => ({
    id: p.id,
    email: p.email,
    name: p.name,
    mobile: p.mobile,
    role: p.role,
    joinedDate: p.joined_date,
  }));
};

export const updateUserRole = async (id: string, role: string) => {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
  if (error) throw error;
};

// ============================
// CATEGORIES
// ============================
export const fetchCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('categories').select('name');
  if (error) throw error;
  return data.map((c: any) => c.name);
};

export const insertCategory = async (name: string): Promise<string> => {
  const { error } = await supabase.from('categories').insert([{ name }]);
  if (error) throw error;
  return name;
};

export const dbDeleteCategory = async (name: string) => {
  const { error } = await supabase.from('categories').delete().eq('name', name);
  if (error) throw error;
};

// ============================
// PRODUCTS
// ============================
export const fetchProducts = async (): Promise<Product[]> => {
  const { data: products, error: pError } = await supabase.from('products').select('*');
  if (pError) throw pError;
  
  const { data: sizes, error: sError } = await supabase.from('product_sizes').select('*').order('sort_order');
  if (sError) throw sError;

  return products.map((p: any) => {
    const prodSizes = sizes.filter((s: any) => s.product_id === p.id).map((s: any) => ({
      size: s.size,
      price: s.price,
      isAvailable: s.is_available
    }));

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      image: p.image,
      herbs: p.herbs,
      benefits: p.benefits,
      sizes: prodSizes,
      isAvailable: p.is_available,
      details: p.details,
      howToUse: p.how_to_use,
      tamilName: p.tamil_name,
      nutritionalInfo: p.nutritional_info,
    };
  });
};

export const upsertProduct = async (product: Product, imageFile?: File): Promise<string> => {
  let imageUrl = product.image;

  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${product.id}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    imageUrl = data.publicUrl;
  }

  const { error: pError } = await supabase.from('products').upsert({
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    image: imageUrl,
    herbs: product.herbs,
    benefits: product.benefits,
    is_available: product.isAvailable !== false,
    details: product.details,
    how_to_use: product.howToUse,
    tamil_name: product.tamilName,
    nutritional_info: product.nutritionalInfo,
  });
  if (pError) throw pError;

  // Sync sizes: delete old, insert new
  const { error: delError } = await supabase.from('product_sizes').delete().eq('product_id', product.id);
  if (delError) throw delError;

  if (product.sizes.length > 0) {
    const sizesToInsert = product.sizes.map((s, index) => ({
      product_id: product.id,
      size: s.size,
      price: s.price,
      is_available: s.isAvailable !== false,
      sort_order: index,
    }));
    const { error: sError } = await supabase.from('product_sizes').insert(sizesToInsert);
    if (sError) throw sError;
  }

  return imageUrl || '';
};

export const dbDeleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

// ============================
// COUPONS
// ============================
export const fetchCoupons = async (): Promise<Coupon[]> => {
  const { data, error } = await supabase.from('coupons').select('*');
  if (error) throw error;
  return data.map((c: any) => ({
    code: c.code,
    discount: c.discount,
    minOrder: c.min_order,
    expiryDate: c.expiry_date,
    usageLimit: c.usage_limit,
    usedCount: c.used_count,
    status: c.status,
  }));
};

export const upsertCoupon = async (coupon: Coupon) => {
  const { error } = await supabase.from('coupons').upsert({
    code: coupon.code,
    discount: coupon.discount,
    min_order: coupon.minOrder,
    expiry_date: coupon.expiryDate || null,
    usage_limit: coupon.usageLimit,
    used_count: coupon.usedCount,
    status: coupon.status,
  });
  if (error) throw error;
  return coupon;
};

export const dbDeleteCoupon = async (code: string) => {
  const { error } = await supabase.from('coupons').delete().eq('code', code);
  if (error) throw error;
};

// ============================
// ORDERS
// ============================
export const fetchOrders = async (): Promise<Order[]> => {
  const { data: ordersData, error: oError } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  if (oError) throw oError;

  return ordersData.map((o: any) => ({
    id: o.id,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerEmail: o.customer_email,
    customerAddress: o.customer_address,
    source: o.source,
    items: o.order_items.map((it: any) => ({
      productId: it.product_id,
      name: it.name,
      size: it.size,
      quantity: it.quantity,
      price: it.price,
    })),
    subtotal: o.subtotal,
    totalPrice: o.total_price,
    status: o.status,
    createdAt: o.created_at,
    couponCode: o.coupon_code,
    couponDiscount: o.coupon_discount,
    manualDiscount: o.manual_discount,
    deliveryCharge: o.delivery_charge,
    cashReceived: o.cash_received,
    changeReturned: o.change_returned,
  }));
};

export const fetchOrderById = async (id: string): Promise<Order | null> => {
  const { data: o, error: oError } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).single();
  if (oError) {
    if (oError.code === 'PGRST116') return null; // Not found
    throw oError;
  }

  return {
    id: o.id,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerEmail: o.customer_email,
    customerAddress: o.customer_address,
    source: o.source,
    items: o.order_items.map((it: any) => ({
      productId: it.product_id,
      name: it.name,
      size: it.size,
      quantity: it.quantity,
      price: it.price,
    })),
    subtotal: o.subtotal,
    totalPrice: o.total_price,
    status: o.status,
    createdAt: o.created_at,
    couponCode: o.coupon_code,
    couponDiscount: o.coupon_discount,
    manualDiscount: o.manual_discount,
    deliveryCharge: o.delivery_charge,
    cashReceived: o.cash_received,
    changeReturned: o.change_returned,
  };
};

export const fetchOrdersByEmail = async (email: string): Promise<Order[]> => {
  const { data: ordersData, error: oError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_email', email)
    .order('created_at', { ascending: false });
    
  if (oError) throw oError;

  return ordersData.map((o: any) => ({
    id: o.id,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerEmail: o.customer_email,
    customerAddress: o.customer_address,
    source: o.source,
    items: o.order_items.map((it: any) => ({
      productId: it.product_id,
      name: it.name,
      size: it.size,
      quantity: it.quantity,
      price: it.price,
    })),
    subtotal: o.subtotal,
    totalPrice: o.total_price,
    status: o.status,
    createdAt: o.created_at,
    couponCode: o.coupon_code,
    couponDiscount: o.coupon_discount,
    manualDiscount: o.manual_discount,
    deliveryCharge: o.delivery_charge,
    cashReceived: o.cash_received,
    changeReturned: o.change_returned,
  }));
};

export const insertOrder = async (order: Order) => {
  const { error: oError } = await supabase.from('orders').insert([{
    id: order.id,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_email: order.customerEmail || '',
    customer_address: order.customerAddress || '',
    source: order.source,
    subtotal: order.subtotal,
    total_price: order.totalPrice,
    status: order.status,
    coupon_code: order.couponCode || null,
    coupon_discount: order.couponDiscount,
    manual_discount: order.manualDiscount,
    delivery_charge: order.deliveryCharge,
    cash_received: order.cashReceived,
    change_returned: order.changeReturned,
  }]);
  if (oError) throw oError;

  if (order.items.length > 0) {
    const itemsToInsert = order.items.map(it => ({
      order_id: order.id,
      product_id: it.productId,
      name: it.name,
      size: it.size || '—',
      quantity: it.quantity,
      price: it.price,
    }));
    const { error: iError } = await supabase.from('order_items').insert(itemsToInsert);
    if (iError) throw iError;
  }
};

export const updateOrderStatusDb = async (id: string, status: string) => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
};

// ============================
// WHATSAPP REQUESTS
// ============================
export const fetchWhatsappRequests = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('source', 'ONLINE')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return data.map((o: any) => ({
    id: o.id,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerEmail: o.customer_email,
    customerAddress: o.customer_address,
    source: o.source,
    items: (o.order_items || []).map((it: any) => ({
      productId: it.product_id,
      name: it.name,
      size: it.size,
      quantity: it.quantity,
      price: it.price,
    })),
    subtotal: o.subtotal,
    totalPrice: o.total_price,
    status: o.status,
    createdAt: o.created_at,
    couponCode: o.coupon_code,
    couponDiscount: o.coupon_discount,
    manualDiscount: o.manual_discount,
    deliveryCharge: o.delivery_charge,
    cashReceived: o.cash_received,
    changeReturned: o.change_returned,
  }));
};

export const updateWhatsappRequestStatus = async (id: string, status: string) => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
};
