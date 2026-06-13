// User
export interface User {
  _id: string;
  uid: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller';
  createdAt: string;
}

// Category
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

// Product
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  slug: string;
  category: Category;
  sellerUid: string;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

// Cart
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order
export interface OrderItem {
  product: Product;
  name: string;
  price: number;
  quantity: number;
  sellerUid: string;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  _id: string;
  buyerUid: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  status: OrderStatus;
  isPaid: boolean;
  paymentId?: string;
  createdAt: string;
}

// Payment
export type PaymentMethod =
  | 'upi'
  | 'card'
  | 'cod'
  | 'netbanking'
  | 'wallet'
  | 'emi';

export interface Payment {
  _id: string;
  order: string;
  buyerUid: string;
  amount: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  method: PaymentMethod;
  isCOD: boolean;
}

// Seller earnings
export interface SellerEarning {
  _id: string;
  sellerUid: string;
  order: Order | string;
  grossAmount: number;
  platformFeePercentage: number;
  platformFeeAmount: number;
  netAmount: number;
  status: 'pending' | 'available' | 'paid_out';
  createdAt: string;
}

// API responses
export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error: string;
}