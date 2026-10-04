export interface ProviderProduct {
  providerProductId: string;
  name: string;
  costPrice: number;
  inStock: boolean;
  minQuantity: number;
}

export interface CreateOrderParams {
  orderId: string;
  providerProductId: string;
  playerData: Record<string, string>;
  quantity: number;
}

export interface CreateOrderResult {
  success: boolean;
  providerOrderId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  message?: string;
  rawResponse?: any;
}

export interface GetOrderStatusResult {
  providerOrderId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  message?: string;
  pinOrVoucherCode?: string;
}

export interface RechargeProvider {
  id: string;
  name: string;
  getProducts(): Promise<ProviderProduct[]>;
  getBalance(): Promise<{ balance: number; currency: string }>;
  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>;
  getOrderStatus(providerOrderId: string): Promise<GetOrderStatusResult>;
  cancelOrder(providerOrderId: string): Promise<{ success: boolean; message?: string }>;
  handleWebhook(payload: Record<string, any>, signature?: string): Promise<{
    orderId?: string;
    providerOrderId?: string;
    status?: 'COMPLETED' | 'FAILED' | 'CANCELLED';
    message?: string;
  }>;
}
