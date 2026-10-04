import { dbStore } from '../store';
import { Order, OrderStatus, OrderTimelineEvent } from '../types/database';
import { ProviderFactory } from '../providers/ProviderFactory';
import { saveOrderToSupabase } from '../lib/supabase';

export class OrderService {
  static createOrder(params: {
    userId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    productId: string;
    quantity: number;
    playerData: Record<string, string>;
    couponCode?: string;
    paymentMethod: string;
  }): Order {
    const product = dbStore.products.find(p => p.id === params.productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const game = dbStore.games.find(g => g.id === product.gameId);
    if (!game) {
      throw new Error('Juego no encontrado');
    }

    // Validate required player fields
    for (const field of game.playerFields) {
      if (field.required && !params.playerData[field.key]) {
        throw new Error(`El campo ${field.label} es obligatorio.`);
      }
    }

    // Calculate subtotal & price on SERVER SIDE (prevent price tampering)
    const unitPrice = product.price;
    const subtotal = Number((unitPrice * params.quantity).toFixed(2));
    let discount = 0;

    // Validate coupon if provided
    if (params.couponCode) {
      const coupon = dbStore.coupons.find(c => c.code.toUpperCase() === params.couponCode?.toUpperCase() && c.active);
      if (coupon) {
        if (!coupon.minPurchase || subtotal >= coupon.minPurchase) {
          if (coupon.discountType === 'percentage') {
            discount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          coupon.currentUsage += 1;
        }
      }
    }

    const totalAmount = Math.max(0, Number((subtotal - discount).toFixed(2)));
    const orderNumber = `NEX-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const initialTimeline: OrderTimelineEvent[] = [
      {
        status: 'PENDING_PAYMENT',
        title: 'Pedido Creado',
        description: 'Pedido registrado. Pendiente de recepción de pago.',
        timestamp: new Date().toISOString()
      }
    ];

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: params.userId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      items: [
        {
          productId: product.id,
          productName: product.name,
          gameId: game.id,
          gameName: game.name,
          quantity: params.quantity,
          unitPrice,
          totalPrice: subtotal,
          playerData: params.playerData
        }
      ],
      subtotal,
      discount,
      couponCode: params.couponCode,
      totalAmount,
      currency: dbStore.settings.currencyCode,
      paymentMethod: params.paymentMethod,
      status: 'PENDING_PAYMENT',
      providerId: dbStore.settings.activeProvider,
      timeline: initialTimeline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      testMode: dbStore.settings.testMode
    };

    dbStore.orders.unshift(newOrder);
    saveOrderToSupabase(newOrder);

    // If user has saved player ID, save for future
    if (params.userId) {
      const user = dbStore.users.find(u => u.id === params.userId);
      if (user) {
        user.savedPlayerIds = user.savedPlayerIds || {};
        const primaryKey = game.playerFields[0]?.key || 'user_id';
        if (params.playerData[primaryKey]) {
          user.savedPlayerIds[game.id] = params.playerData[primaryKey];
        }
      }
    }

    return newOrder;
  }

  static async processPaymentAndFulfill(orderId: string, transactionId?: string): Promise<Order> {
    const order = dbStore.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    // 1. Confirm Payment
    order.status = 'PAID';
    order.paymentTransactionId = transactionId || `PAY-${Date.now()}`;
    order.timeline.push({
      status: 'PAID',
      title: 'Pago Confirmado',
      description: `Pago procesado y verificado correctamente vía ${order.paymentMethod}.`,
      timestamp: new Date().toISOString()
    });
    order.updatedAt = new Date().toISOString();

    // 2. Dispatch to Provider
    order.status = 'PROCESSING';
    order.timeline.push({
      status: 'PROCESSING',
      title: 'Procesando Recarga',
      description: 'Conectando con los servidores del proveedor para enviar la recarga...',
      timestamp: new Date().toISOString()
    });

    const item = order.items[0];
    const product = dbStore.products.find(p => p.id === item.productId);
    const provider = ProviderFactory.getProvider();

    try {
      const providerResult = await provider.createOrder({
        orderId: order.id,
        providerProductId: product?.providerProductId || 'MOCK',
        playerData: item.playerData,
        quantity: item.quantity
      });

      order.providerOrderId = providerResult.providerOrderId;
      order.providerStatus = providerResult.status;
      order.providerMessage = providerResult.message;

      if (providerResult.status === 'COMPLETED') {
        order.status = 'COMPLETED';
        order.timeline.push({
          status: 'COMPLETED',
          title: 'Recarga Completada Exitosamente',
          description: providerResult.message || 'Los créditos fueron acreditados directamente a la cuenta del juego.',
          timestamp: new Date().toISOString()
        });
      } else if (providerResult.status === 'FAILED') {
        order.status = 'FAILED';
        order.timeline.push({
          status: 'FAILED',
          title: 'Error al Procesar Recarga',
          description: providerResult.message || 'No se pudo completar la recarga automáticamente. El equipo de soporte revisará el caso.',
          timestamp: new Date().toISOString()
        });
      } else {
        // Still processing asynchronously
        order.status = 'PROCESSING';
      }
    } catch (err: any) {
      order.status = 'FAILED';
      order.providerMessage = err.message || 'Error de conexión con el proveedor';
      order.timeline.push({
        status: 'FAILED',
        title: 'Error Inesperado',
        description: 'Ocurrió un inconveniente con el proveedor. Pedido retenido para revisión manual.',
        timestamp: new Date().toISOString()
      });
    }

    order.updatedAt = new Date().toISOString();
    saveOrderToSupabase(order);
    return order;
  }

  static async retryOrder(orderId: string): Promise<Order> {
    const order = dbStore.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Pedido no encontrado');

    order.status = 'PROCESSING';
    order.timeline.push({
      status: 'PROCESSING',
      title: 'Reintento de Recarga',
      description: 'Iniciando reintento manual de envío de recarga al proveedor...',
      timestamp: new Date().toISOString()
    });

    const item = order.items[0];
    const product = dbStore.products.find(p => p.id === item.productId);
    const provider = ProviderFactory.getProvider();

    try {
      // Force non-failing input in retry mock
      const cleanPlayerData = { ...item.playerData };
      Object.keys(cleanPlayerData).forEach(k => {
        cleanPlayerData[k] = cleanPlayerData[k].replace(/FAIL|ERROR|000000/gi, '9999');
      });

      const providerResult = await provider.createOrder({
        orderId: order.id,
        providerProductId: product?.providerProductId || 'MOCK',
        playerData: cleanPlayerData,
        quantity: item.quantity
      });

      order.providerOrderId = providerResult.providerOrderId;
      order.providerStatus = providerResult.status;
      order.providerMessage = providerResult.message;

      if (providerResult.status === 'COMPLETED' || providerResult.success) {
        order.status = 'COMPLETED';
        order.timeline.push({
          status: 'COMPLETED',
          title: 'Recarga Reintentada con Éxito',
          description: 'Recarga completada tras intervención del sistema.',
          timestamp: new Date().toISOString()
        });
      } else {
        order.status = 'FAILED';
        order.timeline.push({
          status: 'FAILED',
          title: 'Falló Reintento',
          description: providerResult.message || 'El proveedor volvió a rechazar la solicitud.',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      order.status = 'FAILED';
      order.providerMessage = err.message;
    }

    order.updatedAt = new Date().toISOString();
    saveOrderToSupabase(order);
    return order;
  }

  static updateOrderStatus(orderId: string, status: OrderStatus, message?: string): Order {
    const order = dbStore.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Pedido no encontrado');

    order.status = status;
    order.timeline.push({
      status,
      title: `Estado cambiado a ${status}`,
      description: message || `Actualizado manualmente por la administración.`,
      timestamp: new Date().toISOString()
    });
    order.updatedAt = new Date().toISOString();
    saveOrderToSupabase(order);
    return order;
  }
}
