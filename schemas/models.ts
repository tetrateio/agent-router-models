/**
 * Model Catalog Extraction Schema
 * ---------------------------------------------------------------------------
 * Target shape for data extracted from provider documentation via agentic
 * web search. Mirrors `schema-prod.ts` so extracted objects can be upserted
 * directly into the `ai_models` table (minus DB-managed fields:
 * `id` / `createdAt` / `updatedAt`).
 *
 * Conventions:
 *   - Top-level fields use camelCase (match DB column names)
 *   - JSONB payload keys (metadata, limits, additionalPricePerMillion)
 *     use snake_case
 *   - All enums are strict literal unions
 *   - Top-level token pricing is a decimal-formatted string (matches the
 *     Drizzle `decimal` column type in `schema-prod.ts`) or `null` when
 *     the tier does not apply
 */

// =============================================================================
// ENUMS (strict literal unions)
// =============================================================================

export const PROVIDERS = [
  "anthropic",
  "openai",
  "gemini",
  "groq",
  "xai",
  "deepinfra",
  "vertex",
  "vertexanthropic",
] as const;
export type Provider = (typeof PROVIDERS)[number];

export const MODEL_MODES = [
  "audio_speech",
  "audio_transcription",
  "chat",
  "classifier",
  "completion",
  "embedding",
  "image_generation",
  "moderation",
  "rerank",
  "responses",
] as const;
export type ModelMode = (typeof MODEL_MODES)[number];

export const MODEL_CAPABILITIES = [
  "assistant_prefill",
  "code_execution",
  "computer_use",
  "embedding_image_input",
  "file_upload",
  "image_generation",
  "native_streaming",
  "pdf_support",
  "prompt_caching",
  "reasoning",
  "speech_recognition",
  "structured_outputs",
  "system_messages",
  "tool_choice",
  "url_context",
  "video_generation",
  "vision",
  "web_search",
] as const;
/** `string & {}` preserves autocomplete for known values while accepting any string. */
export type ModelCapability =
  (typeof MODEL_CAPABILITIES)[number] | (string & {});

export const MODEL_INPUT_MODALITIES = [
  "audio",
  "document",
  "image",
  "text",
  "video",
] as const;
export type ModelInputModality = (typeof MODEL_INPUT_MODALITIES)[number];

export const MODEL_OUTPUT_MODALITIES = [
  "audio",
  "code",
  "embedding",
  "image",
  "text",
  "video",
] as const;
export type ModelOutputModality = (typeof MODEL_OUTPUT_MODALITIES)[number];

// =============================================================================
// JSONB PAYLOADS — keys use snake_case
// =============================================================================

export interface ImageTokenPricing {
  input_image_tokens_price_per_million?: number;
  output_image_tokens_price_per_million?: number;
  cached_input_image_tokens_price_per_million?: number;
}

export interface ImageGenerationPricing {
  [quality: string]: {
    [size: string]: number;
  };
}

export interface AdditionalPricing {
  // Media-token pricing
  image_tokens?: ImageTokenPricing;
  image_generation?: ImageGenerationPricing;

  // Batch / tier multipliers
  batch_discount_multiplier?: number;
  high_context_multiplier?: number;

  // Anthropic prompt-cache write pricing (per-million)
  caching_1h_per_million?: number;
  caching_5m_per_million?: number;

  // Prompt-cache storage (gemini)
  caching_storage_per_million_per_hour?: number;

  // Gemini high-context tier pricing (applies above `limits.high_context`)
  input_tokens_price_per_million_high_context?: number;
  cached_tokens_price_per_million_high_context?: number;
  output_tokens_price_per_million_high_context?: number;
  caching_tokens_price_per_million_high_context?: number;

  // Gemini audio-token pricing (per-million)
  input_tokens_price_per_million_audio?: number;
  cached_tokens_price_per_million_audio?: number;
  caching_tokens_price_per_million_audio?: number;

  // Gemini embedding-model per-modality input pricing (per-million tokens)
  input_audio_per_million_tokens?: number;
  input_image_per_million_tokens?: number;
  input_video_per_million_tokens?: number;

  // Grounding / tool-call surcharges per 1000
  grounding_google_search_per_thousand?: number;
  grounding_google_maps_per_thousand?: number;
  x_search_per_thousand_calls?: number;
  web_search_per_thousand_calls?: number;
  web_search_per_thousand_sources?: number;
  code_execution_per_thousand_calls?: number;
  code_execution_per_hour?: number;
  file_attachments_per_thousand_calls?: number;
  collections_search_per_thousand_calls?: number;

  // Provider-specific fields not covered above
  [key: string]: unknown;
}

export interface ModelLimits {
  // Vision / file-upload caps
  max_file_size_mb?: number;
  max_images_per_prompt?: number;
  max_input_images?: number;
  max_output_tokens?: number;
  max_prompt_length?: number;

  /** Long-context threshold — above this, `_high_context` pricing applies (xai). */
  high_context?: number;

  // Rate limits
  rpm?: number;
  tpm?: number;
  tps?: number;

  // Provider-specific fields not covered above
  [key: string]: unknown;
}

export interface ModelModalities {
  input: ModelInputModality[];
  output: ModelOutputModality[];
}

export interface ModelMetadata {
  display_name?: string;
  description?: string;
  source_url?: string;
  aliases?: string[];
  /** Provider-routing fallbacks in order (e.g. vertex mirror of Anthropic model). */
  fallback_policies?: string[];
  regions?: string[];
  knowledge_cutoff?: string;
  release_date?: string;
  /** Hard cutoff — date the model is fully removed / no longer callable. */
  retirement_date?: string;
  deprecated?: boolean;
  deprecated_reason?: string;
  /** Soft warning — date the model was marked deprecated (still callable until `retirement_date`). */
  deprecated_date?: string;
  preview?: boolean;
  provider_override?: string;
  /** Allowed `reasoning_effort` values for this model (e.g. "low", "medium", "high", "xhigh"). */
  reasoning_efforts?: string[];
  /** Weight-quantization tag (e.g. "TruePoint Numerics" from groq). */
  quantization?: string;
  options?: Record<string, string[]>;

  // Provider-specific fields not covered above
  [key: string]: unknown;
}

// =============================================================================
// EXTRACTED MODEL — shape produced by the web-search agent
// =============================================================================

export interface ExtractedModel {
  /** Canonical model slug (e.g. "gpt-4o", "gemini-2.0-flash"). */
  model: string;

  provider: Provider;

  /** null if the provider doesn't categorize the model (rare). */
  mode: ModelMode | null;

  /** Defaults to true if omitted. */
  isEnabled?: boolean;

  /** Decimal-formatted string, e.g. `"0.2900000000"`, or `null` when N/A. */
  inputTokensPricePerMillion: string | null;
  outputTokensPricePerMillion: string | null;
  cachedTokensPricePerMillion: string | null;
  cachingTokensPricePerMillion: string | null;

  /** Surcharges / tiered pricing; omit if none apply. */
  additionalPricePerMillion?: AdditionalPricing;

  contextWindow: number | null;

  capabilities: ModelCapability[];
  modalities: ModelModalities;

  /** OpenAI-compatible endpoints this model is served from. */
  backendUrls: string[];

  limits?: ModelLimits;
  metadata?: ModelMetadata;
}
