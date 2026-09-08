// Check every catalog for a consistent long-context tier shape.
//
// The tier shape is: `limits.high_context` (an input-token threshold) plus
// absolute `*_high_context` prices in `additionalPricePerMillion`. The
// TypeScript types in models.ts cannot enforce this on JSON, because
// AdditionalPricing and ModelLimits end in a catch-all index, so this script
// does. Exit code 1 and one `file:model: reason` line per violation.
//
//     bun schemas/validate.ts
//
// ponytail: tier rules only. Add other record rules here when a run ships a
// mistake the types did not catch.

import { readFileSync, readdirSync } from "node:fs"

const TIER_KEYS: Record<string, string | null> = {
  input_tokens_price_per_million_high_context: "inputTokensPricePerMillion",
  output_tokens_price_per_million_high_context: "outputTokensPricePerMillion",
  cached_tokens_price_per_million_high_context: "cachedTokensPricePerMillion",
  caching_tokens_price_per_million_high_context: "cachingTokensPricePerMillion",
  caching_1h_per_million_high_context: null,
}
const REQUIRED = [
  "input_tokens_price_per_million_high_context",
  "output_tokens_price_per_million_high_context",
]

// A tier written as a ratio of the base price, in any bag. Providers describe
// their tier this way (xAI "2x", OpenAI "2x input and 1.5x output"); the
// catalog stores the resulting dollar amounts instead, so a reader never has to
// multiply. These patterns catch the ratio shape wherever it is parked.
const MULTIPLIER_RE = /high_context_multiplier|above_\d+k|_(?:above|over)_\d/i

/** Every key in the record's pricing and limits bags, including nested `extra`. */
function allKeys(m: any): string[] {
  const bags = [m.additionalPricePerMillion, m.additionalPricePerMillion?.extra, m.limits, m.limits?.extra]
  return bags.flatMap((b) => (b && typeof b === "object" ? Object.keys(b) : []))
}

export function tierErrors(m: any): string[] {
  const errs: string[] = []
  const price = m.additionalPricePerMillion ?? {}
  const threshold = m.limits?.high_context
  const tierKeys = Object.keys(price).filter((k) => k.includes("high_context"))

  for (const k of allKeys(m))
    if (MULTIPLIER_RE.test(k))
      errs.push(`${k} states the tier as a multiplier; write absolute *_high_context prices`)
  for (const k of tierKeys)
    if (!(k in TIER_KEYS)) errs.push(`unknown tier key ${k}`)

  const hasTier = tierKeys.length > 0 || threshold != null
  if (!hasTier) return errs

  // A prompt has to be able to exceed the threshold. `max_input_tokens` is the
  // real ceiling when the provider publishes one; otherwise the context window.
  const ceiling = m.limits?.max_input_tokens ?? m.contextWindow
  if (!(Number.isInteger(threshold) && threshold > 0))
    errs.push("tier prices need limits.high_context as a positive integer")
  else if (ceiling != null && threshold >= ceiling)
    errs.push(`limits.high_context ${threshold} is not reachable; input caps at ${ceiling}`)

  for (const k of REQUIRED)
    if (!(k in price)) errs.push(`limits.high_context set but ${k} is missing`)

  for (const [k, base] of Object.entries(TIER_KEYS)) {
    if (!(k in price) || base === null) continue
    if (m[base] == null) errs.push(`${k} set but ${base} is null`)
    else if (Number(price[k]) < Number(m[base]))
      errs.push(`${k} ${price[k]} is below ${base} ${m[base]}`)
  }
  return errs
}

if (import.meta.main) {
  let bad = 0
  for (const file of readdirSync(".").filter((f) => f.endsWith(".json")).sort()) {
    let doc: any
    try {
      doc = JSON.parse(readFileSync(file, "utf8"))
    } catch {
      continue
    }
    if (!Array.isArray(doc?.models)) continue
    for (const m of doc.models)
      for (const e of tierErrors(m)) {
        console.log(`${file}:${m.model}: ${e}`)
        bad++
      }
  }
  console.log(bad ? `${bad} violation(s)` : "ok")
  process.exit(bad ? 1 : 0)
}
