// Run: bun schemas/validate-cli.test.ts
import { strictEqual, match } from "node:assert"
import { mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { spawnSync } from "node:child_process"
import { PROVIDERS } from "./models.ts"

const directory = mkdtempSync(join(tmpdir(), "catalog-validation-"))
const run = () => spawnSync(process.execPath, [join(import.meta.dir, "validate.ts")], { cwd: directory, encoding: "utf8" })
try {
  for (const provider of PROVIDERS) writeFileSync(join(directory, `${provider}.json`), '{"models":[]}')
  strictEqual(run().status, 0)
  writeFileSync(join(directory, "openai.json"), '{"models":[')
  let result = run()
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
