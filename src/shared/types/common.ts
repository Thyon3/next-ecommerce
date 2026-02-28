export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  features?: Feature[];
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  features?: string[];
}

export interface Feature {
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  total: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  total: number;
  product?: Product;
  variant?: ProductVariant;
  addedAt: Date;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  product?: Product;
  variant?: ProductVariant;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  content: string;
  type: 'PRODUCT' | 'DELIVERY' | 'SERVICE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verified: boolean;
  helpful?: number;
  user?: User;
  product?: Product;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryRequest {
  id: string;
  userId: string;
  productId?: string;
  orderId?: string;
  deliveryType: string;
  deliveryAddress: Address;
  contactName: string;
  contactPhone: string;
  instructions?: string;
  status: string;
  estimatedDeliveryTime: Date;
  deliveryPersonId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  serviceArea?: string;
  workingHours?: WorkingHours;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  status: string;
  autoRenew: boolean;
  nextBillingDate: Date;
  cancelledAt?: Date;
  product?: Product;
  variant?: ProductVariant;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  promotions: boolean;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  conversionRate: number;
  averageOrderValue: number;
  topProducts: Product[];
  recentOrders: Order[];
  userGrowth: { date: string; users: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}
