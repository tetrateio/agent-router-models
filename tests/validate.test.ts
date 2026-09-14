// Self-check for the pricing contract. Run: bun tests/validate.test.ts
//
// Each case is a record shape that has appeared in a catalog, or that a future
// run could reintroduce. The multiplier cases are the ones that matter: xAI and
// OpenAI both published their tier as a ratio, and the OpenAI form hid inside
// `additionalPricePerMillion.extra` where a search for "high_context" missed it.

import { tierErrors } from "../scripts/validate-catalogs.ts"

const CASES: [string, any, boolean][] = [
  ["multiplier parked in extra", { additionalPricePerMillion: { extra: { input_tokens_above_272k_multiplier: 2 } }, limits: {} }, true],
  ["legacy high_context_multiplier", { additionalPricePerMillion: { high_context_multiplier: 2 }, limits: { high_context: 200000 }, contextWindow: 500000 }, true],
  ["threshold equal to the input cap", { additionalPricePerMillion: { input_tokens_price_per_million_high_context: 4, output_tokens_price_per_million_high_context: 9 }, limits: { high_context: 272000, max_input_tokens: 272000 }, contextWindow: 400000, inputTokensPricePerMillion: "2", outputTokensPricePerMillion: "6" }, true],
  ["threshold at or above the context window", { additionalPricePerMillion: { input_tokens_price_per_million_high_context: 4, output_tokens_price_per_million_high_context: 9 }, limits: { high_context: 200000 }, contextWindow: 200000, inputTokensPricePerMillion: "2", outputTokensPricePerMillion: "6" }, true],
  ["tier prices with no threshold", { additionalPricePerMillion: { input_tokens_price_per_million_high_context: 6 }, limits: {} }, true],
  ["threshold with no tier prices", { additionalPricePerMillion: {}, limits: { high_context: 200000 }, contextWindow: 500000 }, true],
  ["tier price below the base price", { additionalPricePerMillion: { input_tokens_price_per_million_high_context: 1, output_tokens_price_per_million_high_context: 9 }, limits: { high_context: 200000 }, contextWindow: 500000, inputTokensPricePerMillion: "2", outputTokensPricePerMillion: "6" }, true],
  ["a well-formed tier", { additionalPricePerMillion: { input_tokens_price_per_million_high_context: 20, output_tokens_price_per_million_high_context: 75 }, limits: { high_context: 272000, max_input_tokens: 922000 }, contextWindow: 1050000, inputTokensPricePerMillion: "10", outputTokensPricePerMillion: "50" }, false],
  ["a flat model", { additionalPricePerMillion: { batch_input_tokens_price_per_million: 1, batch_output_tokens_price_per_million: 2 }, limits: {}, contextWindow: 1000000 }, false],
]

