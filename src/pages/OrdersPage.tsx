import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OrderTimeline } from '../components/OrderTimeline';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchOrders = async (query = '') => {
    setLoading(true);
    try {
      const data = await api.getOrders({
        email: user?.email,
        search: query
      });
      setOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(searchQuery);
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchQuery);
  };

  const handleRetryOrder = async (orderId: string) => {
    setRetrying(true);
    try {
      const updated = await api.retryOrder(orderId);
      setSelectedOrder(updated);
      fetchOrders(searchQuery);
    } catch (err: any) {
      alert(err.message || 'Error al reintentar pedido');
    } finally {
      setRetrying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2.5 py-0.5 rounded text-[10px] font-bold">COMPLETADO</span>;
      case 'FAILED':
      case 'CANCELLED':
        return <span className="bg-rose-950 text-rose-400 border border-rose-800/60 px-2.5 py-0.5 rounded text-[10px] font-bold">FALLIDO</span>;
      case 'PROCESSING':
      case 'PAID':
        return <span className="bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin"/> PROCESANDO</span>;
      default:
        return <span className="bg-amber-950 text-amber-400 border border-amber-800/60 px-2.5 py-0.5 rounded text-[10px] font-bold">PENDIENTE</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white">Historial de Pedidos</h1>
          <p className="text-xs text-slate-400 mt-1">Consulta el estado en tiempo real de tus recargas o busca por número de pedido.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por # NEX-XXXXXX..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono w-full md:w-64"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Buscar</span>
          </button>
        </form>
      </div>

      {/* Orders Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Order List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Mis Pedidos Recientes</h3>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Cargando pedidos...</div>
          ) : orders.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No se encontraron pedidos</p>
              <p className="text-[11px] text-slate-500">Realiza tu primera recarga desde la tienda.</p>
            </div>
          ) : (
            orders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-white">{ord.orderNumber}</span>
                    {getStatusBadge(ord.status)}
                  </div>
                  <p className="text-xs font-bold text-slate-300">{ord.items[0]?.productName}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                    <span className="text-cyan-400 font-bold">${ord.totalAmount} USD</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Order Detail View */}
        <div className="md:col-span-2 space-y-6">
          {selectedOrder ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">Detalle del Pedido</span>
                  <h2 className="text-xl font-black text-white">{selectedOrder.orderNumber}</h2>
                  <p className="text-xs text-slate-400">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>

              {/* Player Data Summary */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-2">Producto y Pago</h4>
                  <p className="text-white font-bold">{selectedOrder.items[0]?.productName}</p>
                  <p className="text-slate-400">Monto: <span className="text-cyan-400 font-bold">${selectedOrder.totalAmount} USD</span></p>
                  <p className="text-slate-400">Método: <span className="text-slate-200 capitalize">{selectedOrder.paymentMethod}</span></p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-2">Datos del Jugador</h4>
                  {Object.entries(selectedOrder.items[0]?.playerData || {}).map(([k, v]) => (
                    <p key={k} className="text-slate-400">
                      <span className="capitalize">{k.replace('_', ' ')}</span>: <span className="text-emerald-400 font-mono font-bold">{v}</span>
                    </p>
                  ))}
                  {selectedOrder.providerOrderId && (
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Provider TX ID: {selectedOrder.providerOrderId}</p>
                  )}
                </div>
              </div>

              {/* Order Status Timeline */}
              <OrderTimeline timeline={selectedOrder.timeline} currentStatus={selectedOrder.status} />

              {/* Retry Failed Button */}
              {selectedOrder.status === 'FAILED' && (
                <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>La recarga no pudo completarse automáticamente.</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Puedes solicitar un reintento del pedido. Si el problema persiste, nuestro equipo de soporte atenderá tu número de pedido.
                  </p>
                  <button
                    onClick={() => handleRetryOrder(selectedOrder.id)}
                    disabled={retrying}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                    <span>Reintentar Enviar Recarga</span>
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
              Selecciona un pedido de la lista izquierda para ver su línea de tiempo y comprobante.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
