import React from 'react';
import { Terminal, ArrowRight } from 'lucide-react';
import { ModelStatusResponse } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'playground' | 'features' | 'about';
  setActiveTab: (tab: 'home' | 'playground' | 'features' | 'about') => void;
  status: ModelStatusResponse | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  status,
}) => {
  const isReady = status?.status === 'ready';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#080b11]/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left text-slate-100 group whitespace-nowrap shrink-0 transition-opacity hover:opacity-90 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-violet-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-sans">
            CodeGen<span className="text-sky-400"> AI</span>
          </span>
        </button>

        {/* Zone 2: 4 Single-line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'home'
                ? 'text-sky-400 font-semibold border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('playground')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'playground'
                ? 'text-sky-400 font-semibold border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Playground
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'features'
                ? 'text-sky-400 font-semibold border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'about'
                ? 'text-sky-400 font-semibold border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            About
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Model:</span>
            <span className={isReady ? 'text-emerald-400' : 'text-slate-400'}>
              {isReady ? 'Qwen2.5 (Ready)' : 'Qwen2.5 (Offline/Demo)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('playground')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 shadow-md shadow-sky-500/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Start Coding</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
