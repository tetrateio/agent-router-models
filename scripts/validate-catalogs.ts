// Validate the pricing contract on every provider catalog: bun scripts/validate-catalogs.ts
import { readFileSync } from "node:fs"
import {
  ADDITIONAL_RATE_KEYS, IMAGE_TOKEN_PRICE_KEYS, PRICING_MULTIPLIER_KEYS,
  PROVIDERS, SERVICE_TIERS, TOKEN_PRICE_BASES, type TokenPriceKey,
} from "../schemas/models.ts"

const TOKEN_PRICE_KEYS = Object.keys(TOKEN_PRICE_BASES) as TokenPriceKey[]
// Generate runtime keys from the reference's literal declarations.
const rateKeys = new Set<string>([
  ...ADDITIONAL_RATE_KEYS,
  ...TOKEN_PRICE_KEYS.map(key => `${key}_high_context`),
  ...SERVICE_TIERS.flatMap(tier => TOKEN_PRICE_KEYS.flatMap(key => [
    `${tier}_${key}`, `${tier}_${key}_high_context`,
  ])),
])
const multiplierKeys = new Set<string>(PRICING_MULTIPLIER_KEYS)
const imageKeys = new Set<string>(IMAGE_TOKEN_PRICE_KEYS)
const object = (v: unknown): v is Record<string, any> =>
  v !== null && typeof v === "object" && !Array.isArray(v)
const rate = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0
const known = (v: unknown) => v !== null && v !== undefined
const MULTIPLIER_RE = /high_context_multiplier|above_\d+k|_(?:above|over)_\d/i

