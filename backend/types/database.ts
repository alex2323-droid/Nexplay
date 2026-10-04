export type UserRole = 'USER' | 'ADMIN' | 'SUPPORT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  savedPlayerIds?: Record<string, string>; // gameId -> playerId
}

export type OrderStatus = 
  | 'PENDING_PAYMENT' 
  | 'PAID' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'REFUNDED' 
  | 'CANCELLED';

export interface PlayerFieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  required: boolean;
  helpText?: string;
}

export interface Game {
  id: string;
  slug: string;
  name: string;
  category: string;
  publisher: string;
  bannerUrl: string;
  iconUrl: string;
  description: string;
  badge?: string;
  active: boolean;
  featured: boolean;
  playerFields: PlayerFieldConfig[];
  faq: { question: string; answer: string }[];
  importantInfo?: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  gameId: string;
  name: string;
  currencyAmount: number;
  currencyName: string; // e.g. "Gold", "Diamonds", "Robux"
  originalPrice: number;
  price: number;
  costPrice: number; // For admin margin calculation
  providerProductId: string;
  isOffer: boolean;
  discountPercentage?: number;
  badge?: string;
  active: boolean;
  iconUrl?: string;
  popular?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  gameId: string;
  gameName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  playerData: Record<string, string>;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentTransactionId?: string;
  status: OrderStatus;
  providerId: string;
  providerOrderId?: string;
  providerStatus?: string;
  providerMessage?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  testMode: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  maxUsage: number;
  currentUsage: number;
  maxUsagePerUser: number;
  active: boolean;
  startDate?: string;
  expiryDate?: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  logoUrl: string;
  faviconUrl: string;
  currencySymbol: string;
  currencyCode: string;
  timezone: string;
  supportEmail: string;
  supportPhoneWhatsapp: string;
  discordUrl: string;
  activeProvider: 'mock' | 'real_api';
  testMode: boolean;
  providerApiUrl: string;
  providerApiKeyConfigured: boolean; // secret masked
  providerWebhookSecretConfigured: boolean;
  enabledPaymentMethods: string[];
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface WebhookLog {
  id: string;
  provider: string;
  event: string;
  payload: Record<string, any>;
  processed: boolean;
  orderId?: string;
  error?: string;
  createdAt: string;
}
