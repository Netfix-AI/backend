import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  GeminiModelTier,
  GeminiFailureReason,
  GeminiResult,
  GeminiCallOptions,
  GeminiFallbackLogEntry
} from '../types/index.js';

class GeminiService {
  private noKeyMode: boolean = false;
  private apiKey: string = '';
  private flashModelName: string = 'gemini-1.5-flash';
  private proModelName: string = 'gemini-1.5-pro';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    const flashModel = process.env.GEMINI_MODEL_FLASH;
    const proModel = process.env.GEMINI_MODEL_PRO;

    // If GEMINI_API_KEY is absent or empty: set noKeyMode, do NOT throw
    if (!apiKey || apiKey.trim() === '') {
      console.warn('[GeminiService] GEMINI_API_KEY is not set — all calls will return rule_based_fallback');
      this.noKeyMode = true;
    } else {
      this.apiKey = apiKey;
    }

    // If GEMINI_MODEL_FLASH is absent or empty: warn and use default
    if (!flashModel || flashModel.trim() === '') {
      console.warn('[GeminiService] GEMINI_MODEL_FLASH not set — defaulting to "gemini-1.5-flash"');
    } else {
      this.flashModelName = flashModel;
    }

    // If GEMINI_MODEL_PRO is absent or empty: warn and use default
    if (!proModel || proModel.trim() === '') {
      console.warn('[GeminiService] GEMINI_MODEL_PRO not set — defaulting to "gemini-1.5-pro"');
    } else {
      this.proModelName = proModel;
    }
  }

  async call<T = Record<string, unknown>>(
    options: GeminiCallOptions
  ): Promise<GeminiResult<T>> {
    // If no API key, immediately return fallback (zero network I/O)
    if (this.noKeyMode) {
      this.logFallback(options.agentKey, 'no_api_key', 0);
      return { ai_source: 'rule_based_fallback' };
    }

    const modelName = this.getModelName(options.modelTier);
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: options.schema as any,
      },
    });

    const MAX_ATTEMPTS = 4;
    const BASE_DELAY_MS = 1000;
    const MAX_DELAY_MS = 32000;

    let lastFailureReason: GeminiFailureReason = 'api_error';
    let attempt = 0;

    while (attempt < MAX_ATTEMPTS) {
      attempt++;
      console.log(`[GeminiService] Attempt ${attempt}/${MAX_ATTEMPTS} for agent "${options.agentKey}"`);

      try {
        const result = await model.generateContent(options.prompt);
        const responseText = result.response.text();

        // Try to parse JSON
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(responseText);
        } catch {
          // Not parseable as JSON — retryable
          console.warn(`[GeminiService] Attempt ${attempt}: response is not valid JSON`);
          lastFailureReason = 'invalid_json';
          if (attempt < MAX_ATTEMPTS) {
            const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
            await this.sleep(delay);
            continue;
          }
          break;
        }

        // Lightweight schema validation: check required fields and basic types
        const isValid = this.validateSchema(parsed, options.schema);
        if (!isValid) {
          console.warn(`[GeminiService] Attempt ${attempt}: response failed schema validation`);
          lastFailureReason = 'invalid_json';
          if (attempt < MAX_ATTEMPTS) {
            const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
            await this.sleep(delay);
            continue;
          }
          break;
        }

        // Success — attach ai_source and return
        return { ...parsed, ai_source: 'ai' } as GeminiResult<T>;

      } catch (error: unknown) {
        const httpStatus = this.extractHttpStatus(error);
        // Log HTTP status only — never log the API key value
        console.warn(`[GeminiService] Attempt ${attempt}: HTTP status ${httpStatus ?? 'unknown'} for agent "${options.agentKey}"`);

        if (httpStatus === 429) {
          lastFailureReason = 'rate_limited';
          if (attempt < MAX_ATTEMPTS) {
            const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
            await this.sleep(delay);
            continue;
          }
          break;
        } else if (httpStatus !== null && httpStatus >= 500) {
          lastFailureReason = 'api_error';
          if (attempt < MAX_ATTEMPTS) {
            const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
            await this.sleep(delay);
            continue;
          }
          break;
        } else if (httpStatus !== null && httpStatus >= 400 && httpStatus !== 429) {
          // Non-retryable 4xx — break immediately to FALLBACK
          lastFailureReason = 'api_error';
          break;
        } else {
          // Unknown error — treat as retryable
          lastFailureReason = 'api_error';
          if (attempt < MAX_ATTEMPTS) {
            const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
            await this.sleep(delay);
            continue;
          }
          break;
        }
      }
    }

    // FALLBACK — log structured WARN, never throw
    this.logFallback(options.agentKey, lastFailureReason, attempt);
    return { ai_source: 'rule_based_fallback' };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractHttpStatus(error: unknown): number | null {
    if (error && typeof error === 'object') {
      // Google Generative AI SDK error shapes
      const e = error as Record<string, unknown>;
      if (typeof e['status'] === 'number') return e['status'];
      if (typeof e['httpStatus'] === 'number') return e['httpStatus'];
      if (typeof e['statusCode'] === 'number') return e['statusCode'];
      // Extract from error message patterns like "[400 Bad Request]"
      if (typeof e['message'] === 'string') {
        const match = (e['message'] as string).match(/\[(\d{3})\s/);
        if (match) return parseInt(match[1], 10);
      }
    }
    return null;
  }

  private validateSchema(parsed: Record<string, unknown>, schema: Record<string, unknown>): boolean {
    // Lightweight check: validate required fields and basic types
    // No external JSON Schema library — intentional per design spec
    try {
      if (schema.type !== 'object') return true; // Can't validate non-object schemas easily

      const required = schema.required as string[] | undefined;
      if (required && Array.isArray(required)) {
        for (const field of required) {
          if (!(field in parsed)) {
            return false;
          }
        }
      }

      const properties = schema.properties as Record<string, Record<string, unknown>> | undefined;
      if (properties) {
        for (const [field, fieldSchema] of Object.entries(properties)) {
          if (field in parsed && fieldSchema.type) {
            const expectedType = fieldSchema.type as string;
            const actualValue = parsed[field];
            if (expectedType === 'string' && typeof actualValue !== 'string') return false;
            if (expectedType === 'number' && typeof actualValue !== 'number') return false;
            if (expectedType === 'boolean' && typeof actualValue !== 'boolean') return false;
            if (expectedType === 'array' && !Array.isArray(actualValue)) return false;
            if (expectedType === 'object' && (typeof actualValue !== 'object' || Array.isArray(actualValue) || actualValue === null)) return false;
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  protected getModelName(tier: GeminiModelTier): string {
    return tier === 'FLASH' ? this.flashModelName : this.proModelName;
  }

  protected logFallback(agentKey: string, reason: GeminiFailureReason, attempts: number): void {
    const entry: GeminiFallbackLogEntry = {
      level: 'WARN',
      event: 'gemini_fallback',
      agent_key: agentKey,
      failure_reason: reason,
      timestamp: new Date().toISOString(),
      attempts
    };
    console.warn(JSON.stringify(entry));
  }

  protected isNoKeyMode(): boolean {
    return this.noKeyMode;
  }

  protected getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Phase 4 RAG: Generate Gemini Embedding for a text string
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim() === '') {
      return new Array(64).fill(0);
    }

    if (!this.noKeyMode) {
      try {
        const genAI = new GoogleGenerativeAI(this.apiKey);
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await embeddingModel.embedContent(text);
        if (result && result.embedding && Array.isArray(result.embedding.values)) {
          return result.embedding.values;
        }
      } catch (err: any) {
        console.warn('[GeminiService] Live embedding call failed, falling back to pseudo-embedding vector:', err?.message);
      }
    }

    // Deterministic pseudo-embedding vector for offline / no-key mode
    return this.generatePseudoEmbedding(text);
  }

  /**
   * Deterministic pseudo-embedding vector generator based on word frequency & hash distribution
   */
  public generatePseudoEmbedding(text: string, dimensions = 64): number[] {
    const vector = new Array(dimensions).fill(0);
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % dimensions;
      vector[index] += 1;
    }

    // L2 Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  /**
   * Cosine Similarity calculation between two vectors
   */
  public computeCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const len = Math.min(vecA.length, vecB.length);
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < len; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0;
  }
}

export const geminiService = new GeminiService();
export { GeminiService };

