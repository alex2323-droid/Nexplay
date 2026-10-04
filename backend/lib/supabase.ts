import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { dbStore } from '../store';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; key: string; isConfigured: boolean } {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || dbStore.settings.supabaseUrl || '';
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || dbStore.settings.supabaseAnonKey || '';
  const isConfigured = Boolean(url && key && url.includes('supabase.co') && key.length > 10);
  return { url, key, isConfigured };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false }
    });
  }
  return supabaseClient;
}

export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Credenciales de Supabase pendientes. Ingresa SUPABASE_URL y SUPABASE_ANON_KEY.'
    };
  }

  try {
    const { data, error } = await client.from('games').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { connected: false, message: `Error Supabase: ${error.message}` };
    }
    return { connected: true, message: '¡Conexión exitosa a la base de datos Supabase!' };
  } catch (err: any) {
    return { connected: false, message: `Fallo de conexión: ${err.message}` };
  }
}

// Sync helper functions to fetch/persist data to Supabase
export async function syncFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // 1. Sync Games
    const { data: gamesData } = await client.from('games').select('*').order('sort_order', { ascending: true });
    if (gamesData && gamesData.length > 0) {
      dbStore.games = gamesData.map(g => ({
        id: g.id,
        slug: g.slug,
        name: g.name,
        category: g.category,
        publisher: g.publisher,
        bannerUrl: g.banner_url,
        iconUrl: g.icon_url,
        description: g.description,
        badge: g.badge,
        active: g.active,
        featured: g.featured,
        sortOrder: g.sort_order,
        playerFields: g.player_fields || [],
        faq: g.faq || [],
        importantInfo: g.important_info || ''
      }));
    }

    // 2. Sync Products
    const { data: productsData } = await client.from('products').select('*');
    if (productsData && productsData.length > 0) {
      dbStore.products = productsData.map(p => ({
        id: p.id,
        gameId: p.game_id,
        name: p.name,
        currencyAmount: Number(p.currency_amount),
        currencyName: p.currency_name,
        originalPrice: Number(p.original_price),
        price: Number(p.price),
        costPrice: Number(p.cost_price),
        providerProductId: p.provider_product_id,
        isOffer: p.is_offer,
        discountPercentage: p.discount_percentage,
        badge: p.badge,
        active: p.active,
        popular: p.popular
      }));
    }

    // 3. Sync Orders
    const { data: ordersData } = await client.from('orders').select('*').order('created_at', { ascending: false });
    if (ordersData && ordersData.length > 0) {
      dbStore.orders = ordersData.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        userId: o.user_id,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        customerPhone: o.customer_phone,
        items: o.items || [],
        subtotal: Number(o.subtotal),
        discount: Number(o.discount),
        couponCode: o.coupon_code,
        totalAmount: Number(o.total_amount),
        currency: o.currency || 'USD',
        paymentMethod: o.payment_method,
        paymentTransactionId: o.payment_transaction_id,
        status: o.status,
        providerId: o.provider_id,
        providerOrderId: o.provider_order_id,
        providerStatus: o.provider_status,
        providerMessage: o.provider_message,
        timeline: o.timeline || [],
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        testMode: o.test_mode
      }));
    }

    return true;
  } catch (err) {
    console.error('Error syncing from Supabase:', err);
    return false;
  }
}

export async function saveOrderToSupabase(order: any) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('orders').upsert({
      id: order.id,
      order_number: order.orderNumber,
      user_id: order.userId || null,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone || null,
      subtotal: order.subtotal,
      discount: order.discount,
      coupon_code: order.couponCode || null,
      total_amount: order.totalAmount,
      currency: order.currency,
      payment_method: order.paymentMethod,
      payment_transaction_id: order.paymentTransactionId || null,
      status: order.status,
      provider_id: order.providerId,
      provider_order_id: order.providerOrderId || null,
      provider_status: order.providerStatus || null,
      provider_message: order.providerMessage || null,
      timeline: order.timeline,
      test_mode: order.testMode,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to save order to Supabase:', err);
  }
}
