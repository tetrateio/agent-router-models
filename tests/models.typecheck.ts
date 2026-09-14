// Compile with tsc --noEmit --strict --target es2022 tests/models.typecheck.ts
import type { AdditionalPricing, ModelLimits } from "../schemas/models"
const valid: AdditionalPricing = {
  fast_mode_cached_tokens_price_per_million: null,
  batch_input_tokens_price_per_million_high_context: 1,
  priority_caching_1h_per_million: 2,
  input_image_price_per_image: 0.0005,
  image_generation: { standard: { "1K": 0.01 } },
  batch_input_tokens_price_per_million_audio: 0.5,
  input_tokens_price_per_million_audio_high_context: 0.3,
  priority_cached_tokens_price_per_million_audio: null,
  batch_input_video_per_million_tokens: 6,
  flex_caching_storage_per_million_per_hour: 0.5,
  batch_input_image_price_per_image: 0.0006,
  batch_image_generation: { standard: { "1K": 0.067 } },
  image_tokens: { priority_output_image_tokens_price_per_million: 216 },
  x_search_per_thousand_posts: 5,
  x_search_per_thousand_user_profiles: 10,
}
const unpublishedInputImage: AdditionalPricing = { input_image_price_per_image: null }
const freeInputImage: AdditionalPricing = { input_image_price_per_image: 0 }
// @ts-expect-error Per-input-image rates use numbers, not decimal strings.
const stringInputImage: AdditionalPricing = { input_image_price_per_image: "0.0005" }
// @ts-expect-error Per-input-image rates are scalar, not provider billing wrappers.
const wrappedInputImage: AdditionalPricing = { input_image_price_per_image: { usd: 0.0005 } }
// @ts-expect-error Per-input-image rates are not image-token prices.
const nestedInputImage: AdditionalPricing = { image_tokens: { input_image_price_per_image: 0.0005 } }
// @ts-expect-error Pricing has no catch-all.
const unknown: AdditionalPricing = { invented_price: 1 }
// @ts-expect-error Provisional nesting is no longer supported.
const nested: AdditionalPricing = { service_tier_prices: {} }
// @ts-expect-error Additional rates are numeric.
const stringRate: AdditionalPricing = { web_search_per_thousand_calls: "1" }
// @ts-expect-error Image token keys are closed too.
const unknownImage: AdditionalPricing = { image_tokens: { invented_price: 1 } }
// @ts-expect-error Batch multipliers are no longer part of the pricing contract.
const legacyBatch: AdditionalPricing = { batch_discount_multiplier: 0.5 }
// @ts-expect-error Image-token service fields retain the image_tokens container.
const flatImageToken: AdditionalPricing = { priority_output_image_tokens_price_per_million: 216 }
// @ts-expect-error Service media fields retain numeric rates.
const stringAudio: AdditionalPricing = { batch_input_tokens_price_per_million_audio: "0.5" }
// @ts-expect-error Services are a closed set.
const unknownService: AdditionalPricing = { economy_input_tokens_price_per_million_audio: 0.5 }
// @ts-expect-error Storage uses hourly units, without context-token tiers.
const tieredStorage: AdditionalPricing = { batch_caching_storage_per_million_per_hour_high_context: 1 }
// @ts-expect-error Per-image service prices retain quality and size dimensions.
const scalarImage: AdditionalPricing = { flex_image_generation: 0.01 }
// @ts-expect-error Tool billing units require their exact declared name.
const ambiguousSearch: AdditionalPricing = { x_search_per_thousand_results: 5 }
const limits: ModelLimits = { high_context_comparison: "gte", provider_specific: true }
void [valid, unpublishedInputImage, freeInputImage, stringInputImage, wrappedInputImage, nestedInputImage, unknown, nested, stringRate, unknownImage, legacyBatch, flatImageToken, stringAudio, unknownService, tieredStorage, scalarImage, ambiguousSearch, limits]
