import React from 'react';
import { Game } from '../types';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onSelectGame: (slug: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelectGame }) => {
  return (
    <div 
      onClick={() => onSelectGame(game.slug)}
      className="group relative bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
    >
      {/* Banner / Poster Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img 
          src={game.bannerUrl} 
          alt={game.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%230f172a"/><text x="50%" y="50%" fill="%2306b6d4" font-family="sans-serif" font-size="20" text-anchor="middle">NEXPLAY GAME</text></svg>';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        {/* Badges */}
        {game.badge && (
          <div className="absolute top-3 right-3 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
            {game.badge}
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-widest block mb-0.5">
              {game.category}
            </span>
            <h3 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors drop-shadow">
              {game.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Card Content & CTAs */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {game.description}
        </p>

        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Zap className="w-3.5 h-3.5 fill-emerald-400/20" /> Recarga Instantánea
            </span>
            <span className="text-slate-400">ID Directo</span>
          </div>

          <button 
            className="w-full py-2.5 bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md"
          >
            <span>Recargar Ahora</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
