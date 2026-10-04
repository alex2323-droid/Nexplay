import { 
  Game, 
  Product, 
  Order, 
  User, 
  Coupon, 
  SupportTicket, 
  SupportMessage,
  StoreSettings,
  WebhookLog 
} from './types/database';

export class Store {
  games: Game[] = [];
  products: Product[] = [];
  orders: Order[] = [];
  users: User[] = [];
  coupons: Coupon[] = [];
  tickets: SupportTicket[] = [];
  ticketMessages: SupportMessage[] = [];
  webhookLogs: WebhookLog[] = [];
  settings: StoreSettings;

  constructor() {
    this.settings = {
      storeName: 'NEXPLAY',
      storeTagline: 'Tienda de Recargas Digitales de Videojuegos',
      logoUrl: '/src/assets/images/nexplay_logo_icon_1791138458973.jpg',
      faviconUrl: '/src/assets/images/nexplay_logo_icon_1791138458973.jpg',
      currencySymbol: '$',
      currencyCode: 'USD',
      timezone: 'America/Mexico_City',
      supportEmail: 'soporte@nexplay.gg',
      supportPhoneWhatsapp: '+52 55 9876 5432',
      discordUrl: 'https://discord.gg/nexplay',
      activeProvider: 'mock',
      testMode: true,
      providerApiUrl: 'https://api.rechargeprovider.com/v1',
      providerApiKeyConfigured: true,
      providerWebhookSecretConfigured: true,
      enabledPaymentMethods: ['stripe', 'paypal', 'card', 'apple_pay', 'google_pay', 'crypto', 'cash'],
      supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
    };

    this.seedInitialData();
  }

