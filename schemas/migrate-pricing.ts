// One-time conversion of the September 11 refresh's provisional pricing fields.
// Pure transformation: callers control formatting and must retain the returned audit.
import { SERVICE_PRICE_KEYS, TOKEN_PRICE_BASES, TOKEN_PRICE_KEYS, type Price, type ServicePriceKey } from "./models.ts"

export interface PricingChange {
  old_path: string;
  new_path: string | null;
  old_value: unknown;
  value: unknown;
  status: "normalized" | "unresolved" | "removed";
  reason?: string;
}
const fields: Record<string, string> = {
  input_per_million: "input_tokens_price_per_million",
  output_per_million: "output_tokens_price_per_million",
  cached_input_per_million: "cached_tokens_price_per_million",
  cache_write_per_million: "caching_tokens_price_per_million",
}
const bag = (v: any): v is Record<string, any> => !!v && typeof v === "object" && !Array.isArray(v)

export function migratePricing(original: any): { model: any; changes: PricingChange[] } {
  const model = structuredClone(original)
  const price = model.additionalPricePerMillion ?? {}
  const changes: PricingChange[] = []
  const record = (oldPath: string, newPath: string | null, oldValue: unknown, value: unknown, reason?: string) => {
    changes.push({ old_path: oldPath, new_path: newPath, old_value: oldValue, value,
      status: newPath === null ? "unresolved" : "normalized", ...(reason ? { reason } : {}) })
  }
  const put = (oldPath: string, key: string, oldValue: unknown, value: unknown) => {
    if (key in price && price[key] !== value) throw new Error(`conflicting normalized price ${key}`)
    price[key] = value
    record(`additionalPricePerMillion.${oldPath}`, `additionalPricePerMillion.${key}`, oldValue, value)
  }
  if ("service_tier_prices" in price) {
    if (!bag(price.service_tier_prices)) throw new Error("invalid service_tier_prices")
    for (const [tier, rates] of Object.entries(price.service_tier_prices)) {
      if (!["batch", "flex", "fast"].includes(tier) || !bag(rates)) throw new Error(`unsupported service tier ${tier}`)
      const prefix = tier === "fast" ? "fast_mode" : tier
      const copy = (rows: Record<string, any>, suffix: string, path: string) => {
        for (const [key, value] of Object.entries(rows)) {
          if (key === "long_context" && !suffix) continue
          if (key === "input_token_threshold" && suffix) {
            if (value !== model.limits?.high_context) throw new Error("service tier threshold differs from Standard")
            record(`additionalPricePerMillion.${path}.${key}`, "limits.high_context", value, value)
          } else {
            if (!(key in fields)) throw new Error(`unknown service price ${key}`)
            put(`${path}.${key}`, `${prefix}_${fields[key]}${suffix}`, value, value)
          }
        }
      }
      copy(rates, "", `service_tier_prices.${tier}`)
      if ("long_context" in rates) {
        if (!bag(rates.long_context)) throw new Error("invalid long_context")
        copy(rates.long_context, "_high_context", `service_tier_prices.${tier}.long_context`)
      }
    }
    delete price.service_tier_prices
  }
  for (const tier of ["priority", "flex"]) {
    const key = `service_tier_${tier}_multiplier`
    if (!(key in price)) continue
    if (model.provider !== "deepinfra") throw new Error(`unverified multiplier scope for ${model.provider}`)
    const multiplier = price[key]
    if (typeof multiplier !== "number" || !Number.isFinite(multiplier) || multiplier <= 0)
      throw new Error(`invalid ${key}`)
    for (const tokenKey of TOKEN_PRICE_KEYS) {
      const baseKey = TOKEN_PRICE_BASES[tokenKey]
      const base = baseKey.startsWith("caching_") ? price[baseKey] : model[baseKey]
      if (base === undefined) continue
      // The catalog already contains the effective promotional rate. Apply only
      // the service multiplier, once. Preserve unknown cached prices as null.
      const value = base === null ? null : Number((Number(base) * multiplier).toPrecision(15))
      put(key, `${tier}_${tokenKey}`, multiplier, value)
    }
    delete price[key]
  }
  if ("extra" in price) {
    if (!bag(price.extra)) throw new Error("invalid pricing extra")
    for (const [key, value] of Object.entries(price.extra)) {
      if (key !== "regional_processing_uplift_multiplier") throw new Error(`unmapped pricing extra ${key}`)
      put(`extra.${key}`, key, value, value)
    }
    delete price.extra
  }
  if ("provider_billing" in price) {
    record("additionalPricePerMillion.provider_billing", null, price.provider_billing, price.provider_billing,
      "Preserved as raw provider evidence. Billing units or token direction do not map safely to the normalized contract.")
    delete price.provider_billing
  }
  if (model.provider === "xai" && model.limits?.high_context === 200000 && model.limits.high_context_comparison === undefined) {
    model.limits.high_context_comparison = "gte"
    record("limits.high_context_comparison", "limits.high_context_comparison", "gt (implicit)", "gte",
      "Direct xAI pricing lists the long-context tier at input tokens >= 200,000.")
  }
  const batch = migrateLegacyBatch(model)
  return { model: batch.model, changes: [...changes, ...batch.changes] }
}

