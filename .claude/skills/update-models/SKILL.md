---
name: update-models
description: Refresh every provider catalog JSON against the provider's own docs, then write the changelog block.
disable-model-invocation: true
---

# Update the provider catalogs

Refresh `anthropic.json`, `openai.json`, `gemini.json`, `xai.json`, `groq.json`,
`deepinfra.json`, `vertex.json`, and `vertexanthropic.json` against each provider's current
documentation, then write one dated block at the top of `CHANGELOG.md`.

The work is a **drift** hunt: the delta between what a catalog record says and what the
provider publishes today. Prices move, context windows grow, models get deprecated and shut
down, and new models appear. Every catalog record is drift until you have matched it to a
provider record.

**Done means:** every model in every catalog file is matched against a provider record, or
named in the changelog as absent from the provider's list. A file you did not compare
model by model is not done.

`CLAUDE.md` holds the field rules — accepted modes, capability mapping, the `tool_choice`
rule — and `schemas/models.ts` holds the record shape. Read both before you touch a
record. For every pricing update, also read [the shared pricing contract](../../../schemas/pricing.md).
It defines units, service tiers, threshold boundaries, migration rules, and validation.
Batch prices use absolute `batch_*` cells. The validator rejects the removed `batch_discount_multiplier` field.
Keep supporting audits locally under ignored `audits/`; exclude them from commits.
Record material source gaps and unresolved pricing in the changelog notes.

## Per file

1. **Feed first.** Read the provider's change feed entries newer than the top block of
   `CHANGELOG.md`. They name the launches, price changes, and retirements before you diff
   a single table.
2. **Fetch** the provider's model index, pricing page, and deprecation page.
3. **Compare** every catalog record to its provider record with a script, not by eye.
   Compare price, context window, max output, modalities, capabilities, and deprecation
   state. A scripted comparison is what makes "every model accounted for" checkable.
4. **Apply** the drift. Prices and limits take the provider's current value.
5. **Add** models the provider lists that the catalog lacks, within the `CLAUDE.md` modes.
6. **Validate** using the shared pricing contract. Every catalog must pass `bun schemas/validate.ts`.
   Run its regression checks after schema or pricing changes. Record blocked sources separately; validation does not complete source verification.

Batch the fetches. Providers are independent, so fetch several at once.

## Sources

Fetch with `curl`, not WebFetch. WebFetch summarizes through a small model and returns
404 on some `.md` endpoints that `curl` reads.

### Anthropic — `platform.claude.com` (append `.md` to any docs URL)

- Change feed: `/docs/en/release-notes/api.md`
- `/docs/en/about-claude/models/overview.md` — model index. The table has two cutoff
  columns; `knowledge_cutoff` takes **Reliable knowledge cutoff**, so the value stays
  stable between runs.
- `/docs/en/about-claude/pricing.md` — tokens, cache multipliers, batch, fast-mode rates,
  built-in tool pricing ($/1k searches, code execution per hour), `inference_geo` 1.1x.
- `/docs/en/about-claude/model-deprecations.md`
- `/docs/en/build-with-claude/context-windows.md` — `contextWindow`, max output,
  image/PDF-page limits per request.
- `/docs/en/build-with-claude/fast-mode.md` — which models take `fast_mode_*` prices.
  Pricing.md has the rate; only this page has eligibility, and the tiers differ: Opus 4.7
  errors on `speed: "fast"` while Opus 4.6 silently falls back and bills standard.
- `/docs/en/api/overview.md` § Request size limits — `max_file_size_mb`
  (Messages 32 MB, Files API 500 MB).
- `/docs/en/build-with-claude/prompt-caching.md` — `min_cacheable_prompt_tokens`.
- `/docs/en/agents-and-tools/tool-use/overview.md` — per-model
  `tool_use_system_prompt_tokens`.
- Anthropic sells no embedding model. `embeddings.md` documents Voyage AI, a third
  party — Voyage models stay out of the catalog.

### OpenAI — `developers.openai.com` (append `.md` to any docs URL)

- Change feed: `/api/docs/changelog.md`
- `/api/docs/models/compare.md` — one table: every model, context window, max output,
  supported endpoints. Diff this first; fetch `/api/docs/models/<id>.md` (knowledge
  cutoff, reasoning efforts, aliases) only for records that drifted.
