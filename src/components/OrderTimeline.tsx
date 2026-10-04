import React from 'react';
import { OrderTimelineEvent, OrderStatus } from '../types';
import { CheckCircle2, Clock, AlertTriangle, RefreshCw, XCircle, ShieldCheck } from 'lucide-react';

interface OrderTimelineProps {
  timeline: OrderTimelineEvent[];
  currentStatus: OrderStatus;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ timeline, currentStatus }) => {
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      case 'PROCESSING':
      case 'PAID':
        return <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-cyan-400" />
        Línea de Tiempo del Pedido
      </h4>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {timeline.map((event, idx) => {
          const isLatest = idx === timeline.length - 1;
          const isFailed = event.status === 'FAILED' || event.status === 'CANCELLED';

          return (
            <div key={idx} className="relative flex items-start gap-4">
              <div 
                className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center bg-slate-900 border-2 ${
                  isFailed
                    ? 'border-rose-500 text-rose-400'
                    : isLatest
                    ? 'border-cyan-400 text-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'border-emerald-500 text-emerald-400'
                }`}
              >
                {getStatusIcon(event.status)}
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h5 className="text-xs font-bold text-white">{event.title}</h5>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
