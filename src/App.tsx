import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HermesAgentDrawer } from './components/HermesAgentDrawer';

import { HomePage } from './pages/HomePage';
import { GameDetailPage } from './pages/GameDetailPage';
import { OffersPage } from './pages/OffersPage';
import { OrdersPage } from './pages/OrdersPage';
import { SupportPage } from './pages/SupportPage';
import { AffiliatesPage } from './pages/AffiliatesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedGameSlug, setSelectedGameSlug] = useState<string | null>(null);
  const [hermesOpen, setHermesOpen] = useState(false);

  const handleSelectGame = (slug: string) => {
    setSelectedGameSlug(slug);
    setActiveTab('game_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <StoreSettingsProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
          
          {/* Top Bar Header */}
          <Header 
            activeTab={activeTab} 
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'game_detail') setSelectedGameSlug(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            openHermesAI={() => setHermesOpen(true)}
          />

          {/* Main Body View Routing */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            {activeTab === 'home' && (
              <HomePage 
                onSelectGame={handleSelectGame}
                setActiveTab={setActiveTab}
                openHermesAI={() => setHermesOpen(true)}
              />
            )}

            {activeTab === 'games' && (
              <HomePage 
                onSelectGame={handleSelectGame}
                setActiveTab={setActiveTab}
                openHermesAI={() => setHermesOpen(true)}
              />
            )}

            {activeTab === 'game_detail' && selectedGameSlug && (
              <GameDetailPage 
                slug={selectedGameSlug}
                onBack={() => setActiveTab('home')}
                onViewOrderHistory={() => setActiveTab('orders')}
                openHermesAI={() => setHermesOpen(true)}
              />
            )}

            {activeTab === 'offers' && (
              <OffersPage onSelectGame={handleSelectGame} />
            )}

            {activeTab === 'orders' && (
              <OrdersPage />
            )}

            {activeTab === 'support' && (
              <SupportPage openHermesAI={() => setHermesOpen(true)} />
            )}

            {activeTab === 'affiliates' && (
              <AffiliatesPage />
            )}

            {activeTab === 'admin' && (
              <AdminDashboardPage />
            )}
          </main>

          {/* Footer */}
          <Footer 
            setActiveTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />

          {/* Hermes Agent AI Drawer */}
          <HermesAgentDrawer 
            isOpen={hermesOpen}
            onClose={() => setHermesOpen(false)}
            onSelectGame={handleSelectGame}
          />

        </div>
      </StoreSettingsProvider>
    </AuthProvider>
  );
}