const tier = {
  inputTokensPricePerMillion: "10", outputTokensPricePerMillion: "40",
  contextWindow: 200000, limits: { high_context: 100000 },
  additionalPricePerMillion: {
    batch_input_tokens_price_per_million: 5,
    batch_output_tokens_price_per_million: 20,
    batch_input_tokens_price_per_million_high_context: 7,
    batch_output_tokens_price_per_million_high_context: 30,
  },
}
const withPrices = (p: any) => ({ additionalPricePerMillion: p })
CASES.push(
  ["service long-context compares with Batch, not Standard", tier, false],
  ["service long-context cannot undercut its own base", { ...tier, additionalPricePerMillion: { ...tier.additionalPricePerMillion, batch_input_tokens_price_per_million_high_context: 4 } }, true],
  ["inclusive boundary reaches an equal cap", { ...tier, limits: { high_context: 200000, high_context_comparison: "gte" } }, false],
  ["inclusive boundary cannot exceed cap", { ...tier, limits: { high_context: 200001, high_context_comparison: "gte" } }, true],
  ["invalid comparison", { ...tier, limits: { high_context: 100000, high_context_comparison: "ge" } }, true],
  ["null comparison is not omission", { ...tier, limits: { high_context: 100000, high_context_comparison: null } }, true],
  ["unknown input ceiling", { ...tier, contextWindow: null }, true],
  ["missing service output", withPrices({ flex_input_tokens_price_per_million: 1 }), true],
  ["unpublished service cache rate stays null", withPrices({ flex_input_tokens_price_per_million: 1, flex_output_tokens_price_per_million: 2, flex_cached_tokens_price_per_million: null }), false],
  ["omitted service cache rate is allowed", withPrices({ flex_input_tokens_price_per_million: 1, flex_output_tokens_price_per_million: 2 }), false],
  ["unknown service base cannot be treated as zero", { ...tier, additionalPricePerMillion: { ...tier.additionalPricePerMillion, batch_input_tokens_price_per_million: null } }, true],
  ["unknown nested tier rejected", withPrices({ service_tier_prices: { flex: { input_per_million: 1 } } }), true],
  ["raw cents are not normalized prices", withPrices({ provider_billing: { cents_per_image_unit: 5 } }), true],
  ["unknown scalar rejected", withPrices({ invented_price: 1 }), true],
  ["numeric strings rejected in additional prices", withPrices({ web_search_per_thousand_calls: "1" }), true],
  ["negative price rejected", withPrices({ web_search_per_thousand_calls: -1 }), true],
  ["infinite price rejected", withPrices({ web_search_per_thousand_calls: Infinity }), true],
  ["NaN price rejected", withPrices({ web_search_per_thousand_calls: NaN }), true],
  ["explicit free and unknown prices", withPrices({ web_search_per_thousand_calls: 0, code_execution_per_hour: null }), false],
  ["array pricing bag rejected", withPrices([]), true],
  ["null pricing bag rejected", withPrices(null), true],
  ["unknown image token key", withPrices({ image_tokens: { input_per_million: 1 } }), true],
  ["array image size table rejected", withPrices({ image_generation: { standard: [0.01] } }), true],
  ["extra nesting in image table rejected", withPrices({ image_generation: { standard: { "1K": { usd: 1 } } } }), true],
  ["empty image table rejected", withPrices({ image_generation: {} }), true],
  ["image table with arbitrary documented labels", withPrices({ image_generation: { standard: { "1K": 0.01, "1024x1024": null } } }), false],
  ["legacy factor rejected beside double-discounted rates", { inputTokensPricePerMillion: "10", outputTokensPricePerMillion: "40", additionalPricePerMillion: { batch_discount_multiplier: 0.5, batch_input_tokens_price_per_million: 2.5, batch_output_tokens_price_per_million: 10 } }, true],
  ["Batch cached price is independent of input discount", { inputTokensPricePerMillion: "10", outputTokensPricePerMillion: "40", cachedTokensPricePerMillion: "1", additionalPricePerMillion: { batch_input_tokens_price_per_million: 5, batch_output_tokens_price_per_million: 20, batch_cached_tokens_price_per_million: 1 } }, false],
  ["legacy Batch factor rejected", withPrices({ batch_discount_multiplier: 0.5 }), true],
  ["legacy factor rejected even with absolute rates", withPrices({ batch_discount_multiplier: 0.5, batch_input_tokens_price_per_million: 1, batch_output_tokens_price_per_million: 2 }), true],
  ["regional uplift below one rejected", withPrices({ regional_processing_uplift_multiplier: 0.5 }), true],
  ["legacy multiplier hidden in limits", { limits: { extra: { input_tokens_above_272k_multiplier: 2 } } }, true],
  ["numeric top-level price rejected", { inputTokensPricePerMillion: 1 }, true],
  ["exponent top-level price rejected", { inputTokensPricePerMillion: "1e9" }, true],
)

