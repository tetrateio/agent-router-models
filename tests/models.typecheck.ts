// Compile with tsc --noEmit --strict --target es2022 tests/models.typecheck.ts
import type { AdditionalPricing, ModelLimits } from "../schemas/models"
const valid: AdditionalPricing = {
  fast_mode_cached_tokens_price_per_million: null,
  batch_input_tokens_price_per_million_high_context: 1,
  priority_caching_1h_per_million: 2,
  image_generation: { standard: { "1K": 0.01 } },
}
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
const limits: ModelLimits = { high_context_comparison: "gte", provider_specific: true }
void [valid, unknown, nested, stringRate, unknownImage, legacyBatch, limits]
