---
name: update-models
description: Refresh every provider catalog JSON against the provider's own docs, then write the changelog block.
disable-model-invocation: true
---

# Update the provider catalogs

Refresh `anthropic.json`, `openai.json`, `gemini.json`, `xai.json`, `groq.json`,
`deepinfra.json`, `vertex.json`, and `vertexanthropic.json` against each provider's current
documentation, then write one dated block at the top of `CHANGELOG.md`.
For a focused review or correction, apply only the requested scope and state that scope in the changelog.

The work is a **drift** hunt: the delta between what a catalog record says and what the
provider publishes today. Prices move, context windows grow, models get deprecated and shut
down, and new models appear. Every catalog record is drift until you have matched it to a
provider record.

**Done means:** every model in scope has a provider match or a named exclusion or absence in the changelog.
A provider match alone does not establish field verification.
Record a source URL and status for every audited field: verified, unpublished, conflicting, unmapped, blocked, or not applicable.
A full refresh covers every catalog file, model by model, including unchanged fields.
Blocked or conflicting sources leave verification incomplete, even when structural validation passes.

`AGENTS.md` holds the field rules — accepted modes, capability mapping, the `tool_choice`
rule — and `schemas/models.ts` holds the record shape. Read both before you touch a
record. For every pricing update, also read [the shared pricing contract](../../../docs/pricing.md).
It defines units, service tiers, threshold boundaries, compatibility rules, and validation.
Batch prices use absolute `batch_*` cells. The validator rejects the removed `batch_discount_multiplier` field.
Keep supporting audits locally under ignored `audits/`; exclude them from commits.
Record material source gaps and unresolved pricing in the changelog notes.

## Per file

1. **Feed first.** Read the provider's change feed entries since its last verified coverage in `CHANGELOG.md`.
   A focused or blocked update does not advance the coverage date for unchecked models.
   The feed names launches, price changes, and retirements before you diff a table.
2. **Fetch** the provider's model index, pricing page, and deprecation page.
3. **Compare** every catalog record to its provider record with a script.
   Include prices, context window, max output, modalities, capabilities, and lifecycle fields.
   Include every existing additional-pricing key and every applicable published service table.
   Record unresolved fields separately from verified fields, including unchanged values.
4. **Apply** the drift. Prices and limits take the provider's current value.
5. **Add** models the provider lists that the catalog lacks, within the `AGENTS.md` modes.
   Apply the pricing eligibility and image-generation availability rules below before adding or enabling a record.
6. **Validate** using the shared pricing contract. Every catalog must pass `bun scripts/validate-catalogs.ts`.
   Run its regression checks after schema or pricing changes. Record blocked sources separately; validation does not complete source verification.

Batch the fetches. Providers are independent, so fetch several at once.

## Sources

Use the browser selected by the user, or the browser required by `AGENTS.md`, to verify model facts.
Use `curl` for bulk source data and scripted comparisons. WebFetch can summarize or fail on some `.md` endpoints.
If browser access is blocked, record the verification gap and continue independent work.
Record browser coverage separately from successful HTTP fetches.
If Markdown omits table dimensions or footnotes, inspect the rendered table through the selected browser.
Before marking a value unpublished, compare rendered and text scopes and preserve conflicting source evidence.
For each price or capability, verify its model, endpoint, service, and tool scope.
Official feature documentation can establish support through an explicit list of supported models.

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
- `/api/docs/models.md` — the full model index.
- `/api/docs/models/compare.md` — a comparison table that can cover only a subset of models.
- `/api/docs/models/<id>.md` — model capabilities, endpoints, limits, knowledge cutoff, reasoning efforts, and aliases.
  For each field absent from the index, fetch the model page or applicable feature documentation.
  Include models whose index values did not change.
- `/api/docs/pricing.md` — tokens, batch, fast mode, built-in tools (web search,
  containers, file search), per-token image pricing.
- `/api/docs/deprecations.md`
- `/api/docs/guides/tools.md` — which models support web search, file search, code
  interpreter, computer use → `capabilities`.
- `/api/docs/guides/tools-shell.md` — hosted shell execution semantics.
  For models with documented hosted-shell support, use `code_execution`.
  Verify the applicable tool price separately from Code Interpreter pricing.
- `/api/docs/guides/embeddings.md` — input limits and embedding output semantics.
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
- `/pricing` — token, grounding, cache, storage, Batch, Flex, and Priority prices.
  Read every applicable service table and its footnotes.
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
- Set `knowledge_cutoff` only from an explicit official value for that model.
  If the provider publishes no value, leave the field empty.

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

### DeepInfra — `api.deepinfra.com` (JSON index and model details)