const inputImageModel = (price: any) => ({
  mode: "chat", isEnabled: false,
  inputTokensPricePerMillion: null, outputTokensPricePerMillion: null,
  cachedTokensPricePerMillion: null, cachingTokensPricePerMillion: null,
  modalities: { input: ["text", "image"], output: ["text"] },
  capabilities: ["vision"],
  additionalPricePerMillion: { input_image_price_per_image: price },
})
CASES.push(
  ["input-image price needs no token price, output image, or context limit", inputImageModel(0.0005), false],
  ["explicitly free input-image processing", inputImageModel(0), false],
  ["unpublished input-image rate remains null", inputImageModel(null), false],
  ["input-image pricing is optional for vision models", { ...inputImageModel(0.0005), additionalPricePerMillion: {} }, false],
  ["omitted input-image pricing adds no modality or capability requirement", withPrices({}), false],
  ["input-image pricing does not determine enablement", { ...inputImageModel(0.0005), isEnabled: true }, false],
  ["image-token prices remain independent", withPrices({ image_tokens: { input_image_tokens_price_per_million: 1, output_image_tokens_price_per_million: null, cached_input_image_tokens_price_per_million: 0 } }), false],
  ["input, generated, and token image rates retain separate fields", {
    ...inputImageModel(0.0005),
    additionalPricePerMillion: {
      input_image_price_per_image: 0.0005,
      image_generation: { standard: { "1024x1024": 0.02 } },
      image_tokens: { input_image_tokens_price_per_million: 3 },
    },
  }, false],
  ["input-image rate cannot be nested among image-token rates", withPrices({ image_tokens: { input_image_price_per_image: 0.0005 } }), true],
  ["generated-image pricing still requires a quality and size table", withPrices({ image_generation: 0.0005 }), true],
)
for (const [label, value] of [
  ["negative", -0.0005], ["numeric string", "0.0005"], ["infinite", Infinity],
  ["negative infinity", -Infinity], ["NaN", NaN], ["object", { usd: 0.0005 }],
  ["array", [0.0005]], ["boolean", false],
] as const) {
  CASES.push([`${label} input-image price rejected`, inputImageModel(value), true])
}
for (const [label, modalities] of [
  ["missing", undefined], ["null", null], ["string", "image"],
  ["missing input", { output: ["text"] }], ["null input", { input: null }],
  ["string input", { input: "image" }], ["object input", { input: { image: true } }],
  ["empty input", { input: [] }], ["text-only input", { input: ["text"] }],
] as const) {
  CASES.push([`input-image price rejects ${label} modalities`, { ...inputImageModel(0.0005), modalities }, true])
}
for (const [label, capabilities] of [
  ["missing", undefined], ["null", null], ["string", "vision"],
  ["object", { vision: true }], ["empty", []], ["non-vision", ["image_generation"]],
] as const) {
  CASES.push([`input-image price rejects ${label} capabilities`, { ...inputImageModel(0.0005), capabilities }, true])
}
CASES.push(
  ["free input-image rate still requires image input", { ...inputImageModel(0), modalities: { input: ["text"], output: ["text"] } }, true],
  ["null input-image rate still requires image input", { ...inputImageModel(null), modalities: { input: ["text"], output: ["text"] } }, true],
  ["free input-image rate still requires vision", { ...inputImageModel(0), capabilities: [] }, true],
  ["null input-image rate still requires vision", { ...inputImageModel(null), capabilities: [] }, true],
)

let failed = 0
for (const [name, record, shouldError] of CASES) {
  let errs: string[]
  try {
    errs = tierErrors(record)
  } catch (error) {
    console.log(`FAIL ${name}: validator threw instead of returning errors: ${error}`)
    failed++
    continue
  }
  if (errs.length > 0 !== shouldError) {
    console.log(`FAIL ${name}: expected ${shouldError ? "an error" : "no error"}, got ${JSON.stringify(errs)}`)
    failed++
  } else {
    console.log(`ok   ${name}${shouldError ? ` -> ${errs[0]}` : ""}`)
  }
}
console.log(failed ? `${failed} failed` : `${CASES.length} passed`)
process.exit(failed ? 1 : 0)
