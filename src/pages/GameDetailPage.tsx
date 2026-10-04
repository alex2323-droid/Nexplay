import React, { useState, useEffect } from 'react';
import { Game, Product, Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { OrderTimeline } from '../components/OrderTimeline';
import { 
  Zap, 
  ShieldCheck, 
  User as UserIcon, 
  CreditCard, 
  Tag, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  HelpCircle, 
  ArrowLeft,
  Lock,
  Sparkles,
  Copy,
  Clock
} from 'lucide-react';

interface GameDetailPageProps {
  slug: string;
  onBack: () => void;
  onViewOrderHistory: () => void;
  openHermesAI: () => void;
}

export const GameDetailPage: React.FC<GameDetailPageProps> = ({ 
  slug, 
  onBack, 
  onViewOrderHistory,
  openHermesAI 
}) => {
  const { user } = useAuth();
  const { settings } = useStoreSettings();

  const [game, setGame] = useState<Game | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [playerData, setPlayerData] = useState<Record<string, string>>({});
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Checkout process state
  const [submitting, setSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        const data = await api.getGameByIdentifier(slug);
        setGame(data.game);
        setProducts(data.products);
        if (data.products.length > 0) {
          setSelectedProduct(data.products[0]);
        }

        // Pre-fill player fields if user has saved ones
        if (user && user.savedPlayerIds && user.savedPlayerIds[data.game.id]) {
          const primaryKey = data.game.playerFields[0]?.key || 'user_id';
          setPlayerData({ [primaryKey]: user.savedPlayerIds[data.game.id] });
        }
      } catch (e: any) {
        setOrderError(e.message || 'No se pudo cargar la información del juego');
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [slug, user]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedProduct) return;
    setCouponError('');
    try {
      const res = await api.validateCoupon(couponCode, selectedProduct.price);
      if (res.valid) {
        setCouponDiscount(res.calculatedDiscount);
        setCouponApplied(true);
      } else {
        setCouponError(res.error || 'Cupón no válido');
        setCouponDiscount(0);
        setCouponApplied(false);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Error al validar cupón');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !game) return;

    // Validate player required fields
    for (const field of game.playerFields) {
      if (field.required && !playerData[field.key]?.trim()) {
        alert(`Por favor ingresa el campo: ${field.label}`);
        return;
      }
    }

    if (!customerEmail.trim() || !customerName.trim()) {
      alert('Por favor ingresa tu nombre y correo electrónico.');
      return;
    }

    setSubmitting(true);
    setOrderError('');

    try {
      // 1. Create order on server
      const createdOrder = await api.createCheckout({
        userId: user?.id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        productId: selectedProduct.id,
        quantity: 1,
        playerData,
        couponCode: couponApplied ? couponCode : undefined,
        paymentMethod
      });

      setOrderCreated(createdOrder);

      // 2. Automatically simulate payment confirmation to trigger Provider Fulfillment!
      const paidOrder = await api.payOrder(createdOrder.id);
      setOrderCreated(paidOrder);

    } catch (err: any) {
      setOrderError(err.message || 'Ocurrió un error al procesar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Cargando catálogo de productos...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Juego no encontrado</h3>
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs">
          Volver al Inicio
        </button>
      </div>
    );
  }

  // Calculate final checkout amounts
  const subtotal = selectedProduct ? selectedProduct.price : 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al catálogo</span>
      </button>

      {/* GAME HEADER & BANNER */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950 p-6 sm:p-10 shadow-2xl">
        <img 
          src={game.bannerUrl} 
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
                {game.publisher}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                <Zap className="w-3 h-3" /> RECARGA INSTANTÁNEA
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">{game.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {game.description}
            </p>
          </div>

          <button
            onClick={openHermesAI}
            className="px-4 py-2 bg-indigo-950/80 border border-indigo-800/60 hover:border-indigo-500 text-indigo-200 text-xs font-bold rounded-xl flex items-center gap-2 shrink-0 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            ¿Dónde está mi ID?
          </button>
        </div>
      </div>

      {/* CHECKOUT / ORDER COMPLETED CONFIRMATION VIEW */}
      {orderCreated ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl animate-in fade-in duration-300">
          
          <div className="text-center space-y-3 pb-6 border-b border-slate-800">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white">¡Pedido Confirmado Exitosamente!</h2>
            <p className="text-xs text-slate-400">
              Número de Pedido: <span className="font-mono text-cyan-400 font-bold">{orderCreated.orderNumber}</span>
            </p>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800/80 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Resumen del Producto</h4>
              <p className="text-white font-bold text-sm">{orderCreated.items[0]?.productName}</p>
              <p className="text-slate-400">Juego: <span className="text-slate-200">{orderCreated.items[0]?.gameName}</span></p>
              <p className="text-slate-400">Precio Total: <span className="text-cyan-400 font-bold">${orderCreated.totalAmount} {orderCreated.currency}</span></p>
              <p className="text-slate-400">Método de Pago: <span className="text-slate-200 capitalize">{orderCreated.paymentMethod}</span></p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Datos del Jugador</h4>
              {Object.entries(orderCreated.items[0]?.playerData || {}).map(([key, val]) => (
                <p key={key} className="text-slate-400">
                  <span className="capitalize">{key.replace('_', ' ')}</span>: <span className="text-emerald-400 font-mono font-bold">{val}</span>
                </p>
              ))}
              <p className="text-slate-400">Cliente: <span className="text-slate-200">{orderCreated.customerName} ({orderCreated.customerEmail})</span></p>
            </div>
          </div>

          {/* Timeline */}
          <OrderTimeline timeline={orderCreated.timeline} currentStatus={orderCreated.status} />

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setOrderCreated(null);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
            >
              Hacer Otra Recarga
            </button>
            <button
              onClick={onViewOrderHistory}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              Ver Todos Mis Pedidos
            </button>
          </div>
        </div>
      ) : (

        /* MAIN RECHARGE FORM */
        <form onSubmit={handleCheckoutSubmit} className="space-y-8">
          
          {/* STEP 1: SELECT PRODUCT PACKAGE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">1</div>
              <h3 className="text-base font-bold text-white">Selecciona tu paquete de recarga</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {products.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-center flex flex-col justify-between space-y-2 ${
                      isSelected 
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]' 
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {prod.badge && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full shadow">
                        {prod.badge}
                      </span>
                    )}

                    <div className="pt-1">
                      <p className="text-sm font-extrabold text-white">{prod.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{prod.currencyAmount} {prod.currencyName}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60">
                      {prod.isOffer && (
                        <span className="text-[10px] text-slate-500 line-through block">
                          ${prod.originalPrice}
                        </span>
                      )}
                      <span className="text-base font-black text-cyan-400">
                        ${prod.price} <span className="text-[10px] text-slate-400">USD</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: PLAYER INFORMATION */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">2</div>
                <h3 className="text-base font-bold text-white">Ingresa los datos de tu cuenta de juego</h3>
              </div>
              <button 
                type="button"
                onClick={openHermesAI} 
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" /> ¿Dónde está mi ID?
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {game.playerFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    {field.label} {field.required && <span className="text-rose-400">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={playerData[field.key] || ''}
                      onChange={(e) => setPlayerData({ ...playerData, [field.key]: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Seleccionar --</option>
                      {field.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required={field.required}
                      placeholder={field.placeholder}
                      value={playerData[field.key] || ''}
                      onChange={(e) => setPlayerData({ ...playerData, [field.key]: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  )}

                  {field.helpText && (
                    <p className="text-[10px] text-slate-400">{field.helpText}</p>
                  )}
                </div>
              ))}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">Tu Nombre de Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Gamer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">Tu Correo Electrónico (para comprobante)</label>
                <input
                  type="email"
                  required
                  placeholder="carlos@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {game.importantInfo && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300">
                {game.importantInfo}
              </div>
            )}
          </div>

          {/* STEP 3: PAYMENT METHOD & COUPONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Payment Options */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">3</div>
                <h3 className="text-base font-bold text-white">Selecciona método de pago</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'card', name: 'Tarjeta Crédito/Débito', icon: CreditCard },
                  { id: 'paypal', name: 'PayPal', icon: Zap },
                  { id: 'apple_pay', name: 'Apple Pay / Google Pay', icon: Lock },
                  { id: 'crypto', name: 'Criptomonedas (USDT/BTC)', icon: ShieldCheck },
                  { id: 'cash', name: 'Efectivo / Transferencia', icon: Tag },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSel = paymentMethod === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSel 
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-cyan-400 shrink-0" />
                      <span className="text-xs font-bold">{pm.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ORDER SUMMARY & CHECKOUT BUTTON */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Resumen de Pago</h4>

              {/* Coupon Code Input */}
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">Cupón de Descuento</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. NEXPLAY10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 uppercase px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-400 rounded-xl"
                  >
                    Aplicar
                  </button>
                </div>
                {couponApplied && <p className="text-[10px] text-emerald-400">¡Cupón aplicado correctamente!</p>}
                {couponError && <p className="text-[10px] text-rose-400">{couponError}</p>}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 text-xs border-t border-b border-slate-800 py-3">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)} USD</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Descuento Cupón:</span>
                    <span>-${couponDiscount.toFixed(2)} USD</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-extrabold text-sm pt-1">
                  <span>Total a Pagar:</span>
                  <span className="text-cyan-400">${finalTotal.toFixed(2)} USD</span>
                </div>
              </div>

              {orderError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
                  {orderError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedProduct}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Procesando Recarga...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>PAGAR Y RECARGAR AHORA</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      )}

      {/* FAQ SECTION */}
      {game.faq.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            Preguntas Frecuentes sobre {game.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {game.faq.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                <h4 className="font-bold text-white">{item.question}</h4>
                <p className="text-slate-400 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
