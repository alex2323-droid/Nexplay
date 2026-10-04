import {
  RechargeProvider,
  ProviderProduct,
  CreateOrderParams,
  CreateOrderResult,
  GetOrderStatusResult
} from './RechargeProvider';

export class MockProvider implements RechargeProvider {
  id = 'mock_provider';
  name = 'NEXPLAY Test Mode Provider (Mock)';

  private mockBalance = 25000.00;
  private orderDatabase: Map<string, GetOrderStatusResult> = new Map();

  async getProducts(): Promise<ProviderProduct[]> {
    return [
      { providerProductId: 'BS100', name: 'Blood Strike 100 Gold', costPrice: 0.85, inStock: true, minQuantity: 1 },
      { providerProductId: 'BS500', name: 'Blood Strike 500 Gold', costPrice: 4.10, inStock: true, minQuantity: 1 },
      { providerProductId: 'BS1000', name: 'Blood Strike 1,000 Gold', costPrice: 8.20, inStock: true, minQuantity: 1 },
      { providerProductId: 'BS2180', name: 'Blood Strike 2,180 Gold', costPrice: 17.50, inStock: true, minQuantity: 1 },
      { providerProductId: 'BS5000', name: 'Blood Strike 5,000 Gold', costPrice: 39.00, inStock: true, minQuantity: 1 },
      { providerProductId: 'FF100', name: 'Free Fire 100 Diamantes', costPrice: 0.90, inStock: true, minQuantity: 1 },
      { providerProductId: 'FF520', name: 'Free Fire 520 Diamantes', costPrice: 4.40, inStock: true, minQuantity: 1 },
      { providerProductId: 'FF1060', name: 'Free Fire 1,060 Diamantes', costPrice: 8.70, inStock: true, minQuantity: 1 },
      { providerProductId: 'RB800', name: 'Roblox 800 Robux', costPrice: 8.50, inStock: true, minQuantity: 1 },
      { providerProductId: 'RB2000', name: 'Roblox 2,000 Robux', costPrice: 18.00, inStock: true, minQuantity: 1 },
    ];
  }

  async getBalance(): Promise<{ balance: number; currency: string }> {
    return { balance: this.mockBalance, currency: 'USD' };
  }

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const providerOrderId = `MOCK-TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Simulate intentional failure test trigger
    const playerValues = Object.values(params.playerData || {}).join(' ').toUpperCase();
    if (playerValues.includes('FAIL') || playerValues.includes('ERROR') || playerValues.includes('000000')) {
      const result: GetOrderStatusResult = {
        providerOrderId,
        status: 'FAILED',
        message: 'Mock Provider Error: Player ID not found or region mismatch (Test mode trigger)'
      };
      this.orderDatabase.set(providerOrderId, result);
      return {
        success: false,
        providerOrderId,
        status: 'FAILED',
        message: result.message
      };
    }

    // Default successful mock creation
    const isInstant = !playerValues.includes('DELAY');
    const initialStatus = isInstant ? 'COMPLETED' : 'PROCESSING';

    const orderRecord: GetOrderStatusResult = {
      providerOrderId,
      status: initialStatus,
      message: isInstant 
        ? 'Recarga procesada exitosamente en la cuenta del jugador (Modo Prueba)'
        : 'Recarga enviada a los servidores del juego. En proceso...',
      pinOrVoucherCode: isInstant ? `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : undefined
    };

    this.orderDatabase.set(providerOrderId, orderRecord);
    this.mockBalance -= 10; // simulate cost deduction

    return {
      success: true,
      providerOrderId,
      status: initialStatus,
      message: orderRecord.message,
      rawResponse: { mock: true, timestamp: new Date().toISOString() }
    };
  }

  async getOrderStatus(providerOrderId: string): Promise<GetOrderStatusResult> {
    if (this.orderDatabase.has(providerOrderId)) {
      return this.orderDatabase.get(providerOrderId)!;
    }
    return {
      providerOrderId,
      status: 'COMPLETED',
      message: 'Recarga completada exitosamente (Mock Default)'
    };
  }

  async cancelOrder(providerOrderId: string): Promise<{ success: boolean; message?: string }> {
    if (this.orderDatabase.has(providerOrderId)) {
      const order = this.orderDatabase.get(providerOrderId)!;
      order.status = 'CANCELLED';
      order.message = 'Pedido cancelado manualmente por el administrador';
      this.orderDatabase.set(providerOrderId, order);
    }
    return { success: true, message: 'Pedido cancelado en el proveedor mock' };
  }

  async handleWebhook(payload: Record<string, any>): Promise<{
    orderId?: string;
    providerOrderId?: string;
    status?: 'COMPLETED' | 'FAILED' | 'CANCELLED';
    message?: string;
  }> {
    const { orderId, providerOrderId, status, message } = payload;
    return {
      orderId,
      providerOrderId,
      status: status || 'COMPLETED',
      message: message || 'Webhook recibido exitosamente'
    };
  }
}