/** Structural checks do not establish provider support or source verification. */
export function pricingErrors(m: any): string[] {
  if (!object(m)) return ["model must be an object"]
  const errors: string[] = []
  const price = m.additionalPricePerMillion === undefined ? {} : m.additionalPricePerMillion
  if (!object(price)) return ["additionalPricePerMillion must be an object"]
  if (m.limits !== undefined && !object(m.limits)) return ["limits must be an object"]

  // Top-level DB decimal strings retain their existing representation.
  for (const key of Object.values(TOKEN_PRICE_BASES).filter(k => !k.startsWith("caching_"))) {
    const v = m[key]
    if (known(v) && !(typeof v === "string" && /^\d+(?:\.\d+)?$/.test(v) && Number.isFinite(Number(v))))
      errors.push(`${key} must be a nonnegative decimal string or null`)
  }
  const checkRate = (path: string, value: unknown) => {
    if (value !== null && !rate(value)) errors.push(`${path} must be a finite nonnegative number or null`)
  }
  for (const [key, value] of Object.entries(price)) {
    if (rateKeys.has(key)) checkRate(key, value)
    else if (multiplierKeys.has(key)) {
      checkRate(key, value)
      if (rate(value) && value < 1)
        errors.push(`${key} is outside its multiplier range`)
    } else if (key === "image_tokens") {
      if (!object(value)) errors.push("image_tokens must be an object")
      else for (const [k, v] of Object.entries(value)) {
        if (!imageKeys.has(k)) errors.push(`unknown image_tokens key ${k}`)
        else checkRate(`image_tokens.${k}`, v)
      }
    } else if (key === "image_generation") {
      if (!object(value) || !Object.keys(value).length) errors.push("image_generation must be a nonempty quality/size table")
      else for (const [quality, sizes] of Object.entries(value)) {
        if (!quality.trim() || !object(sizes) || !Object.keys(sizes).length)
          errors.push(`image_generation.${quality} must be a nonempty size table`)
        else for (const [size, v] of Object.entries(sizes)) {
          if (!size.trim()) errors.push(`image_generation.${quality} has an empty size`)
          checkRate(`image_generation.${quality}.${size}`, v)
        }
      }
    } else errors.push(`unknown pricing key ${key}`)
  }

  if ("input_image_price_per_image" in price) {
    if (!Array.isArray(m.modalities?.input) || !m.modalities.input.includes("image"))
      errors.push("input_image_price_per_image requires modalities.input to include image")
    if (!Array.isArray(m.capabilities) || !m.capabilities.includes("vision"))
      errors.push("input_image_price_per_image requires the vision capability")
  }

  // Keep detecting the old threshold multipliers in extensible limits bags.
  const checkLimits = (bag: unknown) => {
    if (!object(bag)) return
    for (const [key, value] of Object.entries(bag)) {
      if (MULTIPLIER_RE.test(key)) errors.push(`${key} states the tier as a multiplier; write absolute *_high_context prices`)
      checkLimits(value)
    }
  }
  checkLimits(m.limits)

  const threshold = m.limits?.high_context
  const comparison = m.limits?.high_context_comparison ?? "gt"
  if (m.limits?.high_context_comparison !== undefined && !["gt", "gte"].includes(m.limits.high_context_comparison)) errors.push("high_context_comparison must be gt or gte")
  const highKeys = Object.keys(price).filter(k => rateKeys.has(k) && k.endsWith("_high_context"))
  const hasThreshold = threshold !== undefined
  if (hasThreshold || highKeys.length || m.limits?.high_context_comparison !== undefined) {
    if (!(Number.isInteger(threshold) && threshold > 0))
      errors.push("tier prices need limits.high_context as a positive integer")
    const ceiling = m.limits?.max_input_tokens ?? m.contextWindow
    if (!known(ceiling)) errors.push("tier prices need a published input ceiling")
    else if (!(Number.isInteger(ceiling) && ceiling > 0))
      errors.push("tier input ceiling must be a positive integer")
    else if (known(ceiling) && (comparison === "gte" ? threshold > ceiling : threshold >= ceiling))
      errors.push(`limits.high_context ${threshold} is not reachable; input caps at ${ceiling}`)
    if (!highKeys.length) errors.push("limits.high_context set but high-context prices are missing")
  }

  for (const tier of ["", ...SERVICE_TIERS]) {
    const prefix = tier ? `${tier}_` : ""
    const hasBase = tier && TOKEN_PRICE_KEYS.some(k => `${prefix}${k}` in price)
    const hasHigh = TOKEN_PRICE_KEYS.some(k => `${prefix}${k}_high_context` in price)
    for (const suffix of ["", "_high_context"]) {
      if (!(suffix ? hasHigh : hasBase)) continue
      for (const key of ["input_tokens_price_per_million", "output_tokens_price_per_million"]) {
        if (!(`${prefix}${key}${suffix}` in price)) errors.push(`${prefix}${key}${suffix} is missing`)
      }
    }
    for (const key of TOKEN_PRICE_KEYS) {
      const highKey = `${prefix}${key}_high_context`
      if (!known(price[highKey])) continue
      const baseKey = tier ? `${prefix}${key}` : TOKEN_PRICE_BASES[key]
      const inAdditional = !!tier || baseKey.startsWith("caching_")
      const base = inAdditional ? price[baseKey] : m[baseKey]
      if (!known(base)) errors.push(`${highKey} set but ${baseKey} is null or missing`)
      else if (rate(price[highKey]) && price[highKey] < Number(base))
        errors.push(`${highKey} ${price[highKey]} is below ${baseKey} ${base}`)
    }
  }

  return errors
}

// Retain the previous import while extending its checks to the complete pricing bag.
export const tierErrors = pricingErrors

if (import.meta.main) {
  let bad = 0
  for (const provider of PROVIDERS) {
    const file = `${provider}.json`
    try {
      const doc = JSON.parse(readFileSync(file, "utf8"))
      if (!Array.isArray(doc.models)) throw new Error("models must be an array")
      for (const m of doc.models) for (const error of pricingErrors(m)) {
        console.error(`${file}:${m?.model}: ${error}`)
        bad++
      }
    } catch (error) {
      console.error(`${file}: ${error instanceof Error ? error.message : error}`)
      bad++
    }
  }
  console.log(bad ? `${bad} violation(s)` : "ok")
  process.exit(bad ? 1 : 0)
}
