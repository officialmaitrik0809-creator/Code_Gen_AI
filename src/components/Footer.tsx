import React from 'react';
import { Terminal, Github, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'home' | 'playground' | 'features' | 'about') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#07090f] text-xs text-slate-500 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-sky-500 to-violet-600 flex items-center justify-center text-white">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-300">CodeGen AI</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Fine-Tuned Qwen2.5-Coder Engine</span>
        </div>

        <nav className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('playground')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Playground
          </button>
          <button
            type="button"
            onClick={() => onNavigate('features')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => onNavigate('about')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            About
          </button>
        </nav>

        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          <span>CodeAlpaca_20k</span>
          <span aria-hidden="true">·</span>
          <span>LoRA PEFT</span>
          <span aria-hidden="true">·</span>
          <span>FastAPI</span>
        </div>
      </div>
    </footer>
  );
};
