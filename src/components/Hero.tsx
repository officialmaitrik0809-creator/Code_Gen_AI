import React, { useState } from 'react';
import { ArrowRight, Code, Sparkles, Layers, Zap, Check } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { EXAMPLE_PROMPTS } from '../data/examples';

interface HeroProps {
  onStartCoding: () => void;
  onExploreFeatures: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartCoding, onExploreFeatures }) => {
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);
  const currentExample = EXAMPLE_PROMPTS[selectedExampleIndex] || EXAMPLE_PROMPTS[0];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-18 lg:pb-28">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Top Content */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          {/* Natural kicker text */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono mb-4">
            <span className="text-sky-400">Qwen2.5-Coder-0.5B-Instruct</span>
            <span aria-hidden="true">·</span>
            <span>LoRA PEFT</span>
            <span aria-hidden="true">·</span>
            <span>CodeAlpaca_20k</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6 text-balance">
            Turn Your Ideas <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              Into Code.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
            Describe your programming task in plain English and receive instant, clean, syntax-highlighted code. Powered by our fine-tuned 0.5B language model for lightweight, fast developer workflows.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onStartCoding}
              className="flex items-center gap-2.5 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 shadow-xl shadow-sky-500/25 transition-all cursor-pointer"
            >
              <span>Start Coding</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExploreFeatures}
              className="px-6 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-[#0e1422] hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
            >
              Explore Features
            </button>
          </div>
        </div>

        {/* Code Editor Preview Window */}
        <div className="max-w-4xl mx-auto mb-20">
          {/* Example prompt switcher strip */}
          <div className="flex items-center justify-between gap-3 mb-3 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="font-medium text-slate-300">Live Model Prompt & Output Preview:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {EXAMPLE_PROMPTS.slice(0, 3).map((ex, idx) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setSelectedExampleIndex(idx)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    selectedExampleIndex === idx
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {ex.language}: {ex.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Prompt Bubble */}
          <div className="mb-3 p-3.5 rounded-lg bg-[#0e1422] border border-slate-800 text-xs">
            <span className="text-[11px] font-mono text-sky-400 block mb-1">
              Natural Language Prompt:
            </span>
            <p className="text-slate-200 font-mono text-[12px]">
              "{currentExample.prompt}"
            </p>
          </div>

          {/* Interactive Code Editor Preview */}
          <div className="h-[380px]">
            <CodeEditor
              code={currentExample.previewCode || ''}
              language={currentExample.language}
              filename={`preview_${currentExample.id}.${currentExample.language === 'Python' ? 'py' : currentExample.language === 'JavaScript' ? 'js' : 'java'}`}
              readOnly={true}
            />
          </div>
        </div>

        {/* 3 Core Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#0c101c] border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-4 text-sky-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">AI-Powered Code Generation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trained on 20,000 instruction-output pairs from CodeAlpaca. Translates specifications into working algorithmic routines with strict edge-case handling.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0c101c] border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-4 text-violet-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Multi-Language Synthesizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Native support for Python, JavaScript, Java, C++, and C. Generates idiomatic code tailored to each language's paradigms and type system.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0c101c] border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Developer Productivity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              One-click copying, instant file downloads, and fine-tuned 0.5B parameter efficiency that runs smoothly on standard CPUs and consumer GPUs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
