import React, { useState, useEffect } from 'react';
import { Game, Product } from '../types';
import { api } from '../services/api';
import { GameCard } from '../components/GameCard';
import { 
  Zap, 
  Gamepad2, 
  ShieldCheck, 
  Clock, 
  Flame, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';

interface HomePageProps {
  onSelectGame: (slug: string) => void;
  setActiveTab: (tab: string) => void;
  openHermesAI: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectGame, setActiveTab, openHermesAI }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Live recent recharge simulation feed
  const [recentFeed, setRecentFeed] = useState([
    { user: 'Juan_P***', game: 'Blood Strike', amount: '1,000 Gold', time: 'Hace 1 min' },
    { user: 'Gamer_99***', game: 'Free Fire', amount: '520 Diamantes', time: 'Hace 2 min' },
    { user: 'Rbx_Master***', game: 'Roblox', amount: '800 Robux', time: 'Hace 4 min' },
    { user: 'Sniper_XL***', game: 'Blood Strike', amount: '5,000 Gold', time: 'Hace 5 min' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, offersData] = await Promise.all([
          api.getGames(),
          api.getOffers()
        ]);
        setGames(gamesData);
        setOffers(offersData);
      } catch (e) {
        console.error('Error loading homepage data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredGames = games.filter(g => g.featured || g.id === 'blood-strike' || g.id === 'free-fire' || g.id === 'roblox');
  const expansionGames = games.filter(g => !g.featured && g.id !== 'blood-strike' && g.id !== 'free-fire' && g.id !== 'roblox');

  return (
    <div className="space-y-16 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-800/90 bg-slate-950 p-8 sm:p-12 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent z-10" />
        <img 
          src="/src/assets/images/hero_gaming_store_1791138510752.jpg" 
          alt="NEXPLAY Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-35 object-center"
          referrerPolicy="no-referrer"
        />

        {/* Hero Content */}
        <div className="relative z-20 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Plataforma Oficial de Recargas Automáticas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Recarga tus juegos favoritos <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">al instante</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Compra créditos y monedas para tus juegos favoritos de forma rápida, segura y automática. Entrega garantizada directamente a tu ID de jugador.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            <button
              onClick={() => onSelectGame('blood-strike')}
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Comprar Ahora
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('featured-games');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm rounded-xl border border-slate-700/80 transition-all flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              Ver Juegos
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center md:justify-start gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>+50,000 Recargas Entregadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Procesamiento 24/7</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Promo Card */}
        <div className="relative z-20 w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Recargas Tendencia</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">100% ONLINE</span>
          </div>

          <div className="space-y-3">
            <div 
              onClick={() => onSelectGame('blood-strike')}
              className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800">
                  <img src="/src/assets/images/blood_strike_banner_1791138473355.jpg" alt="BS" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Blood Strike</h4>
                  <span className="text-[10px] text-slate-400">1,000 Gold · $9.49</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded">RECARGAR</span>
            </div>

            <div 
              onClick={() => onSelectGame('free-fire')}
              className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800">
                  <img src="/src/assets/images/free_fire_banner_1791138487543.jpg" alt="FF" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Free Fire</h4>
                  <span className="text-[10px] text-slate-400">520 Diamantes · $4.79</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded">RECARGAR</span>
            </div>

            <div 
              onClick={() => onSelectGame('roblox')}
              className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800">
                  <img src="/src/assets/images/roblox_banner_1791138499180.jpg" alt="RBX" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Roblox</h4>
                  <span className="text-[10px] text-slate-400">800 Robux · $9.49</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded">RECARGAR</span>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE RECENT RECHARGES TICKER */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider shrink-0">
          <TrendingUp className="w-4 h-4" />
          <span>Recargas en Vivo:</span>
        </div>
        <div className="flex-1 overflow-hidden w-full">
          <div className="flex items-center gap-6 text-xs text-slate-300 animate-pulse">
            {recentFeed.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
                <span className="text-slate-400">{item.user}</span>
                <span className="text-white font-semibold">recargó {item.amount}</span>
                <span className="text-cyan-400">en {item.game}</span>
                <span className="text-[10px] text-slate-500">({item.time})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURED GAMES SECTION */}
      <section id="featured-games" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">Catálogo Oficial</span>
            <h2 className="text-2xl font-extrabold text-white">Juegos Destacados</h2>
          </div>
          <button 
            onClick={() => setActiveTab('games')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Ver todos los juegos <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredGames.map(game => (
            <GameCard key={game.id} game={game} onSelectGame={onSelectGame} />
          ))}
        </div>
      </section>

      {/* EXPANSION CATALOGUE PREVIEW */}
      <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Próximos Juegos y Catálogo Extendido</h3>
            <p className="text-xs text-slate-400">Proximamente con soporte instantáneo de entrega directa.</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">MÁS DE 10 JUEGOS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {['PUBG Mobile', 'Mobile Legends', 'Fortnite', 'Call of Duty Mobile', 'League of Legends', 'Valorant'].map((name, i) => (
            <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 text-center hover:border-slate-700 transition-colors">
              <Gamepad2 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-200">{name}</p>
              <span className="text-[9px] text-slate-500">Recarga por ID</span>
            </div>
          ))}
        </div>
      </section>

      {/* HERMES AI ASSISTANT PROMO BANNER */}
      <section className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border border-indigo-800/50 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Asistente Virtual Hermes-agent Integrado</span>
          </div>
          <h3 className="text-xl font-bold text-white">¿No encuentras tu ID o tienes dudas sobre la recarga?</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Hermes-agent está impulsado por la IA de Google Gemini para ayudarte en tiempo real a ubicar tu User ID en Blood Strike, Free Fire o Roblox, recomendar paquetes y revisar el estado de tu pedido.
          </p>
        </div>
        <button
          onClick={openHermesAI}
          className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          Preguntar a Hermes-agent
        </button>
      </section>

    </div>
  );
};
