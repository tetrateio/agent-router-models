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
 *     no rate is published
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

/** USD rates. Null means no published rate; zero means explicitly free. */
export type Price = number | null;

export const IMAGE_TOKEN_PRICE_KEYS = [
  "input_image_tokens_price_per_million",
  "output_image_tokens_price_per_million",
  "cached_input_image_tokens_price_per_million",
] as const;
export type ImageTokenPricing = Partial<Record<(typeof IMAGE_TOKEN_PRICE_KEYS)[number], Price>>;

/** USD per generated image, indexed by documented quality and size. */
export interface ImageGenerationPricing {
  [quality: string]: { [size: string]: Price };
}

/** Shared by the TypeScript contract and runtime validator. */
export const TOKEN_PRICE_BASES = {
  input_tokens_price_per_million: "inputTokensPricePerMillion",
  output_tokens_price_per_million: "outputTokensPricePerMillion",
  cached_tokens_price_per_million: "cachedTokensPricePerMillion",
  caching_tokens_price_per_million: "cachingTokensPricePerMillion",
  caching_5m_per_million: "caching_5m_per_million",
  caching_1h_per_million: "caching_1h_per_million",
} as const;
export type TokenPriceKey = keyof typeof TOKEN_PRICE_BASES;
export const SERVICE_TIERS = ["batch", "flex", "fast_mode", "priority"] as const;
export type ServiceTier = (typeof SERVICE_TIERS)[number];
export type ServicePriceKey = `${ServiceTier}_${TokenPriceKey}${"" | "_high_context"}`;

export const TOKEN_PRICE_KEYS = Object.keys(TOKEN_PRICE_BASES) as TokenPriceKey[];
export const HIGH_CONTEXT_PRICE_KEYS = TOKEN_PRICE_KEYS.map(
  (key) => `${key}_high_context` as const,
);
export const SERVICE_PRICE_KEYS = SERVICE_TIERS.flatMap((tier) =>
  TOKEN_PRICE_KEYS.flatMap((key) => [
    `${tier}_${key}` as ServicePriceKey,
    `${tier}_${key}_high_context` as ServicePriceKey,
  ]),
);

export const ADDITIONAL_RATE_KEYS = [
  "caching_1h_per_million",
  "caching_5m_per_million",
  "caching_storage_per_million_per_hour",
  "input_tokens_price_per_million_audio",
  "output_tokens_price_per_million_audio",
  "cached_tokens_price_per_million_audio",
  "caching_tokens_price_per_million_audio",
  "input_audio_per_million_tokens",
  "input_image_per_million_tokens",
  "input_video_per_million_tokens",
  "grounding_google_search_per_thousand",
  "grounding_google_maps_per_thousand",
  "grounding_your_data_per_thousand",
  "web_grounding_enterprise_per_thousand",
  "x_search_per_thousand_calls",
  "web_search_per_thousand_calls",
  "web_search_per_thousand_sources",
  "code_execution_per_thousand_calls",
  "code_execution_per_hour",
  "file_attachments_per_thousand_calls",
  "collections_search_per_thousand_calls",
  ...HIGH_CONTEXT_PRICE_KEYS,
  ...SERVICE_PRICE_KEYS,
] as const;

/** Dimensionless factors. Absolute service rates take precedence over legacy Batch. */
export const PRICING_MULTIPLIER_KEYS = [
  "batch_discount_multiplier",
  "inference_geo_us_multiplier",
  "regional_processing_uplift_multiplier",
  "non_global_endpoint_multiplier",
] as const;

type AdditionalScalarKey =
  | (typeof ADDITIONAL_RATE_KEYS)[number]
  | (typeof PRICING_MULTIPLIER_KEYS)[number];

/** Closed pricing contract. See pricing.md for units, tier selection and migration. */
export type AdditionalPricing = Partial<Record<AdditionalScalarKey, Price>> & {
  image_tokens?: ImageTokenPricing;
  image_generation?: ImageGenerationPricing;
};

export interface ModelLimits {
  // Vision / file-upload caps
  max_file_size_mb?: number;
  max_images_per_prompt?: number;
  max_input_images?: number;
  max_output_tokens?: number;
  max_prompt_length?: number;

  /** Input-token threshold for `_high_context` prices; must be reachable. */
  high_context?: number;
  /** Omission preserves the historical strictly-greater-than boundary. */
  high_context_comparison?: "gt" | "gte";

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
  /** Model ID sent to the provider, without the catalog's routing prefix. */
  upstream_model?: string;
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
  /** Client-facing catalog ID (e.g. "vertex/xai/grok-4.6"). */
  model: string;

  provider: Provider;

  /** null if the provider doesn't categorize the model (rare). */
  mode: ModelMode | null;

  /** Defaults to true if omitted. */
  isEnabled?: boolean;

  /** Decimal-formatted string, e.g. `"0.2900000000"`, or `null` when no rate is published. */
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
