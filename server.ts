import express from 'express';
import { dbStore } from './backend/store';
import { OrderService } from './backend/services/orderService';
import { ProviderFactory } from './backend/providers/ProviderFactory';
import { askHermesAgent } from './backend/services/hermesAgent';
import { checkSupabaseConnection, syncFromSupabase, getSupabaseCredentials } from './backend/lib/supabase';

const app = express();
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ---------------------------------------------------------------------------
// PUBLIC STOREFRONT ENDPOINTS
// ---------------------------------------------------------------------------

// Get Store Settings (branding, logo, currency, test mode)
app.get('/api/settings', (req, res) => {
  res.json({
    ...dbStore.settings,
    providerApiKeyConfigured: Boolean(dbStore.settings.providerApiKeyConfigured),
  });
});

// Update Store Settings (Admin)
app.put('/api/settings', (req, res) => {
  const updates = req.body;
  dbStore.settings = { ...dbStore.settings, ...updates };
  res.json({ success: true, settings: dbStore.settings });
});

// Get All Active Games
app.get('/api/games', (req, res) => {
  const showAll = req.query.all === 'true';
  const gamesList = showAll 
    ? dbStore.games 
    : dbStore.games.filter(g => g.active).sort((a, b) => a.sortOrder - b.sortOrder);
  res.json(gamesList);
});

// Get Game by Slug or ID
app.get('/api/games/:identifier', (req, res) => {
  const { identifier } = req.params;
  const game = dbStore.games.find(g => g.slug === identifier || g.id === identifier);
  if (!game) {
    return res.status(404).json({ error: 'Juego no encontrado' });
  }

  const products = dbStore.products.filter(p => p.gameId === game.id && p.active);
  res.json({ game, products });
});

// Admin Create/Update Game
app.post('/api/games', (req, res) => {
  const gameData = req.body;
  const existingIndex = dbStore.games.findIndex(g => g.id === gameData.id);
  if (existingIndex >= 0) {
    dbStore.games[existingIndex] = { ...dbStore.games[existingIndex], ...gameData };
  } else {
    dbStore.games.push(gameData);
  }
  res.json({ success: true, game: gameData });
});

// Admin Delete Game
app.delete('/api/games/:id', (req, res) => {
  const { id } = req.params;
  dbStore.games = dbStore.games.filter(g => g.id !== id);
  dbStore.products = dbStore.products.filter(p => p.gameId !== id);
  res.json({ success: true });
});

// Get Products
app.get('/api/products', (req, res) => {
  const { gameId, offersOnly } = req.query;
  let list = dbStore.products;

  if (gameId) {
    list = list.filter(p => p.gameId === gameId);
  }
  if (offersOnly === 'true') {
    list = list.filter(p => p.isOffer);
  }

  res.json(list);
});

// Get Offer Products
app.get('/api/products/offers', (req, res) => {
  const offers = dbStore.products.filter(p => p.active && p.isOffer);
  res.json(offers);
});

// Admin Create/Update Product
app.post('/api/products', (req, res) => {
  const productData = req.body;
  const existingIndex = dbStore.products.findIndex(p => p.id === productData.id);
  if (existingIndex >= 0) {
    dbStore.products[existingIndex] = { ...dbStore.products[existingIndex], ...productData };
  } else {
    dbStore.products.push(productData);
  }
  res.json({ success: true, product: productData });
});

// Admin Delete Product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  dbStore.products = dbStore.products.filter(p => p.id !== id);
  res.json({ success: true });
});

// Validate Coupon
app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Código requerido' });

  const coupon = dbStore.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
  if (!coupon) {
    return res.status(404).json({ valid: false, error: 'Cupón no válido o expirado' });
  }

  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return res.status(400).json({ 
      valid: false, 
      error: `Monto mínimo de compra para este cupón es de $${coupon.minPurchase}` 
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  res.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    calculatedDiscount: discount
  });
});

// Admin Get/Create Coupons
app.get('/api/coupons', (req, res) => {
  res.json(dbStore.coupons);
});

app.post('/api/coupons', (req, res) => {
  const newCoupon = { id: `cp-${Date.now()}`, currentUsage: 0, active: true, ...req.body };
  dbStore.coupons.push(newCoupon);
  res.json({ success: true, coupon: newCoupon });
});

// Create Order (Checkout)
app.post('/api/checkout', (req, res) => {
  try {
    const order = OrderService.createOrder(req.body);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Error al procesar pedido' });
  }
});