- `/api/docs/pricing.md` — tokens, batch, fast mode, built-in tools (web search,
  containers, file search), per-token image pricing.
- `/api/docs/deprecations.md`
- `/api/docs/guides/tools.md` — which models support web search, file search, code
  interpreter, computer use → `capabilities`.
- `/api/docs/guides/fast-mode.md` — `fast_mode_*` prices (renamed from Priority
  processing on 2026-07-30; both `service_tier` values work).
- `/api/docs/guides/image-generation.md` — the per-image tier x size table
  (`low/medium/high` x `1024x1024`...) that fills `image_generation`, plus the pixel
  geometry limits (`max_edge_px`, multiples of 16px, pixel bounds, prompt length).
  Pricing.md carries only the per-token image prices.

### Gemini — `ai.google.dev/gemini-api/docs` (no `.md`; server-rendered HTML — strip tags)

- Change feed: `/changelog` (there is no `/release-notes`)
- `/models` index and `/models/<id>` — "Latest update" on the model page feeds
  `release_date`.
- `/pricing` — tokens, grounding per-thousand, context-caching plus its storage price
  (a dated increase scheduled for 2027-01-01 goes under Follow-up work), batch discount.
- `/deprecations`
- `/tokens` — how images and media convert to tokens → `image_tokens`,
  per-media token prices.
- `/interactions` — lists the agents that answer only on the Interactions API
  (`interactions.create`). Those stay out of the catalog; see Judgment calls.

### xAI — `docs.x.ai` (append `.md`)

- Change feed: `/developers/release-notes.md`
- `/developers/models.md` and `/developers/models/<id>.md` — aliases and reasoning
  efforts live on the per-model page, not the index.
- `/developers/pricing.md` — one page carries it all: tokens, cached tokens, every tool
  price per 1k calls, per-model batch discounts, priority 2x, Imagine per-image prices,
  file/collection storage rates.
- `/developers/rate-limits.md` — `limits.rpm` / `tpm`.
- Retirements live in `/developers/migration/<date>-retirement.md` pages (linked from the
  release notes), not a deprecations page. Retired slugs keep resolving: requests
  silently redirect to a replacement at that replacement's pricing. Treat the model as
  Retired even though the API still answers.
- `max_file_size_mb` comes from `/developers/files/managing-files.md` (48 MB). The
  20 MiB figure on image-understanding pages is the per-image size limit, a different
  field.
- xAI publishes no knowledge cutoffs; the field stays empty.

### Groq — `console.groq.com` (append `.md`)

- Change feed: `/docs/changelog.md`
- `/docs/models.md` — index with prices, context, max output, and rate limits inline.
  There is no pricing docs page; `groq.com/pricing` is the other price source.
- Per-model pages carry the vendor prefix: `/docs/model/openai/gpt-oss-120b.md`. An
  unprefixed path returns HTTP 200 with a "404 - Page Not Found" body — check fetched
  pages for that marker.
- `/docs/deprecations.md`
- `/docs/rate-limits.md` — `limits.tpm` / `rpm`.
- The index has no capability column. Capabilities come from the capability pages, each
  with a Supported Models list: `/docs/vision.md`, `/docs/reasoning.md`,
  `/docs/structured-outputs.md`, `/docs/prompt-caching.md`, `/docs/tool-use/overview.md`,
  and `/docs/tool-use/built-in-tools/<tool>.md` for `web_search` / `code_execution`.
- `/docs/batch.md` — 50% batch discount; it replaces, not stacks with, the cache
  discount.
- Groq publishes no knowledge cutoffs; the field stays empty.

### DeepInfra — `api.deepinfra.com` (JSON; the site is a JavaScript app with no server HTML)

- `/models/list` — the index. `?type=text-generation` (or `embeddings`) filters
  server-side to the accepted modes.
  - Prices are cents-per-token: multiply by 10,000 for dollars per million.
  - `deprecated` is a unix timestamp, not a boolean — it decides Deprecated vs Retired.
  - `pricing` also carries `discount` / `discount_ends_at` (the Promotional-price rule,
    machine-readable), `rate_per_input_token_cached` (a multiplier of the input price,
    not an absolute price), cache-write rates, and service-tier rates.
  - Tag map: `tools` → `tool_choice`, `structured-output` → `structured_outputs`
    (one model uses the underscore variant `structured_output` — match both),
    `reasoning` → `reasoning`, `multimodal` → image input → `vision`,
    `input-video` / `input-audio` add those modalities.
