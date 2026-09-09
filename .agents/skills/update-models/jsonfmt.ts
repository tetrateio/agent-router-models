// Decide whether a catalog file can be rewritten whole, or only edited in place.
//
// Two house styles exist in this repo. `load` re-serializes the untouched file
// in each style and compares bytes. The style that matches is the one `dump`
// writes back, so the diff shows only real changes.
//
//     import { load, dump } from "./.claude/skills/update-models/jsonfmt.ts"
//     const { doc, style } = load("xai.json")
//     if (style) {
//       // ...mutate doc...
//       dump("xai.json", doc, style) // whole-file rewrite is safe
//     } else {
//       // hand-formatted: use targeted text edits
//     }
//
// `style === null` means no serializer reproduces the file byte for byte,
// usually because a human wrote or edited it. Rewriting it would reformat
// lines nobody changed. Edit those files as text instead.
//
// Run directly to report the style of every catalog in the repo:
//     bun .claude/skills/update-models/jsonfmt.ts

import { readFileSync, writeFileSync, readdirSync } from "node:fs"

const WIDTH = 80

// A number whose JSON source text differs from its JS serialization, for
// example `1.0` or `1e-05`. Keeping the source lets a rewrite reproduce the
// file byte for byte. Extends Number, so `==` and arithmetic still work;
// `===` against a plain number does not.
class RawNum extends Number {
  source: string
  constructor(value: number, source: string) {
    super(value)
    this.source = source
  }
}

const isScalar = (v: unknown) =>
  v === null || typeof v !== "object" || v instanceof RawNum

const atom = (v: unknown) =>
  v instanceof RawNum ? v.source : JSON.stringify(v)

// style "prettier": arrays inline when the line fits in 80 columns; objects
// always expand. style "expanded": everything expands (python json.dumps
// indent=2), except empty objects and arrays.
function ser(value: unknown, style: string, indent = 0, prefix = 0): string {
  const pad = " ".repeat(indent)
  if (isScalar(value)) return atom(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]"
    if (style === "prettier" && value.every(isScalar)) {
      const flat = "[" + value.map(atom).join(", ") + "]"
      if (indent + prefix + flat.length <= WIDTH) return flat
    }
    const items = value.map((v) => `${pad}  ${ser(v, style, indent + 2)}`)
    return "[\n" + items.join(",\n") + "\n" + pad + "]"
  }
  const entries = Object.entries(value as Record<string, unknown>)
  if (entries.length === 0) return "{}"
  const items = entries.map(([k, v]) => {
    const key = JSON.stringify(k)
    return `${pad}  ${key}: ${ser(v, style, indent + 2, key.length + 2)}`
  })
  return "{\n" + items.join(",\n") + "\n" + pad + "}"
}

const STYLES = ["expanded", "prettier"]

// Return { doc, style }. style is null when the file is hand-formatted.
export function load(path: string): { doc: any; style: string | null } {
  const raw = readFileSync(path, "utf8")
  const doc = JSON.parse(raw, function (this: any, _key, value, ctx?: any) {
    if (
      typeof value === "number" &&
      ctx?.source !== undefined &&
      String(value) !== ctx.source
    ) {
      return new RawNum(value, ctx.source)
    }
    return value
  })
  for (const style of STYLES) {
    if (ser(doc, style) + "\n" === raw) return { doc, style }
  }
  return { doc, style: null }
}

export function dump(path: string, doc: unknown, style: string | null): void {
  if (style === null || !STYLES.includes(style)) {
    throw new Error(
      `${path} is hand-formatted. A whole-file write reformats lines nobody ` +
        "changed. Edit it as text instead.",
    )
  }
  writeFileSync(path, ser(doc, style) + "\n")
}

if (import.meta.main) {
  for (const path of readdirSync(".")
    .filter((f) => f.endsWith(".json"))
    .sort()) {
    let doc: any
    try {
      doc = JSON.parse(readFileSync(path, "utf8"))
    } catch {
      continue
    }
    if (typeof doc !== "object" || doc === null || !("models" in doc)) continue
    const { style } = load(path)
    console.log(
      `${path.padEnd(20)} ${(style ?? "hand-formatted").padEnd(12)} ${doc.models.length} models`,
    )
  }
}
