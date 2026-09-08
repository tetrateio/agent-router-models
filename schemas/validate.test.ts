// Self-check for the long-context tier rules. Run: bun schemas/validate.test.ts
//
// Each case is a record shape that has appeared in a catalog, or that a future
// run could reintroduce. The multiplier cases are the ones that matter: xAI and
// OpenAI both published their tier as a ratio, and the OpenAI form hid inside
// `additionalPricePerMillion.extra` where a search for "high_context" missed it.

import { tierErrors } from "./validate.ts"

const CASES: [string, any, boolean][] = [
  ["multiplier parked in extra", { additionalPricePerMillion: { extra: { input_tokens_above_272k_multiplier: 2 } }, limits: {} }, true],
  ["legacy high_context_multiplier", { additionalPricePerMillion: { high_context_multiplier: 2 }, limits: { high_context: 200000 }, contextWindow: 500000 }, true],
  ["threshold equal to the input cap", { additionalPricePerMillion: { input_tokens_price_per_million_high_context: 4, output_tokens_price_per_million_high_context: 9 }, limits: { high_context: 272000, max_input_tokens: 272000 }, contextWindow: 400000, inputTokensPricePerMillion: "2", outputTokensPricePerMillion: "6" }, true],
  ["threshold at or above the context window", { additionalPricePerMillion: { input_tokens_price_per_million_high_context: 4, output_tokens_price_per_million_high_context: 9 }, limits: { high_context: 200000 }, contextWindow: 200000, inputTokensPricePerMillion: "2", outputTokensPricePerMillion: "6" }, true],
  ["tier prices with no threshold", { additionalPricePerMillion: { input_tokens_price_per_million_high_context: 6 }, limits: {} }, true],
  ["threshold with no tier prices", { additionalPricePerMillion: {}, limits: { high_context: 200000 }, contextWindow: 500000 }, true],
  ["tier price below the base price", { additionalPricePerMillion: { input_tokens_price_per_million_high_context: 1, output_tokens_price_per_million_high_context: 9 }, limits: { high_context: 200000 }, contextWindow: 500000, inputTokensPricePerMillion: "2", outputTokensPricePerMillion: "6" }, true],
  ["a well-formed tier", { additionalPricePerMillion: { input_tokens_price_per_million_high_context: 20, output_tokens_price_per_million_high_context: 75 }, limits: { high_context: 272000, max_input_tokens: 922000 }, contextWindow: 1050000, inputTokensPricePerMillion: "10", outputTokensPricePerMillion: "50" }, false],
  ["a flat model", { additionalPricePerMillion: { batch_discount_multiplier: 0.5 }, limits: {}, contextWindow: 1000000 }, false],
]

let failed = 0
for (const [name, record, shouldError] of CASES) {
  const errs = tierErrors(record)
  if (errs.length > 0 !== shouldError) {
    console.log(`FAIL ${name}: expected ${shouldError ? "an error" : "no error"}, got ${JSON.stringify(errs)}`)
    failed++
  } else {
    console.log(`ok   ${name}${shouldError ? ` -> ${errs[0]}` : ""}`)
  }
}
console.log(failed ? `${failed} failed` : `${CASES.length} passed`)
process.exit(failed ? 1 : 0)
