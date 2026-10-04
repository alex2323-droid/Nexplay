import React, { useState } from 'react';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  Gamepad2, 
  Tag, 
  Clock, 
  HelpCircle, 
  User as UserIcon, 
  Bot, 
  Menu, 
  X, 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard,
  Search,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openHermesAI: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, openHermesAI }) => {
  const { settings } = useStoreSettings();
  const { user, isAdmin, logout, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    await login(loginEmail.trim());
    setLoginModalOpen(false);
    setLoginEmail('');
  };

  const navItems = [
    { id: 'home', label: 'Inicio', icon: Gamepad2 },
    { id: 'games', label: 'Juegos', icon: Zap },
    { id: 'offers', label: 'Ofertas', icon: Tag },
    { id: 'orders', label: 'Historial', icon: Clock },
    { id: 'support', label: 'Soporte', icon: HelpCircle },
  ];

  return (
    <>
      {/* Test Mode Banner */}
      {settings.testMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-1 px-4 text-center text-xs font-mono text-amber-300 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>MODO PRUEBA (TEST MODE) ACTIVADO · Las recargas y pagos se simulan en tiempo real con Mock Provider.</span>
        </div>
      )}

      {/* Main Header Container */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-lg p-1 transition-all"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-fuchsia-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                <img 
                  src={settings.logoUrl} 
                  alt={settings.storeName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to Icon
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <Zap className="w-5 h-5 text-cyan-400 font-bold" />
              </div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xl font-extrabold tracking-tight text-white font-sans flex items-center gap-1">
                {settings.storeName}
                <span className="text-cyan-400">.</span>
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    isActive 
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 font-bold' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Auth */}
          <div className="flex items-center gap-2">
            
            {/* Hermes AI Assistant Trigger */}
            <button
              onClick={openHermesAI}
              className="relative px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 hover:border-indigo-400 text-indigo-200 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
              title="Hablar con Hermes Agent"
            >
              <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">Hermes Agent</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </button>

            {/* Admin Dashboard Button */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'admin'
                    ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-md shadow-fuchsia-600/30'
                    : 'bg-fuchsia-950/40 text-fuchsia-300 border-fuchsia-800/50 hover:bg-fuchsia-900/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-fuchsia-400" />
                <span className="hidden sm:inline">Panel Admin</span>
              </button>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="relative group">
                <button 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 hover:border-slate-700 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[90px] truncate font-medium">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 hidden group-hover:block z-50">
                  <div className="px-3 py-2 border-b border-slate-800/80">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                      ROL: {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Mis Pedidos
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-xl shadow-md shadow-cyan-500/20 transition-all active:scale-95 whitespace-nowrap"
              >
                Iniciar Sesión
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 py-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 ${
                    activeTab === item.id ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold text-fuchsia-400 bg-fuchsia-950/40 border border-fuchsia-800/50 flex items-center gap-3"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel Administrativo</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Quick Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Ingresar a NEXPLAY</h3>
              <p className="text-xs text-slate-400 mt-1">Accede para guardar tu historial y tus User IDs frecuentes.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@gmail.com (usa 'admin@nexplay.gg' para admin)"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
              >
                Continuar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
