import { 
  Game, 
  Product, 
  Order, 
  User, 
  Coupon, 
  SupportTicket, 
  SupportMessage, 
  StoreSettings 
} from '../types';

const API_BASE = '/api';

export const api = {
  // Settings
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Error al cargar configuración');
    return res.json();
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    return data.settings;
  },

  // Games
  async getGames(all = false): Promise<Game[]> {
    const res = await fetch(`${API_BASE}/games?all=${all}`);
    if (!res.ok) throw new Error('Error al cargar juegos');
    return res.json();
  },

  async getGameByIdentifier(identifier: string): Promise<{ game: Game; products: Product[] }> {
    const res = await fetch(`${API_BASE}/games/${identifier}`);
    if (!res.ok) throw new Error('Juego no encontrado');
    return res.json();
  },

  async saveGame(game: Game): Promise<Game> {
    const res = await fetch(`${API_BASE}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });
    const data = await res.json();
    return data.game;
  },

  async deleteGame(id: string): Promise<void> {
    await fetch(`${API_BASE}/games/${id}`, { method: 'DELETE' });
  },

  // Products
  async getProducts(gameId?: string): Promise<Product[]> {
    const url = gameId ? `${API_BASE}/products?gameId=${gameId}` : `${API_BASE}/products`;
    const res = await fetch(url);
    return res.json();
  },

  async getOffers(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products/offers`);
    return res.json();
  },

  async saveProduct(product: Product): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    const data = await res.json();
    return data.product;
  },

  async deleteProduct(id: string): Promise<void> {
    await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  },

  // Coupons
  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; calculatedDiscount: number; error?: string }> {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    return res.json();
  },

  async getCoupons(): Promise<Coupon[]> {
    const res = await fetch(`${API_BASE}/coupons`);
    return res.json();
  },

  async createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon)
    });
    const data = await res.json();
    return data.coupon;
  },

  // Checkout & Orders
  async createCheckout(data: {
    userId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    productId: string;
    quantity: number;
    playerData: Record<string, string>;
    couponCode?: string;
    paymentMethod: string;
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al procesar checkout');
    return json.order;
  },

  async payOrder(orderId: string, transactionId?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al procesar pago');
    return json.order;
  },

  async getOrders(params?: { email?: string; userId?: string; search?: string }): Promise<Order[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/orders?${query}`);
    return res.json();
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    if (!res.ok) throw new Error('Pedido no encontrado');
    return res.json();
  },

  async retryOrder(orderId: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/retry`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al reintentar pedido');
    return json.order;
  },

  async updateOrderStatus(orderId: string, status: string, message?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, message })
    });
    const json = await res.json();
    return json.order;
  },

  // Auth
  async login(email: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    return data.user;
  },

  async register(name: string, email: string, phone?: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone })
    });
    const data = await res.json();
    return data.user;
  },

  // Support
  async getTickets(email?: string): Promise<SupportTicket[]> {
    const url = email ? `${API_BASE}/support/tickets?email=${encodeURIComponent(email)}` : `${API_BASE}/support/tickets`;
    const res = await fetch(url);
    return res.json();
  },

  async createTicket(ticketData: any): Promise<{ ticket: SupportTicket; message: SupportMessage }> {
    const res = await fetch(`${API_BASE}/support/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
    return res.json();
  },

  async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
    const res = await fetch(`${API_BASE}/support/tickets/${ticketId}/messages`);
    return res.json();
  },

  async sendTicketMessage(ticketId: string, msgData: any): Promise<SupportMessage> {
    const res = await fetch(`${API_BASE}/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData)
    });
    const data = await res.json();
    return data.message;
  },

  // Admin
  async getAdminDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/dashboard`);
    return res.json();
  },

  async getProviderBalance(): Promise<{ balance: number; currency: string }> {
    const res = await fetch(`${API_BASE}/admin/provider-balance`);
    return res.json();
  },

  // Hermes Agent AI
  async askHermes(prompt: string, history: any[] = []): Promise<string> {
    const res = await fetch(`${API_BASE}/ai/hermes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history })
    });
    const data = await res.json();
    return data.reply;
  },

  // Supabase Status & Sync
  async getSupabaseStatus(): Promise<{ configured: boolean; url: string; connected: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/supabase/status`);
    return res.json();
  },

  async syncSupabase(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/supabase/sync`, { method: 'POST' });
    return res.json();
  }
};
