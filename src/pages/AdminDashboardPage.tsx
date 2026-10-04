import React, { useState, useEffect } from 'react';
import { Game, Product, Order, Coupon, StoreSettings } from '../types';
import { api } from '../services/api';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Gamepad2, 
  Clock, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Tag,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Database,
  Sliders,
  Send
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { settings, updateSettings } = useStoreSettings();

  const [activeTab, setActiveTab] = useState<'metrics' | 'products' | 'games' | 'orders' | 'coupons' | 'testMode' | 'settings'>('metrics');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [providerBalance, setProviderBalance] = useState<{ balance: number; currency: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Editors
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  // Test Mode Simulator
  const [simulatedPlayerId, setSimulatedPlayerId] = useState('987654321');
  const [selectedSimProduct, setSelectedSimProduct] = useState<string>('');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, prodList, gamesList, ordersList, couponsList, balanceInfo] = await Promise.all([
        api.getAdminDashboard(),
        api.getProducts(),
        api.getGames(true),
        api.getOrders(),
        api.getCoupons(),
        api.getProviderBalance()
      ]);
      setDashboardData(dash);
      setProducts(prodList);
      setGames(gamesList);
      setOrders(ordersList);
      setCoupons(couponsList);
      setProviderBalance(balanceInfo);
      if (prodList.length > 0) setSelectedSimProduct(prodList[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Product Handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.gameId) return;

    try {
      const productToSave: Product = {
        id: editingProduct.id || `prod-${Date.now()}`,
        gameId: editingProduct.gameId,
        name: editingProduct.name,
        currencyAmount: Number(editingProduct.currencyAmount || 100),
        currencyName: editingProduct.currencyName || 'Créditos',
        originalPrice: Number(editingProduct.originalPrice || 1.00),
        price: Number(editingProduct.price || 0.99),
        costPrice: Number(editingProduct.costPrice || 0.80),
        providerProductId: editingProduct.providerProductId || 'MOCK_PROD',
        isOffer: Boolean(editingProduct.isOffer),
        discountPercentage: Number(editingProduct.discountPercentage || 0),
        badge: editingProduct.badge || '',
        active: editingProduct.active ?? true,
        popular: Boolean(editingProduct.popular)
      };

      await api.saveProduct(productToSave);
      setEditingProduct(null);
      loadData();
    } catch (err) {
      alert('Error al guardar producto');
    }
  };

  // Save Game Handler
  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame?.name || !editingGame?.slug) return;

    try {
      const gameToSave: Game = {
        id: editingGame.id || editingGame.slug,
        slug: editingGame.slug,
        name: editingGame.name,
        category: editingGame.category || 'Videojuegos',
        publisher: editingGame.publisher || 'NEXPLAY',
        bannerUrl: editingGame.bannerUrl || '/src/assets/images/hero_gaming_store_1791138510752.jpg',
        iconUrl: editingGame.iconUrl || '/src/assets/images/hero_gaming_store_1791138510752.jpg',
        description: editingGame.description || '',
        badge: editingGame.badge || '',
        active: editingGame.active ?? true,
        featured: Boolean(editingGame.featured),
        sortOrder: Number(editingGame.sortOrder || 1),
        playerFields: editingGame.playerFields || [
          { key: 'user_id', label: 'User ID', placeholder: 'Ingresa ID', type: 'text', required: true }
        ],
        faq: editingGame.faq || [],
        importantInfo: editingGame.importantInfo || ''
      };

      await api.saveGame(gameToSave);
      setEditingGame(null);
      loadData();
    } catch (err) {
      alert('Error al guardar juego');
    }
  };

  // Run Test Simulator Order
  const handleRunTestOrder = async () => {
    if (!selectedSimProduct) return;
    setSimulating(true);
    setSimResult(null);

    try {
      // Create test order
      const order = await api.createCheckout({
        customerName: 'Tester Admin',
        customerEmail: 'admin@nexplay.gg',
        productId: selectedSimProduct,
        quantity: 1,
        playerData: { user_id: simulatedPlayerId },
        paymentMethod: 'card'
      });

      // Pay & fulfill
      const paidOrder = await api.payOrder(order.id);
      setSimResult(paidOrder);
      loadData();
    } catch (err: any) {
      setSimResult({ error: err.message });
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Cargando Panel Administrativo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-2xl flex items-center justify-center text-fuchsia-400 font-bold">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Panel Administrativo</h1>
            <p className="text-xs text-slate-400">Gestión de Productos, Juegos, Pedidos, Proveedores y Configuración de Tienda.</p>
          </div>
        </div>

        {/* Provider Balance Card */}
        {providerBalance && (
          <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-mono block">Saldo Proveedor ({settings.activeProvider})</span>
              <span className="text-sm font-black text-emerald-400">${providerBalance.balance} {providerBalance.currency}</span>
            </div>
            <button onClick={loadData} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
        {[
          { id: 'metrics', label: 'Dashboard & Métricas', icon: TrendingUp },
          { id: 'products', label: 'Productos', icon: ShoppingBag },
          { id: 'games', label: 'Juegos', icon: Gamepad2 },
          { id: 'orders', label: 'Pedidos', icon: Clock },
          { id: 'coupons', label: 'Cupones', icon: Tag },
          { id: 'testMode', label: 'Consola Modo Prueba', icon: Database },
          { id: 'settings', label: 'Configuración', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400">Ingresos Totales</span>
              <p className="text-3xl font-black text-cyan-400">${dashboardData?.metrics?.totalRevenue || 0} USD</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400">Pedidos Completados</span>
              <p className="text-3xl font-black text-emerald-400">{dashboardData?.metrics?.completedCount || 0}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400">Pedidos Pendientes/Procesando</span>
              <p className="text-3xl font-black text-amber-400">{dashboardData?.metrics?.pendingCount || 0}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400">Pedidos Fallidos</span>
              <p className="text-3xl font-black text-rose-400">{dashboardData?.metrics?.failedCount || 0}</p>
            </div>
          </div>

          {/* Top Selling Games */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Juegos Más Vendidos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {dashboardData?.topGames?.map((tg: any, i: number) => (
                <div key={i} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{tg.name}</h4>
                    <span className="text-[10px] text-slate-500">{tg.count} unidades recargadas</span>
                  </div>
                  <span className="text-xs font-black text-cyan-400">${tg.revenue.toFixed(2)} USD</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Catálogo de Productos ({products.length})</h3>
            <button
              onClick={() => setEditingProduct({ active: true, isOffer: false, price: 1.00, costPrice: 0.80 })}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Juego</th>
                    <th className="p-3.5">Nombre Producto</th>
                    <th className="p-3.5">Provider Product ID</th>
                    <th className="p-3.5">Costo / Venta</th>
                    <th className="p-3.5">Margen</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map(p => {
                    const margin = Number((p.price - p.costPrice).toFixed(2));
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-bold text-cyan-400 uppercase">{p.gameId}</td>
                        <td className="p-3.5 font-bold text-white">{p.name}</td>
                        <td className="p-3.5 font-mono text-slate-400">{p.providerProductId}</td>
                        <td className="p-3.5">${p.costPrice} / <span className="font-bold text-white">${p.price}</span></td>
                        <td className="p-3.5 font-bold text-emerald-400">+${margin}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.active ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                            {p.active ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button onClick={() => setEditingProduct(p)} className="p-1.5 bg-slate-800 text-cyan-400 rounded-lg hover:bg-slate-700">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => api.deleteProduct(p.id).then(loadData)} className="p-1.5 bg-slate-800 text-rose-400 rounded-lg hover:bg-slate-700">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GAMES MANAGEMENT */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Gestión de Juegos ({games.length})</h3>
            <button
              onClick={() => setEditingGame({ active: true, featured: false, sortOrder: games.length + 1 })}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Juego</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {games.map(g => (
              <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="h-28 rounded-xl overflow-hidden relative">
                  <img src={g.bannerUrl} alt={g.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xs font-bold text-white">{g.name}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{g.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-[10px] text-cyan-400 font-mono">{g.publisher}</span>
                  <div className="space-x-2">
                    <button onClick={() => setEditingGame(g)} className="p-1.5 bg-slate-800 text-cyan-400 rounded-lg">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => api.deleteGame(g.id).then(loadData)} className="p-1.5 bg-slate-800 text-rose-400 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white">Gestión de Todos los Pedidos ({orders.length})</h3>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5"># Pedido</th>
                    <th className="p-3.5">Cliente / Email</th>
                    <th className="p-3.5">Producto</th>
                    <th className="p-3.5">Monto</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono font-bold text-cyan-400">{o.orderNumber}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{o.customerName}</div>
                        <div className="text-[10px] text-slate-400">{o.customerEmail}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-200">{o.items[0]?.productName}</td>
                      <td className="p-3.5 font-bold text-emerald-400">${o.totalAmount}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-cyan-400">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[10px]">{new Date(o.createdAt).toLocaleString()}</td>
                      <td className="p-3.5 text-right">
                        {o.status === 'FAILED' && (
                          <button
                            onClick={() => api.retryOrder(o.id).then(loadData)}
                            className="px-2.5 py-1 bg-rose-950 border border-rose-800 text-rose-300 font-bold rounded-lg text-[10px]"
                          >
                            Reintentar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TEST MODE SIMULATOR */}
      {activeTab === 'testMode' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              Consola de Simulación de Pedidos (Test Mode Provider)
            </h3>
            <p className="text-xs text-slate-400">
              Prueba la recarga automática instantánea, simula errores usando IDs como "FAIL" o "ERROR", y verifica los webhooks en vivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs">
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">Simular Nueva Recarga</h4>
              <div>
                <label className="block text-slate-400 mb-1">Producto a Probar</label>
                <select
                  value={selectedSimProduct}
                  onChange={(e) => setSelectedSimProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.gameId.toUpperCase()} - {p.name} (${p.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ID de Jugador Simulado (Usa 'FAIL' para probar error)</label>
                <input
                  type="text"
                  value={simulatedPlayerId}
                  onChange={(e) => setSimulatedPlayerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <button
                onClick={handleRunTestOrder}
                disabled={simulating}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Ejecutar Prueba de Recarga</span>
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Resultado de Ejecución</h4>
              {simResult ? (
                <pre className="bg-slate-900 p-4 rounded-xl text-[10px] text-cyan-300 font-mono overflow-x-auto max-h-60 border border-slate-800">
                  {JSON.stringify(simResult, null, 2)}
                </pre>
              ) : (
                <div className="p-8 text-center text-slate-600 text-xs border border-dashed border-slate-800 rounded-xl">
                  Haz clic en 'Ejecutar Prueba' para ver la respuesta del Mock Provider.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Configuración General de la Tienda</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre de la Tienda</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => updateSettings({ storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  value={settings.storeTagline}
                  onChange={(e) => updateSettings({ storeTagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email de Soporte</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => updateSettings({ supportEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">WhatsApp de Soporte</label>
                <input
                  type="text"
                  value={settings.supportPhoneWhatsapp}
                  onChange={(e) => updateSettings({ supportPhoneWhatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Modo Prueba (Test Mode)</h4>
                <p className="text-xs text-slate-400">Si está activo, se utiliza Mock Provider para simular entregas de recarga.</p>
              </div>
              <button
                onClick={() => updateSettings({ testMode: !settings.testMode })}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${settings.testMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
              >
                {settings.testMode ? 'MODO PRUEBA ACTIVADO' : 'MODO PRODUCCIÓN'}
              </button>
            </div>
          </div>

          {/* SUPABASE INTEGRATION CARD */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Integración Supabase PostgreSQL</h3>
                  <p className="text-xs text-slate-400">Sincronización en tiempo real con tu proyecto Supabase.</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const status = await api.getSupabaseStatus();
                  alert(`Estado de Supabase: ${status.message}`);
                }}
                className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/40 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Probar Conexión Supabase</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-slate-300 font-medium mb-1">SUPABASE URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={settings.supabaseUrl || ''}
                  onChange={(e) => updateSettings({ supabaseUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">SUPABASE ANON / SERVICE ROLE KEY</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                  value={settings.supabaseAnonKey || ''}
                  onChange={(e) => updateSettings({ supabaseAnonKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-emerald-400 uppercase text-[11px]">Instrucciones de Despliegue de Esquema en Supabase</h4>
              <p className="text-slate-400">
                El archivo SQL completo con las tablas <code className="text-cyan-300">games</code>, <code className="text-cyan-300">products</code>, <code className="text-cyan-300">orders</code>, <code className="text-cyan-300">users</code>, <code className="text-cyan-300">coupons</code> y <code className="text-cyan-300">support_tickets</code> está disponible en tu proyecto en la ruta:
              </p>
              <code className="block bg-slate-900 p-2 rounded text-cyan-300 font-mono text-[11px]">
                /database/supabase_schema.sql
              </code>
              <p className="text-slate-400">
                Copia y pega este script en el <strong>SQL Editor</strong> de tu proyecto Supabase para inicializar las tablas automáticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-xs">
            <h3 className="text-base font-bold text-white">{editingProduct.id ? 'Editar Producto' : 'Crear Producto'}</h3>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Juego Pertenece</label>
                <select
                  value={editingProduct.gameId || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, gameId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="">-- Seleccionar --</option>
                  {games.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 1,000 Gold"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Precio Costo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.costPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Provider Product ID (ID del Proveedor)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. BS1000"
                  value={editingProduct.providerProductId || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, providerProductId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GAME MODAL */}
      {editingGame && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-xs">
            <h3 className="text-base font-bold text-white">{editingGame.id ? 'Editar Juego' : 'Agregar Juego'}</h3>

            <form onSubmit={handleSaveGame} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Nombre del Juego</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Valorant"
                  value={editingGame.name || ''}
                  onChange={(e) => setEditingGame({ ...editingGame, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Slug URL</label>
                <input
                  type="text"
                  required
                  value={editingGame.slug || ''}
                  onChange={(e) => setEditingGame({ ...editingGame, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Categoría</label>
                <input
                  type="text"
                  value={editingGame.category || ''}
                  onChange={(e) => setEditingGame({ ...editingGame, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={editingGame.description || ''}
                  onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGame(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl"
                >
                  Guardar Juego
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
