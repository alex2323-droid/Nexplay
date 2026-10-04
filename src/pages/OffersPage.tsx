import React, { useState, useEffect } from 'react';
import { Product, Game } from '../types';
import { api } from '../services/api';
import { Tag, Zap, Flame, Clock, ArrowRight } from 'lucide-react';

interface OffersPageProps {
  onSelectGame: (slug: string) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ onSelectGame }) => {
  const [offers, setOffers] = useState<Product[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Countdown timer simulation for daily deals
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        return { hours: Math.max(0, prev.hours - 1), minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersData, gamesData] = await Promise.all([
          api.getOffers(),
          api.getGames()
        ]);
        setOffers(offersData);
        setGames(gamesData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGameSlug = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    return game ? game.slug : gameId;
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-950 to-cyan-950 border border-amber-500/30 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/40">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>PROMO EXCLUSIVA NEXPLAY</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white">Ofertas y Descuentos Especiales</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Aprovecha los mejores precios con hasta un 25% de descuento adicional en paquetes de Gold, Diamantes y Robux.
        </p>

        {/* Countdown */}
        <div className="inline-flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-mono text-cyan-400">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Termina en:</span>
          <span className="font-bold text-white text-sm">
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {offers.map((prod) => {
          const slug = getGameSlug(prod.gameId);
          return (
            <div 
              key={prod.id}
              onClick={() => onSelectGame(slug)}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 space-y-4 transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                    {prod.gameId.replace('-', ' ')}
                  </span>
                  <h3 className="text-lg font-black text-white">{prod.name}</h3>
                </div>
                {prod.discountPercentage && (
                  <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-lg">
                    -{prod.discountPercentage}%
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 line-through block">
                    ${prod.originalPrice} USD
                  </span>
                  <span className="text-xl font-black text-cyan-400">
                    ${prod.price} USD
                  </span>
                </div>

                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1">
                  <span>Comprar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