- `/models/list` — fetch the unfiltered index to account for every catalog record and excluded model.
  Filters such as `?type=text-generation` and `?type=embeddings` cover only those categories.
  - Read `pricing.type` and the documented billing unit before converting a rate.
    For cents per token, multiply by 10,000 for USD per million tokens.
    For cents per image unit, divide by 100 for USD per image unit.
    Image units, images, and text tokens are distinct billing units.
    Use `image_generation` prices only for documented rates per generated image, with documented quality and size labels.
    Keep unresolved units in the local audit under the **Published but unmapped price** rule.
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
- `https://deepinfra.com/<owner>/<name>` and its API tab — validate the displayed price, billing unit, and hosted inputs/outputs.
  A category label or upstream model description does not establish the hosted endpoint's output modality.
  For example, Janus-Pro-1B lists a price per image, while its documented native endpoint returns text about an input image.
  Record a documented flat input-image charge in `input_image_price_per_image`, in USD per processed input image.
  Apply the [input image processing contract](../../../docs/pricing.md#input-image-processing) for units, required modalities, and capabilities.
  Missing token rates alone do not mean that this model has no published price.

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
  through the selected browser. Include every service tab and its footnotes.
- `/models/context-cache/context-cache-overview` — cache creation and cache-read billing semantics.
  Cache creation uses Standard input pricing. Cache reads use the separately published cache-read price.
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
import { load, dump } from "./.agents/skills/update-models/jsonfmt.ts"
const { doc, style } = load("groq.json")
// ...mutate doc...
dump("groq.json", doc, style)
```

A `style` string means a whole-file rewrite reproduces the untouched file byte for byte, so
a script may mutate `doc` and `dump` it. `style === null` means the file is hand-formatted:
edit it as text with the Edit tool, one record at a time (`dump` throws). Run `bun
.agents/skills/update-models/jsonfmt.ts` to see the current state of every file.

The guard is the point. It proves the diff contains only what you changed.

## Judgment calls

These recur every run. Decide them the same way each time.

- **Image-generation availability** — apply the provider restriction in `AGENTS.md` after availability, deprecation, and mirror handling.
  Preserve existing excluded records and verified prices, with `isEnabled: false`.
  Skip new image-generation records from excluded providers and name them under **Models that stay out of the catalog**.
  Use the catalog's `provider`, not the upstream model's publisher, for this decision.
  An allowed provider does not override retirement, missing prices, or endpoint restrictions.
- **Lifecycle scope** — match notices to exact model IDs and dated snapshots.
  Exact-ID notices take precedence over broader family notices.
  Before adding an alias, verify its lifecycle separately.
  If lifecycle sources for the same ID conflict, record the conflict instead of inferring availability.
- **Deprecated** — the provider announced an end date in the future.
  Set `deprecated`, `deprecated_date`, `retirement_date`, and `deprecated_reason` from the published notice.
  If the model meets pricing, endpoint, and provider restrictions, keep it enabled until retirement.
- **Retired** — the end date has passed.
  Set `isEnabled: false`.
  If the provider still lists the model, apply this section's pricing rules before retaining it.
  If the provider drops the model or folds its name into another model, remove the record.
  A retired slug that redirects to another model remains retired, even if the API still answers.
- **Tentative dates** — "not sooner than" and "earliest possible" are not hard cutoffs.
  Leave `retirement_date` empty and put the date in the changelog notes.
- **No published price** — before excluding a model, verify its model page, applicable pricing sources, and linked pricing guides.
  Include token, embedding, image, and other applicable billing units. Explicitly free inference counts as a published zero price.
  A numeric `input_image_price_per_image`, including zero, qualifies even when every token-price field is null.
  An ancillary tool charge or multiplier alone does not establish an inference price.
  For new models, leave them out instead of adding disabled records with empty prices.
  For existing models, remove the record only after accessible applicable sources establish that no published inference price exists.
  A missing table row alone does not establish this outcome.
  A model's presence in an index or lifecycle table does not establish a price.
  Name each exclusion and its source under **Models that stay out of the catalog**.
  A missing individual price cell remains null under the pricing contract when the model has other published inference rates.
- **Published but unmapped price** — a published rate whose unit or scope does not fit a declared field is unresolved pricing.
  Preserve its rate, unit, source, and mapping gap in the local audit and changelog **Follow-up work**.
  Keep existing records disabled if their inference prices cannot be represented. Skip new records until the mapping is resolved.
  This is distinct from no published price. Never substitute a token or generated-image rate for another billing unit.
- **Blocked pricing source** — failed access does not establish that a model has no price.
  Preserve existing records and prices. Skip additions that lack verified pricing, and record the gap under **Follow-up work**.
  Apply independent, user-requested disablement even when source verification is blocked.
- **Conflicting sources** — record both values, their scopes, and their source URLs.
  If the conflict prevents a supported correction, preserve the existing value.
  Keep a new unresolved price cell null under the pricing contract.
  Record the conflict under **Follow-up work**.
- **Groq Enterprise models** — a model Groq marks Enterprise or Contact sales stays out of
  the catalog. Remove the record when a cataloged model moves to Enterprise, and name it
  under **Models that stay out of the catalog**.
- **Pricing dimensions** — inventory every additional-pricing key and compare all published service tables.
  Use [the shared pricing contract](../../../docs/pricing.md) for dimensions, units, service rates, thresholds, and validation.
  Record published absolute service rates exactly, including rounded cache prices.
  Verify service eligibility separately from its price.
  Apply each promotion once, within its published dates and scope.
  Finish the audit only after every applicable cell has a source and a status, including unchanged cells.
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
  no OpenAI-compatible path, and no mode in `AGENTS.md` fits them. Leave them out of the
  catalog, and name them under **Models that stay out of the catalog**. Do not park them
  in `responses` — that mode means the OpenAI Responses API, and a gateway that reads it
  calls an endpoint Google does not serve.
- **Mirror** — a Vertex record for a model that also ships direct. Start from the
  `gemini.json` or `anthropic.json` record, then let the Agent Platform page overwrite
  prices, context window, capabilities, and limits. Vertex wins every disagreement, and the
  changelog names it. A capability the Agent Platform page omits stays out of the record,
  however loudly the direct-API docs claim it.
  Require hosted evidence for every copied price and capability.
  A direct-model rate or a fee for other hosted models does not establish the mirror's rate.
- **Dash-priced cell** — the Vertex pricing table prints `-` where Google publishes no
  rate. Leave the field `null` and name it under Follow-up work.
- **Out-of-mode records** — a record whose `mode` falls outside the `AGENTS.md` list
  (today: `rerank` in `deepinfra.json`). Leave the record as is and name it under
  Follow-up work until `AGENTS.md` decides.

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
