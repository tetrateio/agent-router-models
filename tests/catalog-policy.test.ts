// Run: bun tests/catalog-policy.test.ts
import assert from "node:assert/strict"
import { catalogErrors } from "../scripts/catalog-policy.ts"

const AS_OF = "2026-09-14"
const base = {
  provider: "openai", mode: "chat", isEnabled: true,
  modalities: { input: ["text"], output: ["text"] }, capabilities: [] as string[],
}
const errors = (record: unknown) => catalogErrors(record, AS_OF)
let passed = 0
let failed = 0
function test(name: string, check: () => void) {
  try { check(); passed++ }
  catch (error) { console.error(`FAIL ${name}: ${error}`); failed++ }
}

test("mixed modalities require all three capabilities", () => {
  const record = { ...base, modalities: { input: ["text", "image", "audio", "video", "document"], output: ["text", "image", "audio"] } }
  assert.deepEqual(errors(record), [
    "modalities.input image requires the vision capability",
    "modalities.input audio requires the speech_recognition capability",
    "modalities.output image requires the image_generation capability",
  ])
  assert.deepEqual(errors({ ...record, capabilities: ["vision", "speech_recognition", "image_generation"] }), [])
})
test("capability rules also apply to disabled records", () => {
  assert.equal(errors({ ...base, isEnabled: false, modalities: { input: ["audio"], output: ["image"] } }).length, 2)
})
test("output audio does not imply speech recognition", () => {
  assert.deepEqual(errors({ ...base, modalities: { input: ["text"], output: ["audio"] } }), [])
})
test("embedding output and rerank mode are not rejected", () => {
  assert.deepEqual(errors({ ...base, provider: "deepinfra", mode: "embedding", modalities: { input: ["text", "image"], output: ["embedding"] }, capabilities: ["vision"] }), [])
  assert.deepEqual(errors({ ...base, provider: "deepinfra", mode: "rerank" }), [])
})
test("legacy tool capabilities are rejected even beside tool_choice", () => {
  assert.deepEqual(errors({ ...base, capabilities: ["tool_choice", "function_calling", "parallel_function_calling"] }), [
    "function_calling is not allowed; use tool_choice",
    "parallel_function_calling is not allowed; use tool_choice",
  ])
  assert.deepEqual(errors({ ...base, capabilities: ["tool_choice"] }), [])
})

const toolCases: [string, string][] = [
  ["web_search_per_thousand_calls", "web_search"],
  ["web_search_per_thousand_sources", "web_search"],
  ["x_search_per_thousand_calls", "web_search"],
  ["x_search_per_thousand_posts", "web_search"],
  ["x_search_per_thousand_user_profiles", "web_search"],
  ["grounding_google_search_per_thousand", "web_search"],
  ["grounding_google_maps_per_thousand", "web_search"],
  ["web_grounding_enterprise_per_thousand", "web_search"],
  ["code_execution_per_thousand_calls", "code_execution"],
  ["code_execution_per_hour", "code_execution"],
  ["file_attachments_per_thousand_calls", "file_upload"],
]
for (const [key, capability] of toolCases) for (const rate of [null, 0, 10]) {
  test(`${key} at ${rate} requires its capability`, () => {
    const record = { ...base, additionalPricePerMillion: { [key]: rate } }
    assert.deepEqual(errors(record), [`${key} requires the ${capability} capability`])
    assert.deepEqual(errors({ ...record, capabilities: [capability] }), [])
  })
}
test("an omitted tool price adds no capability requirement", () => {
  assert.deepEqual(errors({ ...base, additionalPricePerMillion: {} }), [])
})
test("customer-data search does not invent unrelated capabilities", () => {
  assert.deepEqual(errors({ ...base, additionalPricePerMillion: { collections_search_per_thousand_calls: 0, grounding_your_data_per_thousand: null } }), [])
})
test("all tool violations are reported together", () => {
  assert.equal(errors({ ...base, additionalPricePerMillion: { web_search_per_thousand_calls: 0, code_execution_per_hour: null, file_attachments_per_thousand_calls: 2 } }).length, 3)
})

