import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Trash2,
  AlertCircle,
  Sparkles,
  Sliders,
  Server,
  Zap,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { SupportedLanguage, GenerateResult, ModelStatusResponse } from '../types';
import { EXAMPLE_PROMPTS } from '../data/examples';
import { CodeEditor } from './CodeEditor';

interface PlaygroundProps {
  status: ModelStatusResponse | null;
  onRefreshHealth: () => void;
}

export const Playground: React.FC<PlaygroundProps> = ({ status, onRefreshHealth }) => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('Python');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorSolution, setErrorSolution] = useState<string | null>(null);

  // Generation options
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [showSettings, setShowSettings] = useState(false);
  const [executionMode, setExecutionMode] = useState<'fastapi' | 'demo'>('fastapi');

  const languages: SupportedLanguage[] = ['Python', 'JavaScript', 'Java', 'C++', 'C'];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Please describe what you want to build before generating.');
      setErrorSolution(null);
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setErrorSolution(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          language,
          mode: executionMode,
          temperature,
          maxTokens,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || data.error || 'Failed to generate code.');
        setErrorSolution(data.solution || null);
        return;
      }

      setResult({
        code: data.code,
        language: data.language || language,
        engine: data.engine,
        model: data.model,
        durationMs: data.durationMs || 0,
        isDemo: data.isDemo,
      });
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Network error occurred while connecting to the code generation gateway.'
      );
      setErrorSolution(
        'Check that the local FastAPI backend is running and LORA_MODEL_DIR points to your trained adapter.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setErrorMessage(null);
    setErrorSolution(null);
  };

  const handleSelectExample = (ex: typeof EXAMPLE_PROMPTS[0]) => {
    setPrompt(ex.prompt);
    setLanguage(ex.language);
    setErrorMessage(null);
    setErrorSolution(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  };

  const isFastApiReady = status?.status === 'ready';

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Workspace Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>AI Code Playground</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-950/70 text-sky-400 border border-sky-800/60">
              Interactive Workspace
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prompt the fine-tuned Qwen2.5-Coder model with requirements, algorithms, or utility requests.
          </p>
        </div>

        {/* Engine Switcher & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-lg bg-[#0e1422] border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setExecutionMode('fastapi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                executionMode === 'fastapi'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>FastAPI (Local)</span>
              {isFastApiReady ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block ml-0.5" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setExecutionMode('demo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                executionMode === 'demo'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Engine</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              showSettings
                ? 'bg-slate-800 border-sky-500/50 text-sky-400'
                : 'bg-[#0e1422] border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Inference Hyperparameters"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Settings Drawer */}
      {showSettings && (
        <div className="mb-6 p-4 rounded-xl bg-[#0d1220] border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="font-medium">Sampling Temperature</span>
              <span className="font-mono text-sky-400">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <span className="text-[11px] text-slate-500">
              Lower values (0.1 - 0.3) provide more deterministic and syntactically strict code.
            </span>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="font-medium">Max Output Tokens</span>
              <span className="font-mono text-sky-400">{maxTokens}</span>
            </div>
            <input
              type="range"
              min="128"
              max="2048"
              step="128"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <span className="text-[11px] text-slate-500">
              Maximum token length generated by Qwen2.5-Coder.
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <span className="font-medium text-slate-300 mb-1">Active Backend Target</span>
            <p className="font-mono text-slate-400 text-[11px]">
              {executionMode === 'fastapi'
                ? isFastApiReady
                  ? 'FastAPI (http://127.0.0.1:8000) · Connected'
                  : 'FastAPI (http://127.0.0.1:8000) · Offline'
                : 'Cloud Demo Bridge (Gemini Flash as Qwen emulator)'}
            </p>
          </div>
        </div>
      )}

      {/* Main Two-Panel Playground Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Input & Controls (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-[#0c101c] shadow-xl flex flex-col">
            {/* Header of Input */}
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="prompt-input" className="text-xs font-semibold text-slate-200">
                Describe what you want to build
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Ctrl + Enter to run
              </span>
            </div>

            {/* Prompt Textarea */}
            <textarea
              id="prompt-input"
              rows={8}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Write a Python function to check whether a number is prime."
              className="w-full p-3.5 rounded-lg bg-[#080b12] border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm text-slate-100 placeholder-slate-600 font-mono resize-none transition-colors outline-none leading-relaxed"
            />

            {/* Language Selector */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Programming Language
              </label>
              <div className="grid grid-cols-5 gap-1.5 p-1 rounded-lg bg-[#080b12] border border-slate-800/80">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
                      language === lang
                        ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Generate & Clear */}
            <div className="flex items-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Generate Code</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={isGenerating || !prompt}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-[#0e1422] hover:bg-slate-800 border border-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
                title="Clear Prompt"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* Example Prompts Pill Box */}
          <div className="p-4 rounded-xl border border-slate-800 bg-[#0c101c] shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Example Prompts</span>
            </div>

            <div className="flex flex-col gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleSelectExample(ex)}
                  className="w-full text-left p-2.5 rounded-lg bg-[#080b12] hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-200 group-hover:text-sky-300">
                      {ex.title}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {ex.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {ex.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Output Code Editor (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/60 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-rose-200">Code Generation Error</h4>
                  <p className="text-rose-300/90 mt-0.5 leading-relaxed">{errorMessage}</p>

                  {errorSolution && (
                    <div className="mt-2 pt-2 border-t border-rose-900/40 text-[11px] text-rose-300/80">
                      <span className="font-medium text-rose-200">Tip:</span> {errorSolution}
                    </div>
                  )}

                  {executionMode === 'fastapi' && !isFastApiReady && (
                    <button
                      type="button"
                      onClick={() => {
                        setExecutionMode('demo');
                        setErrorMessage(null);
                      }}
                      className="mt-3 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors cursor-pointer"
                    >
                      Switch to Demo Mode & Try Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Model Status Bar above Editor */}
          {result && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#0e1422] border border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium text-slate-200">{result.model}</span>
                {result.isDemo && (
                  <span className="text-[10px] text-amber-400 px-1.5 py-0.2 rounded bg-amber-950/40 border border-amber-900/50">
                    Demo Bridge
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>Time: {result.durationMs}ms</span>
                <span>·</span>
                <span>Language: {result.language}</span>
              </div>
            </div>
          )}

          {/* Code Editor Panel */}
          <div className="h-[560px]">
            <CodeEditor
              code={result?.code || ''}
              language={result?.language || language}
              isLoading={isGenerating}
              emptyMessage="Ready to generate code. Describe a function, class, or algorithm on the left."
              headerRight={
                result && (
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 transition-colors disabled:opacity-40 cursor-pointer"
                    title="Regenerate code with current prompt"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span className="text-[11px]">Regenerate</span>
                  </button>
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
