import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Database,
  Code2,
  Terminal,
  Server,
  ArrowRight,
  GitBranch,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { ModelStatusResponse } from '../types';

interface AboutProps {
  status: ModelStatusResponse | null;
  onRefreshHealth: () => void;
}

export const About: React.FC<AboutProps> = ({ status }) => {
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeSnippet(id);
    setTimeout(() => setCopiedCodeSnippet(null), 2000);
  };

  const techStack = [
    {
      category: 'Model & Weights',
      items: [
        {
          name: 'Qwen2.5-Coder-0.5B-Instruct',
          role: 'Base Language Model',
          desc: 'Alibaba Cloud’s state-of-the-art compact coder model with 490M parameters, pre-trained on trillions of code tokens and multi-language repositories.',
          badge: '490M Params',
        },
        {
          name: 'CodeAlpaca_20k',
          role: 'Instruction Dataset',
          desc: '20,000 instruction-input-output samples distilled for code generation, competitive programming, and algorithm synthesis.',
          badge: '20,000 Pairs',
        },
        {
          name: 'PEFT & LoRA',
          role: 'Fine-Tuning Method',
          desc: 'Low-Rank Adaptation freezing base weights and adding trainable rank decomposition matrices (r=16, α=32) across attention layers.',
          badge: 'LoRA r=16',
        },
      ],
    },
    {
      category: 'Inference Backend',
      items: [
        {
          name: 'Python 3.10+ & PyTorch 2.x',
          role: 'Core ML Runtime',
          desc: 'Tensor compute engine utilizing FP16 mixed precision on CUDA GPUs or optimized AVX-512 vectorization on CPU.',
          badge: 'PyTorch',
        },
        {
          name: 'Hugging Face Transformers',
          role: 'Model Pipelines',
          desc: 'AutoModelForCausalLM and AutoTokenizer orchestration, ChatML prompt formatting, and generation sampling loops.',
          badge: 'Transformers',
        },
        {
          name: 'FastAPI & Uvicorn',
          role: 'REST API Service',
          desc: 'High-performance asynchronous web server exposing /health, /generate, and /model-info endpoints with CORS security.',
          badge: 'FastAPI',
        },
      ],
    },
    {
      category: 'Frontend & Gateway',
      items: [
        {
          name: 'React 19 & TypeScript',
          role: 'User Interface',
          desc: 'Declarative component hierarchy with strict type safety, responsive state orchestration, and real-time validation.',
          badge: 'React 19',
        },
        {
          name: 'Tailwind CSS',
          role: 'Styling System',
          desc: 'Dark theme developer-tool aesthetic with subtle blue/violet gradients, 60-30-10 palette rules, and zero-pill discipline.',
          badge: 'Tailwind v4',
        },
        {
          name: 'Prism.js Syntax Highlighter',
          role: 'Code Rendering',
          desc: 'Client-side grammar tokenization for Python, JavaScript, Java, C++, and C with tabular line numbers and instant export.',
          badge: 'Prism.js',
        },
      ],
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'User Enters Instruction',
      desc: 'The developer inputs a natural language task description in the Playground (e.g. "Write an LRU Cache in Python").',
      icon: Terminal,
    },
    {
      step: '02',
      title: 'Gateway Sends Request',
      desc: 'The web app performs validation and transmits the prompt and selected language payload to the backend via POST /generate.',
      icon: ArrowRight,
    },
    {
      step: '03',
      title: 'Backend Loads Fine-Tuned Model',
      desc: 'FastAPI invokes the tokenizer, formats the input into ChatML/CodeAlpaca prompt templates, and passes tensors to the model.',
      icon: Server,
    },
    {
      step: '04',
      title: 'Model Generates Code',
      desc: 'The fine-tuned Qwen2.5-Coder + LoRA adapter performs autoregressive decoding, sampling tokens at temperature 0.2.',
      icon: Cpu,
    },
    {
      step: '05',
      title: 'Output Appears in Editor',
      desc: 'The generated code is cleaned, stripped of Markdown wrappers, and streamed to the syntax-highlighted IDE window.',
      icon: Code2,
    },
  ];

  const runBackendSnippet = `# Clone or navigate to the project directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI inference server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload`;

  const trainModelSnippet = `# Fine-tune Qwen2.5-Coder with LoRA on CodeAlpaca-20k
python backend/train_lora.py \\
  --base_model "Qwen/Qwen2.5-Coder-0.5B-Instruct" \\
  --dataset_name "sahil2801/CodeAlpaca-20k" \\
  --output_dir "./model" \\
  --num_epochs 3 \\
  --batch_size 4 \\
  --lora_r 16 \\
  --lora_alpha 32`;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="max-w-3xl mb-14">
        <div className="text-xs font-mono text-sky-400 mb-2">
          Project Architecture & Specifications
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About CodeGen AI
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
          An end-to-end open architecture uniting modern Parameter-Efficient Fine-Tuning (PEFT) with an interactive developer playground.
        </p>
      </div>

      {/* 5-Step Workflow Section */}
      <div className="mb-20">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-sky-400" />
            <span>End-to-End System Workflow</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            How a natural language prompt travels from the user interface to token synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((ws, idx) => {
            const Icon = ws.icon;
            return (
              <div
                key={ws.step}
                className="relative p-5 rounded-xl bg-[#0c101c] border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-sky-400 font-bold">
                      STEP {ws.step}
                    </span>
                    <div className="w-7 h-7 rounded-md bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{ws.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{ws.desc}</p>
                </div>

                {idx < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-[#080b11] border border-slate-700 text-slate-500 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-sky-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="mb-20">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-400" />
            <span>Complete Technology Stack</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Engineered using modern, high-efficiency tools across ML, API services, and frontend engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {techStack.map((col) => (
            <div
              key={col.category}
              className="p-6 rounded-xl bg-[#0c101c] border border-slate-800/80 flex flex-col gap-4"
            >
              <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
                {col.category}
              </h3>

              <div className="space-y-4">
                {col.items.map((item) => (
                  <div key={item.name} className="p-3.5 rounded-lg bg-[#080b12] border border-slate-800/70">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/50">
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">
                      {item.role}
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LoRA & PEFT Architecture Details */}
      <div className="mb-20 p-6 sm:p-8 rounded-2xl bg-[#0d121f] border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="text-xs font-mono text-sky-400 mb-2">
              Mathematical Foundation
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Low-Rank Adaptation (LoRA) Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              Traditional full fine-tuning of deep transformer models requires updating and storing gigabytes of weight matrices. LoRA decomposes the weight update matrix <span className="font-mono text-sky-300">ΔW</span> into two low-rank matrices:
            </p>
            <div className="p-3.5 rounded-lg bg-[#080b12] border border-slate-800 font-mono text-xs sm:text-sm text-sky-300 mb-4 inline-block">
              W = W₀ + ΔW = W₀ + (α / r) · (B · A)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Where <span className="font-mono text-slate-300">W₀</span> is the frozen base model weights, <span className="font-mono text-slate-300">r = 16</span> is the low rank, and <span className="font-mono text-slate-300">α = 32</span> is the scaling factor. By injecting trainable rank-decomposition matrices into the projection modules (<span className="font-mono text-slate-300">q_proj, k_proj, v_proj, o_proj</span>), only ~0.5% of the total model parameters need gradient computation, enabling lightning-fast adaptation on CodeAlpaca_20k.
            </p>
          </div>

          <div className="lg:col-span-5 p-5 rounded-xl bg-[#090d16] border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2.5">
            <div className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
              Hyperparameter Specification
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Rank (r):</span>
              <span className="text-sky-400 font-medium">16</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">LoRA Alpha (α):</span>
              <span className="text-sky-400 font-medium">32</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">LoRA Dropout:</span>
              <span className="text-sky-400 font-medium">0.05</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Target Modules:</span>
              <span className="text-violet-300 font-medium">q, k, v, o, gate, up, down</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Learning Rate:</span>
              <span className="text-sky-400 font-medium">2e-4</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Optimizer:</span>
              <span className="text-emerald-400 font-medium">AdamW (FP16)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Local Setup & Commands */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>Local Deployment & Fine-Tuning Instructions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Copy and run these commands to launch the FastAPI backend or fine-tune with your own data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Box 1: Run Backend */}
          <div className="rounded-xl bg-[#0c101c] border border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-200">
                  1. Run FastAPI Inference Backend
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(runBackendSnippet, 'run-backend')}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer"
                >
                  {copiedCodeSnippet === 'run-backend' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 rounded-lg bg-[#080b12] border border-slate-850 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                {runBackendSnippet}
              </pre>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              FastAPI listens on port 8000 and automatically connects with the frontend via the Express proxy.
            </p>
          </div>

          {/* Box 2: Fine-Tune */}
          <div className="rounded-xl bg-[#0c101c] border border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-200">
                  2. Train Model with LoRA Script
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(trainModelSnippet, 'train-model')}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer"
                >
                  {copiedCodeSnippet === 'train-model' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 rounded-lg bg-[#080b12] border border-slate-850 font-mono text-xs text-violet-300 overflow-x-auto leading-relaxed">
                {trainModelSnippet}
              </pre>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Saves the fine-tuned LoRA weights into <code className="text-slate-300 font-mono">./model</code> for immediate serving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
