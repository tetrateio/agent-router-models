// Run: bun schemas/migrate-pricing.test.ts
import { deepStrictEqual, strictEqual, throws } from "node:assert"
import { migratePricing, migrateLegacyBatch } from "./migrate-pricing.ts"

const original = {
  provider: "deepinfra", inputTokensPricePerMillion: "0.4875", outputTokensPricePerMillion: "1.56",
  cachedTokensPricePerMillion: "0.091", cachingTokensPricePerMillion: null,
  additionalPricePerMillion: { service_tier_flex_multiplier: 0.8, caching_5m_per_million: 0.609375 },
}
const frozen = structuredClone(original)
const { model } = migratePricing(original)
deepStrictEqual(original, frozen, "migration must not mutate the input")
strictEqual(model.additionalPricePerMillion.flex_input_tokens_price_per_million, 0.39, "use the effective promo once")
strictEqual(model.additionalPricePerMillion.flex_output_tokens_price_per_million, 1.248)
strictEqual(model.additionalPricePerMillion.flex_cached_tokens_price_per_million, 0.0728)
strictEqual(model.additionalPricePerMillion.flex_caching_tokens_price_per_million, null, "unknown is not zero")
strictEqual(model.additionalPricePerMillion.flex_caching_5m_per_million, 0.4875)
strictEqual("flex_caching_1h_per_million" in model.additionalPricePerMillion, false, "omitted write rate stays omitted")
deepStrictEqual(migratePricing(model), { model, changes: [] }, "a second run cannot discount again")

const raw = { type: "image_units", cents_per_image_unit: 5, default_width: 1024 }
const archived = migratePricing({ provider: "deepinfra", additionalPricePerMillion: { provider_billing: raw } })
deepStrictEqual(archived.model.additionalPricePerMillion, {})
deepStrictEqual(archived.changes[0].old_value, raw, "raw units survive in the audit")
strictEqual(archived.changes[0].status, "unresolved")

const nested = migratePricing({ limits: { high_context: 200000 }, additionalPricePerMillion: {
  service_tier_prices: { fast: { input_per_million: 20, cached_input_per_million: null,
    output_per_million: 40, long_context: { input_token_threshold: 200000, input_per_million: 30, output_per_million: 60 } } },
  extra: { regional_processing_uplift_multiplier: 1.1 },
} })
strictEqual(nested.model.additionalPricePerMillion.fast_mode_input_tokens_price_per_million_high_context, 30)
strictEqual(nested.model.additionalPricePerMillion.fast_mode_cached_tokens_price_per_million, null)
strictEqual(nested.model.additionalPricePerMillion.regional_processing_uplift_multiplier, 1.1)
strictEqual(nested.changes.find(c => c.new_path === "limits.high_context")?.value, 200000)
throws(() => migratePricing({ additionalPricePerMillion: { extra: { unknown: 1 } } }), /unmapped/)
throws(() => migratePricing({ provider: "other", additionalPricePerMillion: { service_tier_flex_multiplier: 0.8 } }), /unverified/)
throws(() => migratePricing({ additionalPricePerMillion: { service_tier_prices: { batch: { long_context: { input_token_threshold: 200000 } } } } }), /threshold differs/)
throws(() => migratePricing({ additionalPricePerMillion: { batch_input_tokens_price_per_million: 2, service_tier_prices: { batch: { input_per_million: 1 } } } }), /conflicting/)
for (const provider of ["xai", "vertex"]) {
  const result = migratePricing({ provider, limits: { high_context: 200000 } })
  strictEqual(result.model.limits.high_context_comparison, provider === "xai" ? "gte" : undefined)
}
console.log("migration checks passed")

const legacyBatch = {
  inputTokensPricePerMillion: "0.75", outputTokensPricePerMillion: null,
  cachedTokensPricePerMillion: "0.075", limits: { high_context: 200000 },
  additionalPricePerMillion: { batch_discount_multiplier: 0.5, input_tokens_price_per_million_high_context: 1.5 },
}
const batch = migrateLegacyBatch(legacyBatch)
strictEqual(batch.model.additionalPricePerMillion.batch_input_tokens_price_per_million, 0.375)
strictEqual(batch.model.additionalPricePerMillion.batch_output_tokens_price_per_million, null)
strictEqual("batch_discount_multiplier" in batch.model.additionalPricePerMillion, false)
strictEqual("batch_cached_tokens_price_per_million" in batch.model.additionalPricePerMillion, false, "cache discounts are not inferred")
strictEqual("batch_input_tokens_price_per_million_high_context" in batch.model.additionalPricePerMillion, false, "threshold scope requires a source")
strictEqual(legacyBatch.additionalPricePerMillion.batch_discount_multiplier, 0.5, "input is unchanged")
deepStrictEqual(migrateLegacyBatch(batch.model), { model: batch.model, changes: [] })
strictEqual(batch.changes.at(-1)?.status, "removed")
const independentCache = migrateLegacyBatch(legacyBatch, { batch_cached_tokens_price_per_million: 0.075 })
strictEqual(independentCache.model.additionalPricePerMillion.batch_cached_tokens_price_per_million, 0.075, "published cached rate is not halved")
const explicit = migrateLegacyBatch({ ...legacyBatch, additionalPricePerMillion: {
  ...legacyBatch.additionalPricePerMillion, batch_input_tokens_price_per_million: 0.375, batch_output_tokens_price_per_million: null,
} })
strictEqual(explicit.model.additionalPricePerMillion.batch_input_tokens_price_per_million, 0.375, "never discount an explicit rate twice")
strictEqual(explicit.model.additionalPricePerMillion.batch_output_tokens_price_per_million, null, "explicit null is authoritative")
strictEqual("batch_discount_multiplier" in migratePricing(legacyBatch).model.additionalPricePerMillion, false, "full migration removes the legacy factor too")
throws(() => migrateLegacyBatch({ ...legacyBatch, additionalPricePerMillion: { batch_discount_multiplier: null } }), /invalid legacy/)
throws(() => migrateLegacyBatch({ ...legacyBatch, inputTokensPricePerMillion: undefined }), /missing Batch base/)
throws(() => migrateLegacyBatch(legacyBatch, { batch_input_tokens_price_per_million: -1 }), /invalid published/)
throws(() => migrateLegacyBatch(legacyBatch, { flex_input_tokens_price_per_million: 1 }), /unsupported published/)
console.log("legacy Batch migration checks passed")