  private seedInitialData() {
    // Initial Games
    this.games = [
      {
        id: 'blood-strike',
        slug: 'blood-strike',
        name: 'Blood Strike',
        category: 'FPS / Battle Royale',
        publisher: 'NetEase Games',
        bannerUrl: '/src/assets/images/blood_strike_banner_1791138473355.jpg',
        iconUrl: '/src/assets/images/blood_strike_banner_1791138473355.jpg',
        description: 'Recarga Gold instantáneamente en Blood Strike. Compra skins de armas, pases de batalla y personajes exclusivos con la mayor velocidad.',
        badge: 'MÁS POPULAR',
        active: true,
        featured: true,
        sortOrder: 1,
        playerFields: [
          {
            key: 'user_id',
            label: 'User ID (ID de Usuario)',
            placeholder: 'Ej. 123456789',
            type: 'text',
            required: true,
            helpText: 'Encuentra tu User ID en el perfil del juego tocando tu avatar superior izquierdo.'
          },
          {
            key: 'nickname',
            label: 'Nombre de Usuario / Apodo (Opcional)',
            placeholder: 'Ej. ShadowSniper',
            type: 'text',
            required: false,
            helpText: 'Utilizado únicamente para verificar la recarga.'
          }
        ],
        faq: [
          {
            question: '¿Cuánto tarda en llegar el Gold de Blood Strike?',
            answer: 'Las recargas son procesadas de forma automática en 1 a 3 minutos directos a tu ID de usuario.'
          },
          {
            question: '¿Dónde encuentro mi User ID?',
            answer: 'Abre Blood Strike, toca tu foto de perfil en la esquina superior izquierda y verás tu ID numérico.'
          }
        ],
        importantInfo: '⚡ Asegúrate de ingresar correctamente tu User ID. Las recargas enviadas a IDs erróneos no se pueden revertir.'
      },
      {
        id: 'free-fire',
        slug: 'free-fire',
        name: 'Free Fire',
        category: 'Battle Royale',
        publisher: 'Garena',
        bannerUrl: '/src/assets/images/free_fire_banner_1791138487543.jpg',
        iconUrl: '/src/assets/images/free_fire_banner_1791138487543.jpg',
        description: 'Recarga Diamantes de Free Fire con recarga directa por ID. Obtén pases de nivel, ruleta mágica y emotes al mejor precio.',
        badge: 'OFERTA TOP',
        active: true,
        featured: true,
        sortOrder: 2,
        playerFields: [
          {
            key: 'player_id',
            label: 'Player ID (ID del Jugador)',
            placeholder: 'Ej. 876543210',
            type: 'text',
            required: true,
            helpText: 'Encuentra tu ID en tu perfil de Free Fire junto a tu nombre de usuario.'
          },
          {
            key: 'region',
            label: 'Región de la cuenta',
            placeholder: 'Selecciona tu región',
            type: 'select',
            options: ['EE.UU. / LATAM', 'Sudamérica (SAC)', 'Europa', 'Asia'],
            required: true,
            helpText: 'Selecciona la región correspondiente a tu cuenta.'
          }
        ],
        faq: [
          {
            question: '¿Necesito mi contraseña para recargar Free Fire?',
            answer: 'No. En NEXPLAY solo solicitamos tu ID de jugador. Nunca te pediremos contraseñas.'
          },
          {
            question: '¿Funciona para Free Fire MAX?',
            answer: 'Sí, los Diamantes recargados se vinculan a tu cuenta y son visibles en Free Fire y Free Fire MAX.'
          }
        ],
        importantInfo: '🔥 Ofertas acumulables con eventos oficiales de bonificación de Garena.'
      },
      {
        id: 'roblox',
        slug: 'roblox',
        name: 'Roblox',
        category: 'Sandbox / Multijugador',
        publisher: 'Roblox Corporation',
        bannerUrl: '/src/assets/images/roblox_banner_1791138499180.jpg',
        iconUrl: '/src/assets/images/roblox_banner_1791138499180.jpg',
        description: 'Consigue Robux al instante para personalizar tu avatar, adquirir pases de juego en Blox Fruits, Adopt Me y tus experiencias favoritas.',
        badge: 'ENTREGA RÁPIDA',
        active: true,
        featured: true,
        sortOrder: 3,
        playerFields: [
          {
            key: 'username',
            label: 'Nombre de Usuario de Roblox',
            placeholder: 'Ej. GamerPRO2026',
            type: 'text',
            required: true,
            helpText: 'Tu nombre exacto de usuario de Roblox sin espacios.'
          }
        ],
        faq: [
          {
            question: '¿Cómo recibo mis Robux?',
            answer: 'Recibirás el código digital o la transferencia automática directa a tu usuario según la opción seleccionada.'
          }
        ],
        importantInfo: '🎮 Garantía de entrega 100% segura aprobada por el sistema automático NEXPLAY.'
      },
      {
        id: 'pubg-mobile',
        slug: 'pubg-mobile',
        name: 'PUBG Mobile',
        category: 'Battle Royale',
        publisher: 'Tencent Games / Krafton',
        bannerUrl: '/src/assets/images/hero_gaming_store_1791138510752.jpg',
        iconUrl: '/src/assets/images/hero_gaming_store_1791138510752.jpg',
        description: 'Recarga UC (Unknown Cash) para PUBG Mobile de forma directa y segura.',
        badge: 'PRÓXIMAMENTE',
        active: true,
        featured: false,
        sortOrder: 4,
        playerFields: [
          { key: 'character_id', label: 'Character ID (ID del Personaje)', placeholder: 'Ej. 512345678', type: 'text', required: true }
        ],
        faq: [],
        importantInfo: ''
      },
      {
        id: 'mobile-legends',
        slug: 'mobile-legends',
        name: 'Mobile Legends: Bang Bang',
        category: 'MOBA',
        publisher: 'Moonton',
        bannerUrl: '/src/assets/images/hero_gaming_store_1791138510752.jpg',
        iconUrl: '/src/assets/images/hero_gaming_store_1791138510752.jpg',
        description: 'Recarga Diamantes para Mobile Legends con User ID + Zone ID.',
        badge: 'NUEVO',
        active: true,
        featured: false,
        sortOrder: 5,
        playerFields: [
          { key: 'user_id', label: 'User ID', placeholder: 'Ej. 12345678', type: 'text', required: true },
          { key: 'zone_id', label: 'Zone ID (4 dígitos)', placeholder: 'Ej. 1234', type: 'text', required: true }
        ],
        faq: [],
        importantInfo: ''
      },
      {
        id: 'call-of-duty-mobile',
        slug: 'call-of-duty-mobile',
        name: 'Call of Duty: Mobile',
        category: 'FPS',
        publisher: 'Activision',
        bannerUrl: '/src/assets/images/hero_gaming_store_1791138510752.jpg',
        iconUrl: '/src/assets/images/hero_gaming_store_1791138510752.jpg',
        description: 'Recarga CP (COD Points) para COD Mobile instantáneamente.',
        badge: 'DISPONIBLE',
        active: true,
        featured: false,
        sortOrder: 6,
        playerFields: [
          { key: 'player_id', label: 'Player ID / OpenID', placeholder: 'Ej. 678912345', type: 'text', required: true }
        ],
        faq: [],
        importantInfo: ''
      }
    ];

    // Initial Products
    this.products = [
      // Blood Strike
      {
        id: 'bs-100',
        gameId: 'blood-strike',
        name: '100 Gold',
        currencyAmount: 100,
        currencyName: 'Gold',
        originalPrice: 1.20,
        price: 0.99,
        costPrice: 0.80,
        providerProductId: 'BS100',
        isOffer: true,
        discountPercentage: 17,
        badge: 'OFERTA',
        active: true,
        popular: false
      },
      {
        id: 'bs-500',
        gameId: 'blood-strike',
        name: '500 Gold',
        currencyAmount: 500,
        currencyName: 'Gold',
        originalPrice: 5.50,
        price: 4.89,
        costPrice: 4.00,
        providerProductId: 'BS500',
        isOffer: true,
        discountPercentage: 11,
        badge: 'POPULAR',
        active: true,
        popular: true
      },
      {
        id: 'bs-1000',
        gameId: 'blood-strike',
        name: '1,000 Gold',
        currencyAmount: 1000,
        currencyName: 'Gold',
        originalPrice: 10.99,
        price: 9.49,
        costPrice: 8.00,
        providerProductId: 'BS1000',
        isOffer: true,
        discountPercentage: 14,
        badge: 'MEJOR VALOR',
        active: true,
        popular: true
      },
      {
        id: 'bs-2180',
        gameId: 'blood-strike',
        name: '2,180 Gold',
        currencyAmount: 2180,
        currencyName: 'Gold',
        originalPrice: 22.00,
        price: 19.99,
        costPrice: 17.00,
        providerProductId: 'BS2180',
        isOffer: false,
        active: true,
        popular: false
      },
      {
        id: 'bs-5000',
        gameId: 'blood-strike',
        name: '5,000 Gold',
        currencyAmount: 5000,
        currencyName: 'Gold',
        originalPrice: 49.99,
        price: 43.99,
        costPrice: 38.00,
        providerProductId: 'BS5000',
        isOffer: true,
        discountPercentage: 12,
        badge: 'PACK VIP',
        active: true,
        popular: false
      },

      // Free Fire
      {
        id: 'ff-100',
        gameId: 'free-fire',
        name: '100 Diamantes + 10 Bónus',
        currencyAmount: 110,
        currencyName: 'Diamantes',
        originalPrice: 1.30,
        price: 0.99,
        costPrice: 0.85,
        providerProductId: 'FF100',
        isOffer: true,
        discountPercentage: 24,
        badge: 'BÓNUS',
        active: true,
        popular: false
      },
      {
        id: 'ff-520',
        gameId: 'free-fire',
        name: '520 Diamantes + 52 Bónus',
        currencyAmount: 572,
        currencyName: 'Diamantes',
        originalPrice: 5.99,
        price: 4.79,
        costPrice: 4.10,
        providerProductId: 'FF520',
        isOffer: true,
        discountPercentage: 20,
        badge: 'MÁS VENDIDO',
        active: true,
        popular: true
      },
      {
        id: 'ff-1060',
        gameId: 'free-fire',
        name: '1,060 Diamantes + 106 Bónus',
        currencyAmount: 1166,
        currencyName: 'Diamantes',
        originalPrice: 11.50,
        price: 9.29,
        costPrice: 8.30,
        providerProductId: 'FF1060',
        isOffer: true,
        discountPercentage: 19,
        badge: 'OFERTA TOP',
        active: true,
        popular: true
      },
      {
        id: 'ff-2180',
        gameId: 'free-fire',
        name: '2,180 Diamantes + 218 Bónus',
        currencyAmount: 2398,
        currencyName: 'Diamantes',
        originalPrice: 22.99,
        price: 18.99,
        costPrice: 16.80,
        providerProductId: 'FF2180',
        isOffer: false,
        active: true,
        popular: false
      },

      // Roblox
      {
        id: 'rb-400',
        gameId: 'roblox',
        name: '400 Robux',
        currencyAmount: 400,
        currencyName: 'Robux',
        originalPrice: 5.99,
        price: 4.99,
        costPrice: 4.20,
        providerProductId: 'RB400',
        isOffer: false,
        active: true,
        popular: false
      },
      {
        id: 'rb-800',
        gameId: 'roblox',
        name: '800 Robux',
        currencyAmount: 800,
        currencyName: 'Robux',
        originalPrice: 10.99,
        price: 9.49,
        costPrice: 8.10,
        providerProductId: 'RB800',
        isOffer: true,
        discountPercentage: 14,
        badge: 'RECOMENDADO',
        active: true,
        popular: true
      },
      {
        id: 'rb-2000',
        gameId: 'roblox',
        name: '2,000 Robux',
        currencyAmount: 2000,
        currencyName: 'Robux',
        originalPrice: 24.99,
        price: 21.99,
        costPrice: 18.50,
        providerProductId: 'RB2000',
        isOffer: true,
        discountPercentage: 12,
        badge: 'SUPER AHORRO',
        active: true,
        popular: true
      }
    ];

    // Initial Admin User & Demo User
    this.users = [
      {
        id: 'user-admin-1',
        name: 'Administrador NEXPLAY',
        email: 'admin@nexplay.gg',
        role: 'ADMIN',
        phone: '+52 55 1234 5678',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-gamer-1',
        name: 'Carlos Gamer',
        email: 'carlos@gmail.com',
        role: 'USER',
        phone: '+52 55 9876 5432',
        createdAt: new Date().toISOString(),
        savedPlayerIds: {
          'blood-strike': '987654321',
          'free-fire': '876543210'
        }
      }
    ];

    // Initial Coupons
    this.coupons = [
      {
        id: 'cp-1',
        code: 'NEXPLAY10',
        discountType: 'percentage',
        discountValue: 10,
        minPurchase: 5,
        maxDiscount: 20,
        maxUsage: 1000,
        currentUsage: 42,
        maxUsagePerUser: 2,
        active: true
      },
      {
        id: 'cp-2',
        code: 'WELCOME5',
        discountType: 'fixed',
        discountValue: 2,
        minPurchase: 10,
        maxUsage: 500,
        currentUsage: 18,
        maxUsagePerUser: 1,
        active: true
      }
    ];

    // Initial Seed Orders
    this.orders = [
      {
        id: 'ord-1001',
        orderNumber: 'NEX-892101',
        userId: 'user-gamer-1',
        customerName: 'Carlos Gamer',
        customerEmail: 'carlos@gmail.com',
        customerPhone: '+52 55 9876 5432',
        items: [
          {
            productId: 'bs-1000',
            productName: '1,000 Gold',
            gameId: 'blood-strike',
            gameName: 'Blood Strike',
            quantity: 1,
            unitPrice: 9.49,
            totalPrice: 9.49,
            playerData: { user_id: '987654321', nickname: 'CarlosPro' }
          }
        ],
        subtotal: 9.49,
        discount: 0.95,
        couponCode: 'NEXPLAY10',
        totalAmount: 8.54,
        currency: 'USD',
        paymentMethod: 'card',
        paymentTransactionId: 'pi_3M2x98129381',
        status: 'COMPLETED',
        providerId: 'mock',
        providerOrderId: 'MOCK-TX-179110001',
        providerStatus: 'COMPLETED',
        providerMessage: 'Recarga enviada y confirmada exitosamente.',
        timeline: [
          { status: 'PENDING_PAYMENT', title: 'Pedido Creado', description: 'Pedido registrado en la plataforma NEXPLAY.', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { status: 'PAID', title: 'Pago Confirmado', description: 'Pago recibido exitosamente vía Tarjeta de Crédito.', timestamp: new Date(Date.now() - 3550000).toISOString() },
          { status: 'PROCESSING', title: 'Procesando Recarga', description: 'Pedido enviado al proveedor de servicio.', timestamp: new Date(Date.now() - 3500000).toISOString() },
          { status: 'COMPLETED', title: 'Recarga Completada', description: '1,000 Gold añadidos correctamente a la cuenta 987654321.', timestamp: new Date(Date.now() - 3400000).toISOString() }
        ],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3400000).toISOString(),
        testMode: true
      },
      {
        id: 'ord-1002',
        orderNumber: 'NEX-892102',
        userId: 'user-gamer-1',
        customerName: 'Carlos Gamer',
        customerEmail: 'carlos@gmail.com',
        customerPhone: '+52 55 9876 5432',
        items: [
          {
            productId: 'ff-520',
            productName: '520 Diamantes + 52 Bónus',
            gameId: 'free-fire',
            gameName: 'Free Fire',
            quantity: 1,
            unitPrice: 4.79,
            totalPrice: 4.79,
            playerData: { player_id: '876543210', region: 'EE.UU. / LATAM' }
          }
        ],
        subtotal: 4.79,
        discount: 0,
        totalAmount: 4.79,
        currency: 'USD',
        paymentMethod: 'paypal',
        paymentTransactionId: 'PP-PAYID-982139128',
        status: 'COMPLETED',
        providerId: 'mock',
        providerOrderId: 'MOCK-TX-179110002',
        providerStatus: 'COMPLETED',
        providerMessage: 'Entregado vía ID de Free Fire.',
        timeline: [
          { status: 'PENDING_PAYMENT', title: 'Pedido Creado', description: 'Pedido registrado en NEXPLAY.', timestamp: new Date(Date.now() - 1800000).toISOString() },
          { status: 'PAID', title: 'Pago Confirmado', description: 'Pago recibido con PayPal.', timestamp: new Date(Date.now() - 1780000).toISOString() },
          { status: 'PROCESSING', title: 'Procesando Recarga', description: 'Generando transferencia de diamantes.', timestamp: new Date(Date.now() - 1750000).toISOString() },
          { status: 'COMPLETED', title: 'Recarga Completada', description: '572 Diamantes recargados.', timestamp: new Date(Date.now() - 1700000).toISOString() }
        ],
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 1700000).toISOString(),
        testMode: true
      }
    ];

