import React from 'react';
import { Cpu, RefreshCw, AlertCircle, CheckCircle2, Server, HelpCircle } from 'lucide-react';
import { ModelStatusResponse } from '../types';

interface ModelStatusCardProps {
  status: ModelStatusResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  onSelectDemoMode?: () => void;
  isDemoActive?: boolean;
}

export const ModelStatusCard: React.FC<ModelStatusCardProps> = ({
  status,
  isLoading,
  onRefresh,
  onSelectDemoMode,
  isDemoActive = false,
}) => {
  const isReady = status?.status === 'ready';
  const isUnavailable = !isReady && status?.status === 'unavailable';

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d121f] p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">Model Information & Status</h3>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-all disabled:opacity-50"
          title="Ping backend health endpoint"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          <span className="text-[11px]">Check Health</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Base Model */}
        <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800/70">
          <span className="text-[11px] text-slate-400 block mb-1">Base Model</span>
          <span className="font-mono text-slate-200 font-medium truncate block">
            Qwen2.5-Coder-0.5B-Instruct
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">490M Parameters</span>
        </div>

        {/* Fine-Tuning Method */}
        <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800/70">
          <span className="text-[11px] text-slate-400 block mb-1">Fine-Tuning Method</span>
          <span className="font-mono text-slate-200 font-medium block">
            PEFT / LoRA
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Rank r=16 · α=32</span>
        </div>

        {/* Dataset */}
        <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800/70">
          <span className="text-[11px] text-slate-400 block mb-1">Fine-Tuning Dataset</span>
          <span className="font-mono text-slate-200 font-medium block">
            CodeAlpaca_20k
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Instruction Tuning</span>
        </div>

        {/* Status */}
        <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800/70">
          <span className="text-[11px] text-slate-400 block mb-1">Model & Backend Status</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Loading...
              </span>
            ) : isReady ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Ready (FastAPI)
              </span>
            ) : isDemoActive ? (
              <span className="inline-flex items-center gap-1.5 text-sky-400 font-medium">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                Demo Engine Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Unavailable
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
            {isReady ? `Target: ${status?.url || '127.0.0.1:8000'}` : (status?.message || 'Local server offline')}
          </span>
        </div>
      </div>

      {/* Backend connection advice banner if offline */}
      {isUnavailable && !isDemoActive && (
        <div className="mt-3 p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-200 font-medium">Local FastAPI backend is not connected.</p>
              <p className="text-amber-300/80 text-[11px] mt-0.5">
                Run <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-200 font-mono text-[10px]">uvicorn backend.main:app --port 8000</code> to launch the model, or toggle Demo Mode below to test instantly.
              </p>
            </div>
          </div>

          {onSelectDemoMode && (
            <button
              type="button"
              onClick={onSelectDemoMode}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-900 bg-sky-400 hover:bg-sky-300 transition-colors whitespace-nowrap shrink-0"
            >
              Switch to Demo Mode
            </button>
          )}
        </div>
      )}
    </div>
  );
};