/** Remove the legacy Batch factor. Only input/output follow its established scope.
 * Pass independently sourced cache and threshold cells through publishedRates.
 * Existing absolute prices, including null, are authoritative and never discounted again.
 */
export function migrateLegacyBatch(
  original: any,
  publishedRates: Partial<Record<ServicePriceKey, Price>> = {},
): { model: any; changes: PricingChange[] } {
  const model = structuredClone(original)
  const price = model.additionalPricePerMillion
  const changes: PricingChange[] = []
  if (!bag(price) || !("batch_discount_multiplier" in price)) return { model, changes }
  const factor = price.batch_discount_multiplier
  if (typeof factor !== "number" || !Number.isFinite(factor) || factor <= 0 || factor > 1)
    throw new Error("invalid legacy Batch factor")
  const put = (key: string, value: Price, reason: string) => {
    if (key in price) return
    price[key] = value
    changes.push({ old_path: "additionalPricePerMillion.batch_discount_multiplier",
      new_path: `additionalPricePerMillion.${key}`, old_value: factor, value,
      status: "normalized", reason })
  }
  for (const [key, value] of Object.entries(publishedRates)) {
    if (!key.startsWith("batch_") || !SERVICE_PRICE_KEYS.includes(key as ServicePriceKey))
      throw new Error(`unsupported published Batch key ${key}`)
    if (value !== null && !(typeof value === "number" && Number.isFinite(value) && value >= 0))
      throw new Error(`invalid published Batch rate ${key}`)
    if (key in price && price[key] !== value) throw new Error(`conflicting published Batch rate ${key}`)
    put(key, value, "Independent provider Batch cell; no multiplier applied.")
  }
  for (const key of ["input_tokens_price_per_million", "output_tokens_price_per_million"] as const) {
    if (`batch_${key}` in price) continue
    const baseKey = TOKEN_PRICE_BASES[key]
    const base = model[baseKey]
    if (base === undefined || (base !== null && !(typeof base === "string" && /^\d+(?:\.\d+)?$/.test(base) && Number.isFinite(Number(base)))))
      throw new Error(`invalid or missing Batch base ${baseKey}`)
    const value = base === null ? null : Number((Number(base) * factor).toPrecision(15))
    put(`batch_${key}`, value, `${baseKey} (${base}) times the legacy factor once; null remains unknown.`)
  }
  delete price.batch_discount_multiplier
  changes.push({ old_path: "additionalPricePerMillion.batch_discount_multiplier", new_path: null,
    old_value: factor, value: null, status: "removed", reason: "Absolute Batch cells replace the legacy factor." })
  return { model, changes }
}