// Pay / Confirm Order (Simulates payment gateway callback -> auto triggers provider)
app.post('/api/orders/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;
    const updatedOrder = await OrderService.processPaymentAndFulfill(id, transactionId);
    res.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Error al procesar pago' });
  }
});

// Get User Orders or Search
app.get('/api/orders', (req, res) => {
  const { email, userId, search } = req.query;
  let ordersList = dbStore.orders;

  if (userId) {
    ordersList = ordersList.filter(o => o.userId === userId);
  } else if (email) {
    ordersList = ordersList.filter(o => o.customerEmail.toLowerCase() === (email as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    ordersList = ordersList.filter(o => 
      o.orderNumber.toLowerCase().includes(q) || 
      o.customerEmail.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  }

  res.json(ordersList);
});

// Get Order Detail
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = dbStore.orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  res.json(order);
});

// Retry Failed Order (Admin or User)
app.post('/api/orders/:id/retry', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await OrderService.retryOrder(id);
    res.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Error al reintentar pedido' });
  }
});

// Update Order Status (Admin)
app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    const order = OrderService.updateOrderStatus(id, status, message);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AUTHENTICATION
// ---------------------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Correo electrónico requerido' });

  let user = dbStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // If logging in as admin keyword or new user
    const isAdmin = email.toLowerCase().includes('admin');
    user = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email: email.toLowerCase(),
      role: isAdmin ? 'ADMIN' : 'USER',
      createdAt: new Date().toISOString()
    };
    dbStore.users.push(user);
  }

  res.json({ success: true, user });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Nombre y correo son requeridos' });
  }

  const existing = dbStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.json({ success: true, user: existing });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    phone,
    role: 'USER' as const,
    createdAt: new Date().toISOString()
  };
  dbStore.users.push(newUser);
  res.json({ success: true, user: newUser });
});

app.get('/api/auth/me', (req, res) => {
  const email = req.headers['x-user-email'] as string;
  if (email) {
    const user = dbStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) return res.json(user);
  }
  res.status(401).json({ error: 'No autenticado' });
});

// ---------------------------------------------------------------------------
// WEBHOOKS
// ---------------------------------------------------------------------------

// Provider Webhook Endpoint
app.post('/api/webhooks/provider', async (req, res) => {
  const payload = req.body;
  const signature = req.headers['x-provider-signature'] as string;

  const logEntry = {
    id: `wh-${Date.now()}`,
    provider: dbStore.settings.activeProvider,
    event: payload.event || 'ORDER_STATUS_UPDATE',
    payload,
    processed: false,
    orderId: payload.orderId || payload.providerOrderId,
    error: undefined as string | undefined,
    createdAt: new Date().toISOString()
  };

  try {
    const provider = ProviderFactory.getProvider();
    const result = await provider.handleWebhook(payload, signature);

    if (result.orderId) {
      const order = dbStore.orders.find(o => o.id === result.orderId || o.providerOrderId === result.providerOrderId);
      if (order && result.status) {
        OrderService.updateOrderStatus(order.id, result.status, result.message);
      }
    }

    logEntry.processed = true;
    dbStore.webhookLogs.unshift(logEntry);
    res.json({ success: true, message: 'Webhook procesado' });
  } catch (err: any) {
    logEntry.error = err.message;
    dbStore.webhookLogs.unshift(logEntry);
    res.status(500).json({ error: err.message });
  }
});