    // Initial Support Tickets
    this.tickets = [
      {
        id: 'tkt-1',
        ticketNumber: 'TKT-701',
        userId: 'user-gamer-1',
        customerName: 'Carlos Gamer',
        customerEmail: 'carlos@gmail.com',
        orderId: 'ord-1001',
        subject: 'Consulta sobre tiempo de llegada de Gold',
        category: 'Recargas y Pedidos',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 80000000).toISOString()
      }
    ];

    this.ticketMessages = [
      {
        id: 'msg-1',
        ticketId: 'tkt-1',
        senderId: 'user-gamer-1',
        senderName: 'Carlos Gamer',
        senderRole: 'USER',
        message: 'Hola! Hice la recarga de 1000 Gold para Blood Strike hace unos minutos, ¿dónde puedo verificar mi comprobante?',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'msg-2',
        ticketId: 'tkt-1',
        senderId: 'user-admin-1',
        senderName: 'Soporte NEXPLAY',
        senderRole: 'SUPPORT',
        message: 'Hola Carlos! Tu pedido NEX-892101 fue procesado correctamente y puedes ver la línea de tiempo completa y tu código de referencia en tu panel de pedidos.',
        createdAt: new Date(Date.now() - 80000000).toISOString()
      }
    ];
  }
}

export const dbStore = new Store();