- `/models/<owner>/<name>` — per-model detail. `max_output_tokens` lives only here,
  absent from the list endpoint.

### Vertex / VertexAnthropic — `docs.cloud.google.com/gemini-enterprise-agent-platform`

One provider surface, two catalogs: Anthropic's models go in `vertexanthropic.json`, every
other model in `vertex.json`. Google renames this product often; the path is the stable
handle, not the name on the page.

- For `vertex.json`, use the documented model ID with this user-approved publisher
  mapping: xAI → `xai/`, Mistral (including Codestral) → `mistralai/`,
  DeepSeek → `deepseek-ai/`, Kimi → `moonshotai/`, MiniMax → `minimaxai/`,
  GPT-OSS → `openai/`, Qwen → `qwen/`, Llama → `meta/`, E5 → `intfloat/`,
  GLM → `zaiorg/`, and Gemma → `google/`.
  Apply the prefix exactly once and preserve the remaining ID and version suffix.
  Other publishers keep their documented IDs. Store this ID in `metadata.upstream_model`
  and set `model` to `vertex/` followed by that upstream ID, including for Gemini
  and embedding models. Apply each prefix exactly once. This mapping replaces the signed-in
  Model Garden card's Version name lookup and also applies to mirrored records.
- `/generative-ai/pricing` — the only price source, and the one page on this host that
  **JavaScript-renders**: `curl` returns a shell with zero `<table>` elements. Read it
  through `claude-in-chrome`. Every other page here `curl`s fine.
- Doc paths live only in the left nav, never in the page body. Harvest them from any
  fetched page: `grep -o 'href="/gemini-enterprise-agent-platform/models/[^"]*"'`.
- Google models: `/models/gemini/<slug>`, where the slug drops the dots
  (`gemini-3.8-flash` → `3-8-flash`).
- Claude: `/models/partner-models/claude` carries the descriptions,
  `/models/partner-models/claude/<slug>` carries the record.
- Grok, Mistral, Llama: `/models/partner-models/<publisher>/<slug>`.
- Open MaaS models — DeepSeek, Qwen, GLM (`zaiorg`), Kimi, MiniMax, gpt-oss (`openai`),
  Gemma (`google`), E5: `/models/maas/<publisher>/<slug>`.
- `/models/embeddings/get-text-embeddings` — `gemini-embedding-001`, `text-embedding-005`,
  and `text-multilingual-embedding-002` live only here and have no model page.
- Deprecations split three ways: `/models/deprecations/partner-models` (Claude, Jamba),
  `/models/deprecations/open-models` (every MaaS model), and the Versions block on each
  Gemini model page. `/models/deprecations` is a 404. Google deprecates the whole MaaS
  fleet in dated waves, so read the open-models page every run.
- Each model page's Capabilities table is the authority for these two catalogs, and it
  disagrees with the direct-API docs on purpose: no code execution or Files API for
  Claude, no web search for Grok, no capability table at all for Mistral.
- `backendUrls` is `https://aiplatform.googleapis.com/v1/` for every record.
  `metadata.regions` comes from the Model availability block, `metadata.launch_stage` from
  the page header.
- Vertex-only price fields: `non_global_endpoint_multiplier` 1.1 (GA Gemini 3 and later,
  from 2026-07-01), a cache-storage rate that differs from the Gemini API, and grounding
  rates that differ per generation — $14 per 1k for Gemini 3, and $35 Search / $45 Web
  Grounding / $25 Maps for Gemini 2.5.

## Keep the diff honest

`jsonfmt.ts` in this skill's folder decides how you may write a file. Run it with `bun`:

```ts
import { load, dump } from "./.claude/skills/update-models/jsonfmt.ts"
const { doc, style } = load("groq.json")
// ...mutate doc...
dump("groq.json", doc, style)
```

A `style` string means a whole-file rewrite reproduces the untouched file byte for byte, so
a script may mutate `doc` and `dump` it. `style === null` means the file is hand-formatted:
edit it as text with the Edit tool, one record at a time (`dump` throws). Run `bun
.claude/skills/update-models/jsonfmt.ts` to see the current state of every file.

The guard is the point. It proves the diff contains only what you changed.

