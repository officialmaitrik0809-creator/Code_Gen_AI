import React from 'react';
import {
  MessageSquareCode,
  BrainCircuit,
  Code2,
  Download,
  Smile,
  Sliders,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface FeaturesProps {
  onStartCoding: () => void;
}

export const Features: React.FC<FeaturesProps> = ({ onStartCoding }) => {
  const featureList = [
    {
      id: 'nl2code',
      icon: MessageSquareCode,
      color: 'sky',
      title: 'Natural-Language-to-Code Generation',
      subtitle: 'Turn English specifications into pure code',
      description:
        'Transform complex programming specifications, mathematical algorithms, or file utilities into working functions without having to look up syntax dictionaries.',
      details: [
        'Understands complex constraints and algorithmic time limits',
        'Generates only raw executable code without conversational clutter',
        'Handles edge cases (empty collections, zero bounds, null references)',
      ],
    },
    {
      id: 'ai-assisted',
      icon: BrainCircuit,
      color: 'violet',
      title: 'AI-Assisted Programming',
      subtitle: 'Trained on 20,000 algorithmic tasks',
      description:
        'Fine-tuned on the CodeAlpaca_20k dataset, the model specializes in competitive programming patterns, data structures, and idiomatic idioms across multiple paradigms.',
      details: [
        'Pattern recognition for recursion, memoization, and dynamic programming',
        'Modern idioms across Python 3.12, ES6+, Java 21, and modern C++20',
        'Compact 0.5B footprint enables sub-second token latency',
      ],
    },
    {
      id: 'syntax-output',
      icon: Code2,
      color: 'indigo',
      title: 'Syntax-Highlighted Output',
      subtitle: 'Native token parsing and line indexing',
      description:
        'View clean, token-colored code with custom line numbers, UTF-8 status indicators, and VS Code-inspired dark theme styling optimized for long reading sessions.',
      details: [
        'Automatic grammar recognition for Python, JavaScript, Java, C++, C',
        'Precise tabular line numbering and character counters',
        'Resilient rendering with horizontal scroll for long lines',
      ],
    },
    {
      id: 'export',
      icon: Download,
      color: 'emerald',
      title: 'One-Click Copy & Download',
      subtitle: 'Direct export to your local project',
      description:
        'Instantly copy generated code to your system clipboard or export it as a standalone file with the correct language extension (.py, .js, .java, .cpp, .c).',
      details: [
        'Single-click clipboard write with instant visual confirmation',
        'Native browser file download with MIME-type headers',
        'Ready to run directly in your local compiler or IDE',
      ],
    },
    {
      id: 'beginner-friendly',
      icon: Smile,
      color: 'amber',
      title: 'Simple, Beginner-Friendly Interface',
      subtitle: 'No complex configuration or setup barrier',
      description:
        'Engineered for clarity and focus. Users of all skill levels can explore programming concepts, test code variations, and learn new programming languages effortlessly.',
      details: [
        'Pre-curated prompt suggestions for algorithms, data structures, and APIs',
        'Keyboard shortcuts (Ctrl/Cmd + Enter) for rapid prototyping',
        'Helpful error diagnostics with actionable troubleshooting steps',
      ],
    },
    {
      id: 'fine-tune-arch',
      icon: Sliders,
      color: 'rose',
      title: 'Fine-Tunable Model Architecture',
      subtitle: 'LoRA & PEFT with frozen base weights',
      description:
        'Leverages Parameter-Efficient Fine-Tuning (PEFT) with Low-Rank Adaptation. The base Qwen2.5-Coder weights remain frozen while low-rank matrices adapt to custom code styles.',
      details: [
        'Trainable on consumer hardware or free Google Colab tiers in minutes',
        'LoRA rank r=16 and alpha=32 with target modules q_proj and v_proj',
        'Full PyTorch training script provided in the repository',
      ],
    },
  ];

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="text-xs font-mono text-sky-400 mb-2">
          Core System Capabilities
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Engineered for Developer Velocity
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
          From natural language input to production-grade source code, every component of the CodeGen AI platform is built for speed, accuracy, and ease of use.
        </p>
      </div>

      {/* 6 Grid Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureList.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              className="p-6 rounded-xl bg-[#0c101c] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 text-sky-400 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-semibold text-white mb-1">
                  {f.title}
                </h3>
                <span className="text-xs font-mono text-sky-400/90 block mb-3">
                  {f.subtitle}
                </span>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {f.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-2">
                {f.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-300">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Banner */}
      <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-sky-950/40 via-violet-950/30 to-slate-900 border border-slate-800 text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          Ready to experience AI-powered code generation?
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-6">
          Test algorithms, debug routines, and create functions across Python, JavaScript, Java, C++, and C in seconds.
        </p>
        <button
          type="button"
          onClick={onStartCoding}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
        >
          <span>Open Code Playground</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
