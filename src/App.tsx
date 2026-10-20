import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Playground } from './components/Playground';
import { Features } from './components/Features';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { ModelStatusCard } from './components/ModelStatusCard';
import { ModelStatusResponse } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'playground' | 'features' | 'about'>('home');
  const [status, setStatus] = useState<ModelStatusResponse | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);
  const [isDemoActive, setIsDemoActive] = useState(false);

  const checkHealth = useCallback(async () => {
    setIsHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        setStatus({
          status: 'unavailable',
          backend: 'error',
          message: `Health check returned HTTP ${res.status}`,
        });
      }
    } catch (err: any) {
      setStatus({
        status: 'unavailable',
        backend: 'offline',
        message: 'Could not connect to API Gateway. Local backend offline.',
      });
    } finally {
      setIsHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleStartCoding = () => {
    setActiveTab('playground');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreFeatures = () => {
    setActiveTab('features');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* 3-Zone Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        status={status}
      />

      {/* Main Viewport Content */}
      <main className="flex-1">
        {/* Model Status Section (Prominent across all views) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <ModelStatusCard
            status={status}
            isLoading={isHealthLoading}
            onRefresh={checkHealth}
            onSelectDemoMode={() => {
              setIsDemoActive(true);
              setActiveTab('playground');
            }}
            isDemoActive={isDemoActive}
          />
        </div>

        {activeTab === 'home' && (
          <>
            <Hero
              onStartCoding={handleStartCoding}
              onExploreFeatures={handleExploreFeatures}
            />
            <div className="border-t border-slate-800/80">
              <Features onStartCoding={handleStartCoding} />
            </div>
          </>
        )}

        {activeTab === 'playground' && (
          <Playground
            status={status}
            onRefreshHealth={checkHealth}
          />
        )}

        {activeTab === 'features' && (
          <Features onStartCoding={handleStartCoding} />
        )}

        {activeTab === 'about' && (
          <About
            status={status}
            onRefreshHealth={checkHealth}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
