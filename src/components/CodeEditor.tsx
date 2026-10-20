import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, Code2, Sparkles, Terminal } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import { SupportedLanguage } from '../types';

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  isLoading?: boolean;
  filename?: string;
  readOnly?: boolean;
  emptyMessage?: string;
  onCodeChange?: (newCode: string) => void;
  headerRight?: React.ReactNode;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  isLoading = false,
  filename,
  readOnly = true,
  emptyMessage = 'Generated code will appear here...',
  onCodeChange,
  headerRight,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const getExtension = (lang: SupportedLanguage): string => {
    switch (lang) {
      case 'Python': return 'py';
      case 'JavaScript': return 'js';
      case 'Java': return 'java';
      case 'C++': return 'cpp';
      case 'C': return 'c';
      default: return 'txt';
    }
  };

  const getPrismLang = (lang: SupportedLanguage): string => {
    switch (lang) {
      case 'Python': return 'python';
      case 'JavaScript': return 'javascript';
      case 'Java': return 'java';
      case 'C++': return 'cpp';
      case 'C': return 'c';
      default: return 'clike';
    }
  };

  const handleDownload = () => {
    if (!code) return;
    const ext = getExtension(language);
    const fname = filename || `generated_${language.toLowerCase()}.${ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fname;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = code ? code.split('\n') : [];
  const lineCount = lines.length;
  const charCount = code.length;

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-[#0c101a] shadow-2xl overflow-hidden transition-all">
      {/* Top Window Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f1422] border-b border-slate-800/80 text-xs select-none">
        <div className="flex items-center gap-3">
          {/* Mac-style subtle window controls */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="h-3.5 w-px bg-slate-800 mx-1" />

          {/* Active File Tab */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161c2d] border border-slate-700/60 text-slate-200 font-mono text-[11px]">
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span>{filename || `main.${getExtension(language)}`}</span>
          </div>

          <span className="hidden sm:inline text-slate-500 text-[11px] font-mono">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {headerRight}

          {code && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!code || isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 transition-colors disabled:opacity-40"
                title="Copy Code"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!code || isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 transition-colors disabled:opacity-40"
                title="Download Source File"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Download</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 min-h-[360px] overflow-auto bg-[#090d16] font-mono text-[13px] leading-relaxed">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[#090d16]/90 backdrop-blur-xs z-10">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-violet-500/20 border-b-violet-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
              <div className="flex items-center justify-center h-full">
                <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-200">Generating code with Qwen2.5-Coder...</p>
            <p className="text-xs text-slate-500 mt-1">Applying fine-tuned LoRA weights for {language}</p>
          </div>
        ) : null}

        {code ? (
          <div className="flex min-h-full">
            {/* Line numbers column */}
            <div className="select-none py-4 px-3 text-right bg-[#090d16] border-r border-slate-800/80 text-slate-600 font-mono text-xs w-12 shrink-0">
              {lines.map((_, idx) => (
                <div key={idx} className="leading-6">
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Code Content */}
            <div className="flex-1 py-4 px-4 overflow-x-auto">
              <pre className="!bg-transparent !p-0 !m-0 !overflow-visible">
                <code className={`language-${getPrismLang(language)} leading-6`}>
                  {code}
                </code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[320px] p-8 text-center text-slate-500">
            <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center mb-3">
              <Terminal className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-400 max-w-sm">
              {emptyMessage}
            </p>
            <p className="text-xs text-slate-600 mt-1 max-w-xs">
              Select an example prompt on the left or type your own instruction to see the model output.
            </p>
          </div>
        )}
      </div>

      {/* Editor Status Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d121e] border-t border-slate-800/80 text-[11px] font-mono text-slate-500 select-none">
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>·</span>
          <span>{language}</span>
          <span>·</span>
          <span>Spaces: 4</span>
        </div>

        <div className="flex items-center gap-3">
          <span>{lineCount} lines</span>
          <span>·</span>
          <span>{charCount} chars</span>
        </div>
      </div>
    </div>
  );
};
