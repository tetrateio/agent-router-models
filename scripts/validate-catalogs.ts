// Validate the pricing contract on every provider catalog: bun scripts/validate-catalogs.ts
import { readFileSync } from "node:fs"
import { catalogErrors } from "./catalog-policy.ts"
import {
  ADDITIONAL_RATE_KEYS, IMAGE_TOKEN_PRICE_KEYS, IMAGE_TOKEN_PRICE_BASES,
  IMAGE_GENERATION_PRICE_KEYS, MEDIA_TOKEN_RATE_KEYS, SERVICE_UNIT_RATE_KEYS,
  PRICING_MULTIPLIER_KEYS, PROVIDERS, SERVICE_TIERS, TOKEN_PRICE_BASES, type TokenPriceKey,
} from "../schemas/models.ts"

const TOKEN_PRICE_KEYS = Object.keys(TOKEN_PRICE_BASES) as TokenPriceKey[]
const CONTEXT_RATE_KEYS = [...TOKEN_PRICE_KEYS, ...MEDIA_TOKEN_RATE_KEYS]
// Generate runtime keys from the reference's literal declarations.
const rateKeys = new Set<string>([
  ...ADDITIONAL_RATE_KEYS,
  ...CONTEXT_RATE_KEYS.map(key => `${key}_high_context`),
  ...SERVICE_TIERS.flatMap(tier => [
    ...CONTEXT_RATE_KEYS.flatMap(key => [`${tier}_${key}`, `${tier}_${key}_high_context`]),
    ...SERVICE_UNIT_RATE_KEYS.map(key => `${tier}_${key}`),
  ]),
])
const multiplierKeys = new Set<string>(PRICING_MULTIPLIER_KEYS)
const imageKeys = new Set<string>(IMAGE_TOKEN_PRICE_KEYS)
const generationKeys = new Set<string>(IMAGE_GENERATION_PRICE_KEYS)
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
    } else if (generationKeys.has(key)) {
      if (!object(value) || !Object.keys(value).length) errors.push(`${key} must be a nonempty quality/size table`)
      else for (const [quality, sizes] of Object.entries(value)) {
        if (!quality.trim() || !object(sizes) || !Object.keys(sizes).length)
          errors.push(`${key}.${quality} must be a nonempty size table`)
        else for (const [size, v] of Object.entries(sizes)) {
          if (!size.trim()) errors.push(`${key}.${quality} has an empty size`)
          checkRate(`${key}.${quality}.${size}`, v)
        }
      }
    } else errors.push(`unknown pricing key ${key}`)
  }

  const requireModality = (path: string, direction: "input" | "output", modality: string) => {
    if (!Array.isArray(m.modalities?.[direction]) || !m.modalities[direction].includes(modality))
      errors.push(`${path} requires modalities.${direction} to include ${modality}`)
  }
  for (const prefix of ["", ...SERVICE_TIERS.map(tier => `${tier}_`)]) {
    const inputImage = `${prefix}input_image_price_per_image`
    if (inputImage in price) {
      requireModality(inputImage, "input", "image")
      if (!Array.isArray(m.capabilities) || !m.capabilities.includes("vision"))
        errors.push(`${inputImage} requires the vision capability`)
    }
    for (const key of MEDIA_TOKEN_RATE_KEYS) for (const suffix of ["", "_high_context"]) {
      const path = `${prefix}${key}${suffix}`
      if (!(path in price)) continue
      const modality = key.includes("audio") ? "audio" : key.includes("image") ? "image" : "video"
      requireModality(path, key.startsWith("output_") ? "output" : "input", modality)
    }
    // Service-specific generated-image prices describe output images, not input processing.
    if (prefix && `${prefix}image_generation` in price)
      requireModality(`${prefix}image_generation`, "output", "image")
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
  const imageTokens = object(price.image_tokens) ? price.image_tokens : {}
  const highKeys = [
    ...Object.keys(price).filter(k => rateKeys.has(k) && k.endsWith("_high_context")),
    ...Object.keys(imageTokens).filter(k => imageKeys.has(k) && k.endsWith("_high_context")),
  ]
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
    // Media rates can decrease above a threshold. Their own base rate must still be known.
    for (const key of MEDIA_TOKEN_RATE_KEYS) {
      const baseKey = `${prefix}${key}`
      const highKey = `${baseKey}_high_context`
      if (known(price[highKey]) && !known(price[baseKey]))
        errors.push(`${highKey} set but ${baseKey} is null or missing`)
    }
    for (const key of IMAGE_TOKEN_PRICE_BASES) {
      const baseKey = `${prefix}${key}`
      const highKey = `${baseKey}_high_context`
      if (known(imageTokens[highKey]) && !known(imageTokens[baseKey]))
        errors.push(`image_tokens.${highKey} set but image_tokens.${baseKey} is null or missing`)
      for (const path of [baseKey, highKey]) {
        if (path in imageTokens)
          requireModality(`image_tokens.${path}`, key.startsWith("output_") ? "output" : "input", "image")
      }
    }
  }

  return errors
}

// Retain the previous import while extending its checks to the complete pricing bag.
export const tierErrors = pricingErrors

if (import.meta.main) {
  let bad = 0
  const asOf = new Date().toISOString().slice(0, 10)
  for (const provider of PROVIDERS) {
    const file = `${provider}.json`
    try {
      const doc = JSON.parse(readFileSync(file, "utf8"))
      if (!Array.isArray(doc.models)) throw new Error("models must be an array")
      for (const m of doc.models) for (const error of [...pricingErrors(m), ...catalogErrors(m, asOf)]) {
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