## Judgment calls

These recur every run. Decide them the same way each time.

- **Deprecated** — the provider announced an end date in the future. Keep `isEnabled: true`,
  set `deprecated`, `deprecated_date`, `retirement_date`, and `deprecated_reason`.
- **Retired** — the end date has passed. Set `isEnabled: false` and keep the record while
  the provider still lists the model. Delete the record once the provider drops the model
  from its docs, or folds the name into another model. A retired slug that still resolves
  by redirecting to another model (xAI) is Retired.
- **Tentative dates** — "not sooner than" and "earliest possible" are not hard cutoffs.
  Leave `retirement_date` empty and put the date in the changelog notes.
- **No published price** — a model the provider lists but does not price (enterprise-only,
  contact-sales, open weights). Add it with `isEnabled: false` and `null` prices, or leave
  it out. Either way, name the model and the reason in the changelog notes.
- **Groq Enterprise models** — a model Groq marks Enterprise or Contact sales stays out of
  the catalog. Remove the record when a cataloged model moves to Enterprise, and name it
  under **Models that stay out of the catalog**.
- **Pricing dimensions** — inventory every additional-pricing key and compare all published service tables.
  Follow [the shared pricing contract](../../../schemas/pricing.md) for absolute rates, promotion scope, and exact threshold operators.
  Finish when every changed cell has a source and a declared field, or an unresolved local audit entry.
- **Long-context coverage** — verify whether each reachable tier applies to the model.
  Name verified flat models above 200k under **Prices that did not change**.
- **Promotional price** — record the price in effect today. Put the scheduled price and its
  date in the changelog under follow-up work.
- **Description edits** — update a `description` only when the provider's wording changes
  what the model does or supports. A rewording that keeps the same meaning is not drift;
  keep the record as is.
- **Unpublished metadata** — a cutoff or date the provider does not publish stays empty.
  An empty field is correct; a remembered value is drift you created.
- **Interactions-API-only models** — Google serves its agents (Deep Research, Deep
  Research Max, Antigravity) only through `interactions.create`. No `generateContent`,
  no OpenAI-compatible path, and no mode in `CLAUDE.md` fits them. Leave them out of the
  catalog, and name them under **Models that stay out of the catalog**. Do not park them
  in `responses` — that mode means the OpenAI Responses API, and a gateway that reads it
  calls an endpoint Google does not serve.
- **Mirror** — a Vertex record for a model that also ships direct. Start from the
  `gemini.json` or `anthropic.json` record, then let the Agent Platform page overwrite
  prices, context window, capabilities, and limits. Vertex wins every disagreement, and the
  changelog names it. A capability the Agent Platform page omits stays out of the record,
  however loudly the direct-API docs claim it.
- **Dash-priced cell** — the Vertex pricing table prints `-` where Google publishes no
  rate. Leave the field `null` and name it under Follow-up work.
- **Out-of-mode records** — a record whose `mode` falls outside the `CLAUDE.md` list
  (today: `rerank` in `deepinfra.json`). Leave the record as is and name it under
  Follow-up work until `CLAUDE.md` decides.

## The changelog block

Write one block at the top of `CHANGELOG.md`, headed `# YYYY-MM-DD TARS MODEL UPDATE` with
today's date. Run the `simple-english` skill over the block before you finish.

The block is for customers. The body carries what a customer acts on. Notes carry the rest.

Body sections, in order: **New Models**, **Price Changes**, **Deprecated Models**,
**Retired Models**, **Other Updates**. Prefix every entry with the provider in brackets:
`- [Gemini] ...`. Give the model, its price, its limits, and its abilities in plain words.

Notes sections, under `## Notes:` as `###` headings: **Models that are added but not
enabled**, **Corrections to earlier updates**, **Follow-up work**, **Schema and catalog
changes**, **Models that stay out of the catalog**, **Prices that did not change**,
**Sources and coverage**. A mirror catalog adds two more: **Prices that differ from the
direct-API catalogs** and **Capabilities that differ from the direct-API catalogs**.

Field names belong in Notes. `deprecated: true`, `high_context`, `isEnabled`, and the rest
of the schema vocabulary go under **Schema and catalog changes**, never in the body.

A correction to an earlier block goes under **Corrections to earlier updates** with the date
of the block you are correcting. Past blocks stay as written.
