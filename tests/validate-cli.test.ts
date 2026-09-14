// Run: bun tests/validate-cli.test.ts
import { strictEqual, match } from "node:assert"
import { mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { spawnSync } from "node:child_process"
import { PROVIDERS } from "../schemas/models.ts"

const directory = mkdtempSync(join(tmpdir(), "catalog-validation-"))
const run = () => spawnSync(process.execPath, [join(import.meta.dir, "../scripts/validate-catalogs.ts")], { cwd: directory, encoding: "utf8" })
try {
  for (const provider of PROVIDERS) writeFileSync(join(directory, `${provider}.json`), '{"models":[]}')
  strictEqual(run().status, 0)
  const imageMirror = { model: "vertex/test-image", provider: "vertex", mode: "image_generation", isEnabled: true, modalities: { input: ["text"], output: ["image"] }, capabilities: ["image_generation"] }
  writeFileSync(join(directory, "vertex.json"), JSON.stringify({ models: [imageMirror] }))
  let result = run()
  strictEqual(result.status, 1, "the CLI must enforce the image-provider policy")
  match(result.stderr, /vertex.json:vertex\/test-image: image generation requires isEnabled: false/)
  imageMirror.isEnabled = false
  writeFileSync(join(directory, "vertex.json"), JSON.stringify({ models: [imageMirror] }))
  strictEqual(run().status, 0, "a disabled mirror must pass")
  const audio = { model: "test-audio", provider: "openai", mode: "chat", modalities: { input: ["text", "audio"], output: ["text"] }, capabilities: ["speech_recognition"], additionalPricePerMillion: { batch_input_tokens_price_per_million_audio: "0.5" } }
  writeFileSync(join(directory, "openai.json"), JSON.stringify({ models: [audio] }))
  result = run()
  strictEqual(result.status, 1, "the CLI must validate new media prices")
  match(result.stderr, /batch_input_tokens_price_per_million_audio must be a finite nonnegative number or null/)
  writeFileSync(join(directory, "openai.json"), '{"models":[')
  result = run()
  strictEqual(result.status, 1, "malformed JSON must fail instead of being skipped")
  match(result.stderr, /openai.json/)
  writeFileSync(join(directory, "openai.json"), '{"models":{}}')
  result = run()
  strictEqual(result.status, 1, "a malformed catalog must fail")
  match(result.stderr, /models must be an array/)
  rmSync(join(directory, "groq.json"))
  result = run()
  strictEqual(result.status, 1, "missing providers must fail")
  match(result.stderr, /groq.json/)
} finally {
  rmSync(directory, { recursive: true, force: true })
}
console.log("CLI failure checks passed")
