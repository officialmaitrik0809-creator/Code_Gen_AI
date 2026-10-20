export type SupportedLanguage = 'Python' | 'JavaScript' | 'Java' | 'C++' | 'C';

export interface ModelStatusResponse {
  status: 'ready' | 'unavailable' | 'loading' | 'error';
  backend: string;
  url?: string;
  model?: string;
  lora?: string;
  device?: string;
  isDemoAvailable?: boolean;
  message?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface ModelInfo {
  baseModel: string;
  parameters: string;
  fineTuningMethod: string;
  loraConfig: {
    r: number;
    lora_alpha: number;
    lora_dropout: number;
    target_modules: string[];
    bias: string;
    task_type: string;
  };
  dataset: string;
  languagesSupported: SupportedLanguage[];
  frameworks: string[];
  backendUrl: string;
}

export interface GenerateResult {
  code: string;
  language: SupportedLanguage;
  engine: string;
  model: string;
  durationMs: number;
  isDemo?: boolean;
}

export interface ExamplePrompt {
  id: string;
  title: string;
  language: SupportedLanguage;
  prompt: string;
  description: string;
  previewCode?: string;
}
