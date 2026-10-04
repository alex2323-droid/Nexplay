import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { Users, DollarSign, MousePointerClick, Copy, Check, Share2, Award } from 'lucide-react';

export const AffiliatesPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useStoreSettings();
  const [copied, setCopied] = useState(false);

  const refCode = user ? user.name.toLowerCase().replace(/\s+/g, '') : 'gamerpro';
  const refLink = `${window.location.origin}/ref/${refCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-950 to-indigo-950 border border-purple-800/40 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold border border-purple-500/40">
          <Award className="w-4 h-4 text-purple-400" />
          <span>PROGRAMA DE AFILIADOS NEXPLAY</span>
        </div>

        <h1 className="text-3xl font-black text-white">Gana Comisiones Compartiendo Tu Enlace</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Comparte tu link con amigos, streamers y tu comunidad. Recibe hasta un 5% de comisión por cada recarga realizada.
        </p>

        {/* Ref Link Generator */}
        <div className="max-w-md mx-auto bg-slate-950 p-2 rounded-2xl border border-slate-800 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={refLink}
            className="bg-transparent px-3 text-xs text-cyan-400 font-mono flex-1 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Link'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5"><MousePointerClick className="w-4 h-4 text-cyan-400" /> Clics Registrados</span>
          <p className="text-2xl font-black text-white">128</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-400" /> Ventas Generadas</span>
          <p className="text-2xl font-black text-white">34</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-purple-400" /> Comisiones Ganadas</span>
          <p className="text-2xl font-black text-cyan-400">$42.50 USD</p>
        </div>
      </div>

    </div>
  );
};
