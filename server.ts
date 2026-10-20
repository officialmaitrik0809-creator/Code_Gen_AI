/**
 * Express Full-Stack Server & API Gateway
 * Bridges frontend with Python FastAPI (Qwen2.5-Coder-0.5B-Instruct + LoRA)
 * and provides Gemini Demo fallback generator when local Python backend is offline.
 */
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini client for optional demo generation bridge
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

/**
 * GET /api/health
 * Checks live connection to Python FastAPI backend
 */
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "API is running",
  });
});

    if (response.ok) {
      const data = await response.json();
      const modelReady = data.status === 'ready' && (!data.require_lora || data.is_lora_loaded);
      return res.json({
        status: modelReady ? 'ready' : (data.status === 'error' ? 'error' : 'unavailable'),
        backend: 'fastapi',
        url: FASTAPI_URL,
        model: data.model || 'Qwen/Qwen2.5-Coder-0.5B-Instruct',
        lora: data.is_lora_loaded ? data.lora : 'Adapter not loaded',
        device: data.device || 'cuda/cpu',
        isDemoAvailable: !!aiClient,
        details: data,
      });
    } else {
      return res.json({
        status: 'unavailable',
        backend: 'fastapi',
        url: FASTAPI_URL,
        message: `FastAPI responded with HTTP ${response.status}`,
        isDemoAvailable: !!aiClient,
      });
    }
  } catch (error: any) {
    return res.json({
      status: 'unavailable',
      backend: 'offline',
      url: FASTAPI_URL,
      message: `Could not connect to FastAPI server at ${FASTAPI_URL}. Ensure uvicorn is running.`,
      isDemoAvailable: !!aiClient,
    });
  }
});

/**
 * GET /api/model-info
 * Returns fine-tuning specifications and architecture details
 */
app.get('/api/model-info', (_req, res) => {
  res.json({
    baseModel: 'Qwen/Qwen2.5-Coder-0.5B-Instruct',
    parameters: '490 Million',
    fineTuningMethod: 'LoRA (Low-Rank Adaptation, PEFT)',
    loraConfig: {
      r: 16,
      lora_alpha: 32,
      lora_dropout: 0.05,
      target_modules: ['q_proj', 'k_proj', 'v_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj'],
      bias: 'none',
      task_type: 'CAUSAL_LM',
    },
    dataset: 'CodeAlpaca_20k',
    languagesSupported: ['Python', 'JavaScript', 'Java', 'C++', 'C'],
    frameworks: ['PyTorch 2.x', 'Hugging Face Transformers', 'PEFT', 'FastAPI', 'Uvicorn'],
    backendUrl: FASTAPI_URL,
  });
});

/**
 * POST /api/generate
 * Generates code from natural language instruction
 */
app.post('/api/generate', async (req, res) => {
  const { prompt, language = 'Python', mode = 'auto', temperature = 0.2, maxTokens = 1024 } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Validation Error', message: 'Prompt cannot be empty.' });
  }

  // 1. Try FastAPI if mode is 'auto' or 'fastapi'
  if (mode === 'fastapi' || mode === 'auto') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const response = await fetch(`${FASTAPI_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          language,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        return res.json({
          code: data.code,
          language: data.language || language,
          engine: 'fastapi-qwen-lora',
          model: 'Qwen/Qwen2.5-Coder-0.5B-Instruct + LoRA',
          durationMs: data.duration_ms,
        });
      } else if (mode === 'fastapi') {
        const errText = await response.text();
        return res.status(response.status).json({
          error: 'FastAPI Generation Error',
          message: errText || 'FastAPI failed to generate code.',
        });
      }
    } catch (err: any) {
      if (mode === 'fastapi') {
        return res.status(503).json({
          error: 'Backend Connection Failed',
          message: `Could not reach local FastAPI server at ${FASTAPI_URL}. Please start your Python backend or switch to Demo Mode.`,
          solution: 'Run: uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload',
        });
      }
      // Do not silently substitute another model when the local model is unavailable.
    }
  }

  // 2. Demo generator fallback (using Gemini API configured in environment)
  if (mode === 'demo' && aiClient) {
    try {
      const startTime = Date.now();
      const systemInstruction = `You are an AI code generator emulating the fine-tuned Qwen2.5-Coder-0.5B-Instruct model (trained on CodeAlpaca_20k).
Generate ONLY clean, functional, production-grade code in the requested programming language: ${language}.
Rules:
- Output ONLY the raw executable code.
- Do NOT wrap the code in conversational chatter, preamble, or postscript.
- If using markdown code fence, use \`\`\`${language.toLowerCase()} ... \`\`\`, but raw code is preferred.
- Preserve proper indentation, variable naming, and standard idioms.
- Include concise inline comments where necessary for complex logic.`;

      const userInstruction = `Language: ${language}\nInstruction: ${prompt.trim()}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userInstruction}` }] }
        ],
        config: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
        }
      });

      let rawText = response.text || '';
      // Strip markdown code fences if wrapped
      rawText = rawText.trim();
      const codeBlockMatch = rawText.match(/^```(?:[a-zA-Z0-9_\-+]+)?\n([\s\S]*?)```$/);
      const cleanedCode = codeBlockMatch ? codeBlockMatch[1] : rawText;

      const durationMs = Date.now() - startTime;
      return res.json({
        code: cleanedCode,
        language,
        engine: 'demo-gemini-bridge',
        model: 'Demo Engine (Gemini 2.5 Flash as Qwen2.5-Coder bridge)',
        durationMs,
        isDemo: true,
      });
    } catch (geminiError: any) {
      return res.status(500).json({
        error: 'Demo Generation Error',
        message: geminiError?.message || 'Failed to generate code via demo bridge.',
      });
    }
  }

  return res.status(503).json({
    error: 'No Backend Available',
    message: 'Local FastAPI backend is not connected and no demo key is available. Please start the Python backend.',
    solution: 'Run: uvicorn backend.main:app --port 8000',
  });
});

// Mount Vite or static build
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeGen AI server running on port ${PORT} (Mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
