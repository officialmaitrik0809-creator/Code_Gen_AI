/**
 * Express Full-Stack Server & API Gateway
 * Bridges the frontend with the Hugging Face Space
 * (Qwen2.5-Coder-0.5B-Instruct + LoRA adapter) and provides an optional
 * Gemini demo generator.
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { Client } from '@gradio/client';
import pg from 'pg';

dotenv.config();

// ---------------------------------------------------------------------------
// Database (Postgres, e.g. Neon) - saves every prompt and model output
// ---------------------------------------------------------------------------
const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL })
  : null;

async function initDb() {
  if (!pool) {
    console.warn('DATABASE_URL not set - saving history is disabled');
    return;
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS generations (
      id SERIAL PRIMARY KEY,
      prompt TEXT NOT NULL,
      language TEXT,
      output TEXT NOT NULL,
      engine TEXT,
      model TEXT,
      duration_ms INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Database ready: generations table OK');
}

async function saveGeneration(row: {
  prompt: string;
  language: string;
  output: string;
  engine: string;
  model: string;
  durationMs?: number;
}) {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO generations (prompt, language, output, engine, model, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        row.prompt,
        row.language,
        row.output,
        row.engine,
        row.model,
        row.durationMs != null ? Math.round(row.durationMs) : null,
      ]
    );
  } catch (err) {
    // A database problem must never break code generation
    console.error('DB save failed:', err);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Hugging Face Space that hosts the fine-tuned model
const HF_SPACE = process.env.HF_SPACE || 'maituaesthetic/code-gen-ai-model';
const HF_TOKEN = process.env.HF_TOKEN as `hf_${string}` | undefined;

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

// Connect to the Space lazily and reuse the connection
let spaceClient: Client | null = null;
async function getSpaceClient(): Promise<Client> {
  if (!spaceClient) {
    spaceClient = await Client.connect(HF_SPACE, HF_TOKEN ? { hf_token: HF_TOKEN } : {});
  }
  return spaceClient;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms / 1000}s`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/**
 * GET /api/health
 * Checks the connection to the Hugging Face Space
 */
app.get('/api/health', async (_req, res) => {
  try {
    await withTimeout(getSpaceClient(), 60000);
    return res.json({
      status: 'ready',
      backend: 'huggingface-space',
      url: HF_SPACE,
      model: 'Qwen/Qwen2.5-Coder-0.5B-Instruct',
      lora: 'fine_tuned_model',
      device: 'zerogpu',
      isDemoAvailable: !!aiClient,
    });
  } catch (error: any) {
    spaceClient = null;
    return res.json({
      status: 'unavailable',
      backend: 'offline',
      url: HF_SPACE,
      message: `Could not reach Hugging Face Space ${HF_SPACE}: ${error?.message}`,
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
      r: 8,
      lora_alpha: 16,
      lora_dropout: 0.05,
      target_modules: ['q_proj', 'k_proj', 'v_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj'],
      bias: 'none',
      task_type: 'CAUSAL_LM',
    },
    dataset: 'CodeAlpaca_20k',
    languagesSupported: ['Python', 'JavaScript', 'Java', 'C++', 'C'],
    frameworks: ['PyTorch 2.x', 'Hugging Face Transformers', 'PEFT', 'Gradio'],
    backendUrl: HF_SPACE,
  });
});

/**
 * POST /api/generate
 * Generates code from a natural language instruction
 */
app.post('/api/generate', async (req, res) => {
  const { prompt, language = 'Python', mode = 'auto', temperature = 0.2, maxTokens = 1024 } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Validation Error', message: 'Prompt cannot be empty.' });
  }

  // 1. Hugging Face Space (the fine-tuned model) for 'auto' or 'fastapi' mode
  if (mode === 'fastapi' || mode === 'auto') {
    try {
      const start = Date.now();
      const client = await withTimeout(getSpaceClient(), 60000);
      const result: any = await withTimeout(
        client.predict('/generate_code', [`${prompt.trim()} (in ${language})`]),
        120000
      );

      const payload = {
        code: String(result?.data?.[0] ?? ''),
        language,
        engine: 'hf-space-qwen-lora',
        model: 'Qwen/Qwen2.5-Coder-0.5B-Instruct + LoRA',
        durationMs: Date.now() - start,
      };

      // Save prompt + output to the database
      await saveGeneration({
        prompt: prompt.trim(),
        language: payload.language,
        output: payload.code,
        engine: payload.engine,
        model: payload.model,
        durationMs: payload.durationMs,
      });

      return res.json(payload);
    } catch (err: any) {
      spaceClient = null; // reconnect on the next request
      return res.status(503).json({
        error: 'Backend Connection Failed',
        message: `Could not get a response from the Hugging Face Space ${HF_SPACE}: ${err?.message}`,
        solution: 'Check that the Space is Running, HF_TOKEN is set on Render, and try again (the Space may be waking up).',
      });
    }
  }

  // 2. Demo generator (Gemini) - only when explicitly selected
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
        contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\n${userInstruction}` }] }],
        config: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
        },
      });

      let rawText = (response.text || '').trim();
      const codeBlockMatch = rawText.match(/^```(?:[a-zA-Z0-9_\-+]+)?\n([\s\S]*?)```$/);
      const cleanedCode = codeBlockMatch ? codeBlockMatch[1] : rawText;
      const durationMs = Date.now() - startTime;

      // Save prompt + output to the database
      await saveGeneration({
        prompt: prompt.trim(),
        language,
        output: cleanedCode,
        engine: 'demo-gemini-bridge',
        model: 'Demo Engine (Gemini 2.5 Flash)',
        durationMs,
      });

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
    message: 'The model backend is not available and no demo key is configured.',
  });
});

// Mount Vite (dev) or the static build (production)
async function startServer() {
  // Create the database table on startup (does nothing if it already exists)
  await initDb().catch((err) => console.error('DB init failed:', err));

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