const imageSignals = [
  { mode: "image_generation" },
  { modalities: { input: ["text"], output: ["image"] }, capabilities: ["image_generation"] },
  { capabilities: ["image_generation"] },
]
for (const [index, signal] of imageSignals.entries()) {
  test(`image signal ${index} enforces provider and default enablement`, () => {
    for (const provider of ["anthropic", "groq", "xai", "deepinfra", "vertex", "vertexanthropic"]) {
      const record = { ...base, ...signal, provider }
      assert.deepEqual(errors(record), ["image generation requires isEnabled: false unless provider is openai or gemini"])
      assert.deepEqual(errors({ ...record, isEnabled: undefined }), errors(record))
      assert.deepEqual(errors({ ...record, isEnabled: false }), [])
    }
    for (const provider of ["openai", "gemini"])
      assert.deepEqual(errors({ ...base, ...signal, provider, isEnabled: undefined }), [])
  })
}
test("image input and vision alone leave mirrors enabled", () => {
  assert.deepEqual(errors({ ...base, provider: "vertex", modalities: { input: ["text", "image"], output: ["text"] }, capabilities: ["vision"] }), [])
  assert.deepEqual(errors({ ...base, provider: "deepinfra", capabilities: ["vision"] }), [])
})
test("only explicit false disables a record", () => {
  const { isEnabled: _, ...omitted } = { ...base, provider: "vertex", mode: "image_generation", metadata: { retirement_date: AS_OF } }
  assert.equal(errors(omitted).length, 2)
  assert.equal(errors({ ...omitted, isEnabled: null }).length, 2)
  assert.deepEqual(errors({ ...omitted, isEnabled: false }), [])
})

for (const date of ["2026-09-13", AS_OF]) {
  test(`retirement on ${date} disables explicit and default-enabled records`, () => {
    const record = { ...base, metadata: { retirement_date: date } }
    assert.match(errors(record)[0], /set isEnabled: false/)
    assert.deepEqual(errors({ ...record, isEnabled: undefined }), errors(record))
    assert.deepEqual(errors({ ...record, isEnabled: false }), [])
  })
}
test("future retirement remains enabled", () => {
  assert.deepEqual(errors({ ...base, metadata: { deprecated: true, retirement_date: "2026-09-15" } }), [])
})
test("image allowlist does not override retirement", () => {
  assert.match(errors({ ...base, mode: "image_generation", metadata: { retirement_date: AS_OF } })[0], /set isEnabled: false/)
})
for (const date of ["2026-02-29", "1900-02-29", "2026-04-31", "2026-00-10", "2026-13-01", "2026-01-00", "2026-9-14", "2026-09-14T00:00:00Z", " 2026-09-14", "not sooner than 2026-09-14", 20260914, false]) {
  test(`invalid hard retirement ${JSON.stringify(date)} is rejected even when disabled`, () => {
    assert.deepEqual(errors({ ...base, isEnabled: false, metadata: { retirement_date: date } }), ["metadata.retirement_date must be a valid YYYY-MM-DD calendar date"])
  })
}
test("valid leap days are accepted without Date rollover", () => {
  for (const date of ["2000-02-29", "2024-02-29"])
    assert.deepEqual(errors({ ...base, isEnabled: false, metadata: { retirement_date: date } }), [])
})
test("empty dates and tentative prose do not manufacture a hard cutoff", () => {
  for (const date of [undefined, null, ""])
    assert.deepEqual(errors({ ...base, metadata: { retirement_date: date, deprecated: true, deprecated_reason: "Not sooner than September 14, 2026" } }), [])
})
test("invalid asOf cannot silently bypass retirement", () => {
  assert.deepEqual(catalogErrors({ ...base, metadata: { retirement_date: AS_OF } }, "2026-02-30"), ["asOf must be a valid YYYY-MM-DD calendar date"])
})
test("malformed record containers return errors without throwing", () => {
  for (const record of [null, undefined, [], "model", 1]) assert.deepEqual(errors(record), ["model must be an object"])
  assert.deepEqual(errors({ ...base, capabilities: null, modalities: null, metadata: null, additionalPricePerMillion: null }), [])
  assert.deepEqual(errors({ ...base, modalities: { input: "image", output: "image" } }), [])
})
test("pricing shapes remain the pricing validator's responsibility", () => {
  assert.deepEqual(errors({ ...base, inputTokensPricePerMillion: -1, additionalPricePerMillion: { invented_price: "bad" } }), [])
})

console.log(`${passed} passed${failed ? `, ${failed} failed` : ""}`)
process.exitCode = failed ? 1 : 0