// Payment Gateway Webhook
app.post('/api/webhooks/payment', async (req, res) => {
  const { orderId, transactionId, paymentStatus } = req.body;
  if (orderId && paymentStatus === 'SUCCESS') {
    try {
      await OrderService.processPaymentAndFulfill(orderId, transactionId);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
  res.json({ received: true });
});

// ---------------------------------------------------------------------------
// SUPPORT SYSTEM
// ---------------------------------------------------------------------------

app.get('/api/support/tickets', (req, res) => {
  const { email } = req.query;
  let list = dbStore.tickets;
  if (email) {
    list = list.filter(t => t.customerEmail.toLowerCase() === (email as string).toLowerCase());
  }
  res.json(list);
});

app.post('/api/support/tickets', (req, res) => {
  const { customerName, customerEmail, subject, category, priority, message, orderId } = req.body;
  const ticketId = `tkt-${Date.now()}`;
  const ticketNumber = `TKT-${Math.floor(100 + Math.random() * 900)}`;

  const newTicket = {
    id: ticketId,
    ticketNumber,
    customerName,
    customerEmail,
    orderId,
    subject,
    category,
    priority: priority || 'MEDIUM',
    status: 'OPEN' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const initialMsg = {
    id: `msg-${Date.now()}`,
    ticketId,
    senderId: customerEmail,
    senderName: customerName,
    senderRole: 'USER' as const,
    message,
    createdAt: new Date().toISOString()
  };

  dbStore.tickets.unshift(newTicket);
  dbStore.ticketMessages.push(initialMsg);

  res.json({ success: true, ticket: newTicket, message: initialMsg });
});

app.get('/api/support/tickets/:id/messages', (req, res) => {
  const { id } = req.params;
  const msgs = dbStore.ticketMessages.filter(m => m.ticketId === id);
  res.json(msgs);
});

app.post('/api/support/tickets/:id/messages', (req, res) => {
  const { id } = req.params;
  const { senderName, senderRole, message, senderId } = req.body;

  const newMsg = {
    id: `msg-${Date.now()}`,
    ticketId: id,
    senderId: senderId || 'user',
    senderName,
    senderRole: senderRole || 'USER',
    message,
    createdAt: new Date().toISOString()
  };

  dbStore.ticketMessages.push(newMsg);

  const ticket = dbStore.tickets.find(t => t.id === id);
  if (ticket) {
    ticket.updatedAt = new Date().toISOString();
    if (senderRole === 'SUPPORT' || senderRole === 'ADMIN') {
      ticket.status = 'IN_PROGRESS';
    }
  }

  res.json({ success: true, message: newMsg });
});

// ---------------------------------------------------------------------------
// ADMIN DASHBOARD
// ---------------------------------------------------------------------------

app.get('/api/admin/dashboard', (req, res) => {
  const totalOrders = dbStore.orders.length;
  const completedOrders = dbStore.orders.filter(o => o.status === 'COMPLETED');
  const pendingOrders = dbStore.orders.filter(o => o.status === 'PENDING_PAYMENT' || o.status === 'PROCESSING');
  const failedOrders = dbStore.orders.filter(o => o.status === 'FAILED');

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Calculate top games
  const gameSalesMap: Record<string, { count: number; revenue: number; name: string }> = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (!gameSalesMap[item.gameId]) {
        gameSalesMap[item.gameId] = { count: 0, revenue: 0, name: item.gameName };
      }
      gameSalesMap[item.gameId].count += item.quantity;
      gameSalesMap[item.gameId].revenue += item.totalPrice;
    });
  });

  const topGames = Object.values(gameSalesMap).sort((a, b) => b.revenue - a.revenue);

  res.json({
    metrics: {
      totalOrders,
      completedCount: completedOrders.length,
      pendingCount: pendingOrders.length,
      failedCount: failedOrders.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      activeProductsCount: dbStore.products.filter(p => p.active).length,
      activeGamesCount: dbStore.games.filter(g => g.active).length
    },
    recentOrders: dbStore.orders.slice(0, 10),
    topGames,
    webhookLogs: dbStore.webhookLogs.slice(0, 5)
  });
});

app.get('/api/admin/provider-balance', async (req, res) => {
  try {
    const provider = ProviderFactory.getProvider();
    const balanceInfo = await provider.getBalance();
    res.json(balanceInfo);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// SUPABASE INTEGRATION ENDPOINTS
// ---------------------------------------------------------------------------

app.get('/api/supabase/status', async (req, res) => {
  const creds = getSupabaseCredentials();
  const conn = await checkSupabaseConnection();
  res.json({
    configured: creds.isConfigured,
    url: creds.url,
    connected: conn.connected,
    message: conn.message
  });
});

app.post('/api/supabase/sync', async (req, res) => {
  const success = await syncFromSupabase();
  res.json({ success, message: success ? 'Sincronizado con Supabase' : 'Error al sincronizar con Supabase' });
});

// ---------------------------------------------------------------------------
// HERMES AGENT VIRTUAL ASSISTANT (GEMINI AI)
// ---------------------------------------------------------------------------

app.post('/api/ai/hermes', async (req, res) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

    const reply = await askHermesAgent(prompt, history || []);
    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error en Hermes Agent' });
  }
});

// ---------------------------------------------------------------------------
// VITE SPA INTEGRATION & SERVER LAUNCH
// ---------------------------------------------------------------------------

async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, async () => {
    console.log(`🚀 NEXPLAY Game Recharge Platform running on port ${PORT}`);
    const creds = getSupabaseCredentials();
    if (creds.isConfigured) {
      console.log('⚡ Conectando y sincronizando datos con Supabase...');
      await syncFromSupabase();
    }
  });
}

startServer();
