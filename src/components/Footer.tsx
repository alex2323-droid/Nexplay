import React from 'react';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { Zap, ShieldCheck, CreditCard, Headphones, MessageCircle, Send, Lock } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const { settings } = useStoreSettings();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 mt-16 text-slate-400">
      
      {/* Trust Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-900 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/40">
          <Zap className="w-8 h-8 text-cyan-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recargas Instantáneas</h4>
            <p className="text-[11px] text-slate-400">Procesamiento automático 24/7 en 1-3 min.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/40">
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Seguro por ID</h4>
            <p className="text-[11px] text-slate-400">Nunca solicitamos contraseñas de juegos.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/40">
          <CreditCard className="w-8 h-8 text-indigo-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Múltiples Métodos</h4>
            <p className="text-[11px] text-slate-400">Tarjetas, PayPal, Apple Pay, Cripto y Cash.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/40">
          <Headphones className="w-8 h-8 text-purple-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Soporte Gamer 24/7</h4>
            <p className="text-[11px] text-slate-400">Atención directa en WhatsApp y Discord.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">{settings.storeName}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Plataforma líder en recargas digitales de créditos y monedas para videojuegos. Rapidez, seguridad y precios garantizados.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <a 
              href={`https://wa.me/${settings.supportPhoneWhatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-emerald-950/60 border border-emerald-800/50 rounded-lg text-emerald-400 hover:bg-emerald-900/60 transition-colors"
              title="Atención por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a 
              href={settings.discordUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-indigo-950/60 border border-indigo-800/50 rounded-lg text-indigo-400 hover:bg-indigo-900/60 transition-colors"
              title="Servidor de Discord"
            >
              <Send className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Navigation */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Navegación</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => setActiveTab('home')} className="hover:text-cyan-400 transition-colors">Inicio</button></li>
            <li><button onClick={() => setActiveTab('games')} className="hover:text-cyan-400 transition-colors">Juegos Disponibles</button></li>
            <li><button onClick={() => setActiveTab('offers')} className="hover:text-cyan-400 transition-colors">Ofertas Destacadas</button></li>
            <li><button onClick={() => setActiveTab('orders')} className="hover:text-cyan-400 transition-colors">Estado de Pedidos</button></li>
            <li><button onClick={() => setActiveTab('affiliates')} className="hover:text-cyan-400 transition-colors">Programa de Afiliados</button></li>
          </ul>
        </div>

        {/* Featured Games */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Recargas Populares</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => setActiveTab('games')} className="hover:text-cyan-400 transition-colors">Blood Strike Gold</button></li>
            <li><button onClick={() => setActiveTab('games')} className="hover:text-cyan-400 transition-colors">Free Fire Diamantes</button></li>
            <li><button onClick={() => setActiveTab('games')} className="hover:text-cyan-400 transition-colors">Roblox Robux</button></li>
            <li><button onClick={() => setActiveTab('games')} className="hover:text-cyan-400 transition-colors">PUBG Mobile UC</button></li>
            <li><button onClick={() => setActiveTab('games')} className="hover:text-cyan-400 transition-colors">Mobile Legends Diamantes</button></li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Contacto & Soporte</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>Email: <span className="text-slate-200">{settings.supportEmail}</span></li>
            <li>WhatsApp: <span className="text-slate-200">{settings.supportPhoneWhatsapp}</span></li>
            <li>Horario: <span className="text-slate-200">24 horas / 7 días al año</span></li>
            <li className="pt-2">
              <button 
                onClick={() => setActiveTab('support')}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-cyan-400 font-semibold rounded-lg text-xs"
              >
                Abrir Ticket de Soporte
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Payment Security & Copyright */}
      <div className="bg-slate-950 py-6 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pagos protegidos con encriptación SSL de 256 bits.</span>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            © {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados. Marcas registradas pertenecientes a sus respectivos desarrolladores.
          </div>
        </div>
      </div>
    </footer>
  );
};
