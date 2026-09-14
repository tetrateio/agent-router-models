# 2026-09-11 TARS MODEL UPDATE

## Pricing contract and migration:

- `schemas/models.ts` now defines a closed additional-pricing contract shared with the runtime validator. Token rates use explicit service prefixes and optional `_high_context` suffixes.
- Direct xAI records use `limits.high_context_comparison: "gte"` at 200,000 input tokens. An omitted comparison retains the existing `gt` behavior, including Vertex mirrors.
- Migrated 158 models from provisional nested pricing, service multipliers, and regional `extra` fields.
- Preserved 44 raw billing entries in local evidence files as unresolved mappings. The catalog cannot calculate those image-unit, media, or native-service charges. Existing availability flags remain unchanged by this shape migration.
- Removed `batch_discount_multiplier` from all 137 affected records and from the schema. Existing absolute Batch rates remain intact; 105 records gain explicit input/output cells. Unknown prices remain null.
- Batch prices use provider-specific cache and long-context cells. Readers must use absolute Batch prices directly; removing the factor is a breaking change.
- Groq receives only an arithmetic conversion of its two existing Batch entries; current source verification remains blocked. Separate Batch media dimensions are not inferred.
- Both local update skills now share [one pricing contract](docs/pricing.md), including source coverage, exact thresholds, and promotion rules. Production consumer compatibility remains unverified outside this repository.

## New Models:

- [OpenAI] `gpt-image-2.5-sunburst` and `gpt-image-2.5-flare` launched on September 8 and generate or edit images from text and images. Text input costs $5 and cached text input costs $1.25 per 1M tokens. Image input costs $8, cached image input costs $2, and image output costs $30 per 1M tokens. Both support six quality settings. Images can contain up to 8,294,400 pixels, with a maximum edge of 3,840 pixels. OpenAI does not publish a fixed price per image for these models.
- [OpenAI] `gpt-audio-1.5`, `gpt-audio`, and `gpt-audio-mini` accept text and audio through Chat Completions. They return text or audio and support tool calls. Each has a 128,000-token context and a 16,384-token output limit. Text input/output costs $2.50/$10 for the first two models and $0.60/$2.40 for Mini, per 1M tokens. Audio input/output costs $32/$64 for the first two models and $10/$20 for Mini, per 1M tokens.
- [DeepInfra] `deepseek-ai/DeepSeek-V4.1-Flash` accepts text and images and returns text. It supports reasoning, tool calls, structured output, and prompt caching. Context is 1,048,576 tokens; maximum output is 131,072 tokens. Input costs $0.20, cached input costs $0.006, and output costs $0.60 per 1M tokens.
- [DeepInfra] `inclusionAI/Ling-3.0-flash-VL` accepts text, images, and video and returns text. It supports reasoning, tool calls, structured output, and prompt caching. Context is 131,072 tokens; maximum output is 32,768 tokens. Input costs $0.06, cached input costs $0.012, and output costs $0.18 per 1M tokens.
- [DeepInfra] Added 24 available image models from Black Forest Labs, Bria, ByteDance, Google, PrunaAI, Qwen, Stability AI, and Wan. These models accept text; some also accept images. The table below gives their billing rates. Provider billing units can depend on image size and generation steps.
- [Vertex] `gemini-3-flash-preview` accepts text, images, audio, video, and PDF documents. It supports reasoning, tool calls, structured output, search, code execution, and computer use. Context is 1,048,576 tokens; maximum output is 65,536 tokens. Text input costs $0.50, cached text input costs $0.05, and output costs $3 per 1M tokens. Audio input costs $1 per 1M tokens.

| Model | Published billing rate | Input | Billing basis or limit |
| --- | --- | --- | --- |
| [DeepInfra] `black-forest-labs/FLUX-1-schnell` | $0.0005 per image unit | text | 1024 × 1024 pixels; 1 steps |
| [DeepInfra] `black-forest-labs/FLUX-2-pro` | $0.015 per image unit | text + image | Usage comes from provider-reported cost |
| [DeepInfra] `Bria/fibo_edit` | $0.04 per image unit | text + image | No token-context limit published |
| [DeepInfra] `Bria/Bria-3.2-vector` | $0.04 per image unit | text | No token-context limit published |
| [DeepInfra] `stabilityai/sdxl-turbo` | $0.0002 per image unit | text | 1024 × 1024 pixels; 5 steps |
| [DeepInfra] `google/gemini-3-pro-image` | $120 per 1M billed image tokens | text + image | No token-context limit published |
| [DeepInfra] `black-forest-labs/FLUX-1-dev` | $0.009 per image unit | text | 1024 × 1024 pixels; 25 steps |
| [DeepInfra] `black-forest-labs/FLUX-2-max` | $0.1 per image unit | text + image | Usage comes from provider-reported cost |
| [DeepInfra] `Qwen/Qwen-Image-Max` | $0.075 per image unit | text | No token-context limit published |
| [DeepInfra] `Qwen/Qwen-Image-Edit` | $0.025 per image unit | text + image | 1024 × 1024 pixels; 25 steps |
| [DeepInfra] `google/nano-banana-2-lite` | $30 per 1M billed image tokens | text + image | No token-context limit published |
| [DeepInfra] `black-forest-labs/FLUX-2-klein-9b` | $0.015 per image unit | text + image | 1024 × 1024 pixels |
| [DeepInfra] `Bria/expand` | $0.04 per image unit | text + image | No token-context limit published |
| [DeepInfra] `google/nano-banana-pro` | $120 per 1M billed image tokens | text + image | No token-context limit published |
| [DeepInfra] `Bria/fibo` | $0.04 per image unit | text + image | No token-context limit published |
| [DeepInfra] `black-forest-labs/FLUX-2-klein-4b` | $0.014 per image unit | text + image | 1024 × 1024 pixels |
| [DeepInfra] `google/nano-banana-2` | $60 per 1M billed image tokens | text + image | No token-context limit published |
| [DeepInfra] `Wan-AI/Wan2.6-T2I` | $0.03 per image unit | text | No token-context limit published |
| [DeepInfra] `black-forest-labs/FLUX.1-Kontext-dev` | $0.01 per image unit | text + image | 1024 × 1024 pixels; 25 steps |
| [DeepInfra] `black-forest-labs/FLUX-1.1-pro` | $0.04 per image unit | text | No token-context limit published |
| [DeepInfra] `ByteDance/Seedream-4` | $0.04 per image unit | text + image | No token-context limit published |
| [DeepInfra] `black-forest-labs/FLUX-2-dev` | $0.01 per image unit | text + image | 1024 × 1024 pixels; 28 steps |
| [DeepInfra] `PrunaAI/p-image` | $0.005 per image unit | text | No token-context limit published |
| [DeepInfra] `Bria/Bria-3.2` | $0.04 per image unit | text | No token-context limit published |


## Price Changes:

- [DeepInfra] The following prices include the active promotional discount. Amounts are USD per 1M tokens. The provider gives no promotion end dates.

| Model | Input: previous → current | Cached input: previous → current | Output: previous → current |
| --- | --- | --- | --- |
| [DeepInfra] `stepfun-ai/Step-3.7-Flash` | $0.2 → $0.16 | $0.04 → $0.032 | $1.15 → $0.92 |
| [DeepInfra] `tencent/Hy3` | $0.14 → $0.07 | $0.035 → $0.0175 | $0.58 → $0.29 |
| [DeepInfra] `XiaomiMiMo/MiMo-V2.5` | $0.4 → $0.133 | $0.08 → $0.00266 | $2 → $0.266 |
| [DeepInfra] `XiaomiMiMo/MiMo-V2.5-Pro` | $1 → $0.39 | $0.2 → $0.078 | $3 → $1.17 |
| [DeepInfra] `zai-org/GLM-5.2` | $0.75 → $0.4875 | $0.14 → $0.091 | $2.4 → $1.56 |
| [DeepInfra] `zai-org/GLM-5.3-Flash` | $0.15 → $0.075 | $0.03 → $0.015 | $0.5 → $0.25 |
| [DeepInfra] `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp` | $0.44 → $0.2156 | $0.14 → $0.00686 | $1.32 → $0.6468 |


- [Gemini] `gemini-robotics-er-2-preview` input/output prices fall from $2/$10 to $1/$5 per 1M tokens through December 31, 2026. Cached input falls from $0.20 to $0.10. Cache storage falls from $1 to $0.50 per 1M tokens per hour.
- [Gemini] `gemini-robotics-er-2-streaming-preview` also costs $1/$5 for input/output per 1M tokens through December 31. Its Live API requirement still prevents catalog access.
- [DeepInfra] `zai-org/GLM-5.2` cache writes cost $0.609375 for five-minute retention and $0.975 for one-hour retention, per 1M tokens.

## Deprecated Models:

- [OpenAI] `gpt-audio` and `gpt-audio-mini` retire on January 20, 2027. OpenAI announced this on July 20. Both remain available. The replacement is `gpt-audio-1.5`.
- [xAI] `grok-imagine-image-quality` remains available until November 2, 2026. We restored catalog access during the notice period. After retirement, xAI redirects requests to `grok-imagine-image-2.0` at low quality.

## Retired Models:

- [DeepInfra] `MiniMaxAI/MiniMax-M2.7`, `zai-org/GLM-5`, and `zai-org/GLM-4.7-Flash` shut down on September 10. Their replacements are `MiniMaxAI/MiniMax-M3`, `zai-org/GLM-5.2`, and `zai-org/GLM-5.3-Flash`, respectively.
- [DeepInfra] Added 89 disabled historical records that the provider still lists. These are catalog coverage additions, not new shutdown announcements. Local evidence files record each model and its source.

## Other Updates:

- [DeepInfra] Added published maximum output limits to 44 existing records. Added prompt caching and service tier rates where the provider lists them.
- [OpenAI] Corrected the Daybreak names to `gpt-daybreak-blue-latest` and `gpt-daybreak-red-latest`. Both still require separate provider approval. Added published streaming, file search, and prompt caching support where missing.
- [OpenAI] Added 68 published Batch, Flex, and Fast price rows across 32 records. These additions include exact cached rates and published long-context rates.
- [OpenAI] Removed unsupported code execution claims from `gpt-5.3-codex` and `gpt-5.2-codex`. Removed file search claims from the two deep-research models. Their current model pages do not list these abilities.
- [OpenAI] Removed incorrect deprecation flags from `gpt-4o`, `gpt-4o-2024-08-06`, and `gpt-4o-2024-11-20`. OpenAI gives no shutdown date for these names. The May 2024 snapshot still retires on October 23.
- [Gemini] Added documented file search support. Added video input to the two Gemini 3.1 image models and PDF input to Flash-Lite Image. Removed unsupported tool calls from Flash-Lite Image. Removed unsupported caching and structured output from Gemini 2.5 Flash Image.
- [Vertex] Gemini 2.5 Flash Image accepts at most 32,768 input tokens, rather than the catalog's previous 65,536. Added documented PDF, video, and system instruction support to affected Gemini records.
- [VertexAnthropic] Restored access to `claude-opus-4-1`. Google gives an earliest possible retirement date, not a confirmed shutdown. Removed tentative shutdown dates and abilities absent from Google's capability tables.

## Notes:

### Models that are added but not enabled

- [DeepInfra] These 11 active models lack a published OpenAI-compatible endpoint flag. Their native endpoints remain documented. They have no catalog backend URL until compatible routing is established.

- [DeepInfra] `ClarityAI/flux`.
- [DeepInfra] `ByteDance/Seedream-4.5`.
- [DeepInfra] `deepseek-ai/Janus-Pro-7B`.
- [DeepInfra] `Wan-AI/Wan2.6-Image-Edit`.
- [DeepInfra] `PrunaAI/p-image-Edit`.
- [DeepInfra] `Bria/gen_fill`.
- [DeepInfra] `Bria/replace_background`.
- [DeepInfra] `Wan-AI/Wan2.7-Image-Edit`.
- [DeepInfra] `ClarityAI/creative`.
- [DeepInfra] `Qwen/Qwen-Image-Edit-Max`.
- [DeepInfra] `deepseek-ai/Janus-Pro-1B`.

- [DeepInfra] The 89 historical additions remain disabled because their published shutdown dates have passed.
- [Vertex] `multimodalembedding@001` accepts text, images, and video and returns embeddings. Text context is 32 tokens. The pricing table uses an undefined “count” unit for text and video. The record preserves those prices but remains disabled until billing units are clear.

### Corrections to earlier updates

- [DeepInfra] The September 7 and September 8 blocks retained list prices despite active promotions. This update records the prices billed today. The September 7 cached price for `DeepSeek-V4-Flash-Vision-Exp` was also wrong. Its undiscounted cached rate is $0.014, not $0.14, per 1M tokens.
- [DeepInfra] The September 7 block said retired model pages were unavailable. The provider's detail API still returns historical records. We used those records to complete catalog coverage.
- [DeepInfra] The September 7 block reported July shutdown dates for MiniMax-M2.1 and MiniMax-M2.5. The current provider timestamps give September 10. Both remain disabled.
- [VertexAnthropic] Earlier records treated “not sooner than” dates as confirmed retirements. This update removes those hard dates. Opus 4 and Sonnet 4 remain disabled because Google publishes no current prices for them.
- [Vertex] The September 7 block said Gemini 3 Flash had no output price. The current pricing table publishes $3 per 1M output tokens.
- [OpenAI] The September 7 block said Fast prices could not fit the schema. Provider-specific pricing fields can hold them. This update adds the published rates.
- [OpenAI] The September 8 block used Daybreak names without the required `gpt-` prefix. This update corrects both names and source links.
- [xAI] The September 7 notice gave a November shutdown date, but the record was already disabled. This update restores access before that date.

### Follow-up work

- [Groq] All five model checks remain blocked. The documentation host returned HTTP 403, Browser reported a blocked request, and the public pricing URL redirected to the homepage. Model facts and Standard prices remain unchanged; the Batch shape migration converts two existing factors to absolute rates. The affected names are `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.6-27b`, `qwen/qwen3.8-27b`, and `openai/gpt-oss-safeguard-20b`.
- [Gemini] On January 1, 2027, Robotics ER 2 input/output returns to $2/$10 per 1M tokens. Cached input returns to $0.20 and storage to $1 per 1M tokens per hour. The streaming variant also returns to $2/$10.
- [Gemini] On January 1, 2027, Gemini 3.8, 3.7, and 3.6 Flash input/output rises to $1.50/$7.50 per 1M tokens. Cached input rises to $0.15 and cache storage to $1 per 1M tokens per hour.
- [DeepInfra] Promotion end dates remain unpublished. The next run must check all seven discounts again. Their undiscounted input/cached/output rates are listed below.

| Model | Discount | List input | List cached input | List output |
| --- | --- | --- | --- | --- |
| [DeepInfra] `stepfun-ai/Step-3.7-Flash` | 20% | $0.2 | $0.04 | $1.15 |
| [DeepInfra] `tencent/Hy3` | 50% | $0.14 | $0.035 | $0.58 |
| [DeepInfra] `XiaomiMiMo/MiMo-V2.5` | 5% | $0.14 | $0.0028 | $0.28 |
| [DeepInfra] `XiaomiMiMo/MiMo-V2.5-Pro` | 61% | $1 | $0.2 | $3 |
| [DeepInfra] `zai-org/GLM-5.2` | 35% | $0.75 | $0.14 | $2.4 |
| [DeepInfra] `zai-org/GLM-5.3-Flash` | 50% | $0.15 | $0.03 | $0.5 |
| [DeepInfra] `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp` | 51% | $0.44 | $0.014 | $1.32 |


- [OpenAI] GPT-5.6 Sol promotional pricing lasts at least through November 21, 2026. OpenAI gives no definite increase date or replacement rate.
- [OpenAI] Some Batch, Flex, and Fast long-context cells contain a dash. The added service tables do not infer rates for those cells. GPT Image 2.5 has no published fixed per-image table. GPT Image 2's calculator does not estimate its token use.
- [OpenAI] GPT-6 Astra Fast mode is unavailable with EU data residency.
- [xAI] Grok Imagine Image 2.0 has one published $0.04 rate. The separate medium-quality price remains unpublished. Automatic quality selection can choose medium for editing; a medium price must not be inferred from the low price.
- [Vertex] The pricing page lists Gemini 2.5 Pro Computer Use Preview. Current model navigation did not establish its hosted model ID and limits. It remains outside the catalog pending that match.
- [VertexAnthropic] These earliest possible retirement dates are not confirmed shutdown dates.

| Model | Earliest possible date |
| --- | --- |
| [VertexAnthropic] `claude-fable-5-1` | 2027-03-01 |
| [VertexAnthropic] `claude-opus-5` | 2027-01-24 |
| [VertexAnthropic] `claude-sonnet-5` | 2026-12-24 |
| [VertexAnthropic] `claude-fable-5` | 2027-06-08 |
| [VertexAnthropic] `claude-opus-4-8` | 2027-05-28 |
| [VertexAnthropic] `claude-opus-4-7` | 2027-04-16 |
| [VertexAnthropic] `claude-opus-4-6` | 2027-02-05 |
| [VertexAnthropic] `claude-opus-4-5` | 2026-11-24 |
| [VertexAnthropic] `claude-sonnet-4-5` | 2026-09-29 |
| [VertexAnthropic] `claude-haiku-4-5` | 2026-10-15 |
| [VertexAnthropic] `claude-opus-4-1` | 2026-08-05 |
| [VertexAnthropic] `claude-opus-4` | 2026-05-14 |
| [VertexAnthropic] `claude-sonnet-4` | 2026-05-14 |

- [DeepInfra] Existing rerank records remain unchanged because AGENTS.md does not accept that mode. Local evidence files name those records.

### Schema and catalog changes

- [All] The catalogs contain 510 records after this update. Local comparison reports distinguish verified fields from fields not extracted.
- [Anthropic] Removed six names absent from the current index, ID guide, and retirement history: `claude-4-opus-20250514`, `claude-4-sonnet-20250514`, `claude-3-5-sonnet-latest`, `claude-3-opus-latest`, `claude-instant-1`, and `claude-2`.
- [DeepInfra] Local evidence files preserve raw image billing units and defaults. These do not map safely to flat per-image or text-token prices. New image records keep top-level token prices null. Native-only records keep `backendUrls` empty and `isEnabled` false.
- [DeepInfra] Flat Priority and Flex fields contain absolute rates, calculated once from current promotional token prices. GLM-5.2 explicit cache retention uses blocks of 1,024 tokens.
- [OpenAI] Flat `batch_*`, `flex_*`, and `fast_mode_*` fields store absolute service rates, including long-context overrides. Null cached cells remain null. Missing cached rates cannot be inferred from Standard prices.
- [VertexAnthropic] Removed `structured_outputs` from all 14 records because Google's model capability tables omit it. Removed `reasoning` from Fable 5.1, Opus 5, Sonnet 5, Fable 5, and Opus 4.5 for the same reason.
- [All] Pricing validation covers every catalog, including unknown keys, numeric units, media tables, and service-specific long-context rates. Regression checks cover invalid pricing and CLI failures.
- [All] `schemas/` contains the TypeScript reference in `models.ts` and `providers.ts`. Pricing guidance moves to `docs/pricing.md`. Runtime validation moves to `scripts/validate-catalogs.ts`, and ongoing regression checks move to `tests/`. Completed migration helpers and their tests remain in ignored local artifacts. `README.md` documents the layout, validation commands, and both updater skills.

### Models that stay out of the catalog

- [Anthropic] Voyage embedding models belong to another provider. Anthropic does not host an embedding model in this catalog.
- [OpenAI] `gpt-oss-120b` and `gpt-oss-20b` are open-weight models without hosted OpenAI prices. `gpt-5.4-cyber` has no published price. `gpt-5.5-cyber` lacks a standalone model page establishing its limits and abilities. Realtime-only, transcription, speech-only, video, moderation, and legacy completion endpoints do not match the accepted modes.
- [Gemini] Gemma 4 has no paid API price. Deep Research, Deep Research Max, and Antigravity use the Interactions API. Omni video models, Live-only models, speech models, Veo, and Lyria do not provide an accepted catalog route.
- [Groq] Enterprise-only models stay out. The accessible release notes identify MiniMax-M2.5 and Qwen3-VL-32B as Enterprise models. The current full list remains blocked.
- [DeepInfra] These image utilities have no text prompt input: `ClarityAI/crystal`, `Bria/blur_background`, `black-forest-labs/FLUX-1-Redux-dev`, `Bria/remove_background`, `Bria/erase`, `Bria/enhance`, and `Bria/erase_foreground`.
- [Vertex] Gemini Robotics ER has no listed hosted price. Imagen's discontinued endpoints remain outside this catalog despite historical pricing rows. Google's Imagen migration table lists the following discontinued names.

- [Vertex] `imagegeneration@002`.
- [Vertex] `imagegeneration@003`.
- [Vertex] `imagegeneration@004`.
- [Vertex] `imagegeneration@005`.
- [Vertex] `imagegeneration@006`.
- [Vertex] `imagetext@001`.
- [Vertex] `imagen-3.0-capability-001`.
- [Vertex] `imagen-3.0-capability-002`.
- [Vertex] `imagen-3.0-fast-generate-001`.
- [Vertex] `imagen-3.0-generate-001`.
- [Vertex] `imagen-3.0-generate-002`.
- [Vertex] `imagen-4.0-fast-generate-001`.
- [Vertex] `imagen-4.0-generate-001`.
- [Vertex] `imagen-4.0-ultra-generate-001`.

### Prices that did not change

- [Anthropic] Current standard token rates match the model pages. Historical retired records retain prices where current pages no longer publish them.
- [OpenAI] Existing standard token rates remain unchanged. The new service tables add coverage rather than change the provider's rates.
- [xAI] All seven text-model standard and long-context rates match the current pricing table. Image base rates remain unchanged.
- [Gemini] Existing prices outside Robotics ER 2 remain unchanged. The Pro models retain their documented long-context tiers.
- [Vertex] Existing published standard prices remain unchanged. The two Claude models without current prices remain disabled.
- [All] The following models have contexts above 200,000 tokens and no separate high-context surcharge. Each source lists one rate across the allowed input range. Groq is excluded from this statement because its checks remain blocked.

- [Anthropic] `claude-opus-5`.
- [Anthropic] `claude-fable-5-1`.
- [Anthropic] `claude-fable-5`.
- [Anthropic] `claude-opus-4-8`.
- [Anthropic] `claude-sonnet-5`.
- [Anthropic] `claude-opus-4-7`.
- [Anthropic] `claude-sonnet-4-6`.
- [Anthropic] `claude-opus-4-6`.
- [OpenAI] `chat-latest`.
- [OpenAI] `gpt-5-nano`.
- [OpenAI] `gpt-5-mini`.
- [OpenAI] `gpt-5`.
- [OpenAI] `gpt-5.3-codex`.
- [OpenAI] `gpt-5-pro`.
- [OpenAI] `gpt-5.2-pro`.
- [OpenAI] `gpt-5.2`.
- [OpenAI] `gpt-5.1`.
- [OpenAI] `gpt-4.1`.
- [OpenAI] `gpt-4.1-mini`.
- [OpenAI] `gpt-4.1-nano`.
- [OpenAI] `gpt-5.4-mini`.
- [OpenAI] `gpt-5.4-nano`.
- [Gemini] `gemini-3.8-flash`.
- [Gemini] `gemini-3.7-flash`.
- [Gemini] `gemini-3.6-flash`.
- [Gemini] `gemini-3.5-flash`.
- [Gemini] `gemini-3.5-flash-lite`.
- [Gemini] `gemini-3.1-flash-lite`.
- [Gemini] `gemini-3-flash-preview`.
- [Gemini] `gemini-2.5-flash`.
- [Gemini] `gemini-2.5-flash-lite`.
- [DeepInfra] `deepinfra/anthropic/claude-fable-5`.
- [DeepInfra] `deepinfra/anthropic/claude-opus-4-7`.
- [DeepInfra] `deepinfra/anthropic/claude-opus-4-8`.
- [DeepInfra] `deepinfra/anthropic/claude-opus-5`.
- [DeepInfra] `deepinfra/anthropic/claude-sonnet-4-6`.
- [DeepInfra] `deepinfra/anthropic/claude-sonnet-5`.
- [DeepInfra] `deepinfra/ByteDance/Seed-1.8`.
- [DeepInfra] `deepinfra/ByteDance/Seed-2.0-code`.
- [DeepInfra] `deepinfra/ByteDance/Seed-2.0-mini`.
- [DeepInfra] `deepinfra/ByteDance/Seed-2.0-pro`.
- [DeepInfra] `deepinfra/deepseek-ai/DeepSeek-V4-Flash`.
- [DeepInfra] `deepinfra/deepseek-ai/DeepSeek-V4-Flash-0731`.
- [DeepInfra] `deepinfra/deepseek-ai/DeepSeek-V4-Pro`.
- [DeepInfra] `deepinfra/deepseek-ai/DeepSeek-V4-Pro-0813`.
- [DeepInfra] `deepinfra/google/gemini-2.5-flash`.
- [DeepInfra] `deepinfra/google/gemini-2.5-pro`.
- [DeepInfra] `deepinfra/google/gemini-3.1-flash-lite`.
- [DeepInfra] `deepinfra/google/gemini-3.1-pro`.
- [DeepInfra] `deepinfra/google/gemini-3.5-flash`.
- [DeepInfra] `deepinfra/google/gemini-3.7-flash`.
- [DeepInfra] `deepinfra/google/gemma-4-26B-A4B-it`.
- [DeepInfra] `deepinfra/google/gemma-4-31B-it`.
- [DeepInfra] `deepinfra/google/gemma-4-31B-it-turbo`.
- [DeepInfra] `deepinfra/meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8`.
- [DeepInfra] `deepinfra/meta-llama/Llama-4-Scout-17B-16E-Instruct`.
- [DeepInfra] `deepinfra/MiniMaxAI/MiniMax-M3`.
- [DeepInfra] `deepinfra/moonshotai/Kimi-K2.6`.
- [DeepInfra] `deepinfra/moonshotai/Kimi-K2.7-Code`.
- [DeepInfra] `deepinfra/moonshotai/Kimi-K3`.
- [DeepInfra] `deepinfra/nvidia/Nemotron-3-Nano-30B-A3B`.
- [DeepInfra] `deepinfra/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B`.
- [DeepInfra] `deepinfra/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B`.
- [DeepInfra] `deepinfra/nvidia/NVIDIA-Nemotron-3.5-Lightning`.
- [DeepInfra] `deepinfra/Qwen/Qwen3-235B-A22B-Instruct-2507`.
- [DeepInfra] `deepinfra/Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo`.
- [DeepInfra] `deepinfra/Qwen/Qwen3-Max`.
- [DeepInfra] `deepinfra/Qwen/Qwen3-Max-Thinking`.
- [DeepInfra] `deepinfra/Qwen/Qwen3-Next-80B-A3B-Instruct`.
- [DeepInfra] `deepinfra/Qwen/Qwen3-VL-235B-A22B-Instruct`.
- [DeepInfra] `deepinfra/Qwen/Qwen3-VL-30B-A3B-Instruct`.
- [DeepInfra] `deepinfra/Qwen/Qwen3.5-122B-A10B`.
- [DeepInfra] `deepinfra/Qwen/Qwen3.5-27B`.
- [DeepInfra] `deepinfra/Qwen/Qwen3.5-35B-A3B`.
- [DeepInfra] `deepinfra/Qwen/Qwen3.5-397B-A17B`.
- [DeepInfra] `deepinfra/Qwen/Qwen3.5-9B`.
- [DeepInfra] `deepinfra/Qwen/Qwen3.6-27B`.
- [DeepInfra] `deepinfra/Qwen/Qwen3.6-35B-A3B`.
- [DeepInfra] `deepinfra/Qwen/Qwen3.7-Max`.
- [DeepInfra] `deepinfra/Qwen/Qwen3.8-2.4T-A95B`.
- [DeepInfra] `deepinfra/Qwen/Qwen3.8-27B`.
- [DeepInfra] `deepinfra/Qwen/Qwen3.8-Max`.
- [DeepInfra] `deepinfra/stepfun-ai/Step-3.7-Flash`.
- [DeepInfra] `deepinfra/tencent/Hy3`.
- [DeepInfra] `deepinfra/thinkingmachines/Inkling`.
- [DeepInfra] `deepinfra/thinkingmachines/Inkling-Small`.
- [DeepInfra] `deepinfra/XiaomiMiMo/MiMo-V2.5`.
- [DeepInfra] `deepinfra/XiaomiMiMo/MiMo-V2.5-Pro`.
- [DeepInfra] `deepinfra/zai-org/GLM-4.6`.
- [DeepInfra] `deepinfra/zai-org/GLM-4.7`.
- [DeepInfra] `deepinfra/zai-org/GLM-5.1`.
- [DeepInfra] `deepinfra/zai-org/GLM-5.2`.
- [DeepInfra] `deepinfra/zai-org/GLM-5.3-Flash`.
- [DeepInfra] `deepinfra/zai-org/GLM-5.3`.
- [DeepInfra] `deepinfra/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp`.
- [DeepInfra] `deepinfra/inclusionAI/Ling-3.0-flash-Fin`.
- [DeepInfra] `deepinfra/deepseek-ai/DeepSeek-V4.1-Flash`.
- [Vertex] `vertex/gemini-3.8-flash`.
- [Vertex] `vertex/gemini-3.7-flash`.
- [Vertex] `vertex/gemini-3.6-flash`.
- [Vertex] `vertex/gemini-3.5-flash`.
- [Vertex] `vertex/gemini-3.5-flash-lite`.
- [Vertex] `vertex/gemini-3.1-flash-lite`.
- [Vertex] `vertex/gemini-2.5-flash`.
- [Vertex] `vertex/gemini-2.5-flash-lite`.
- [Vertex] `vertex/moonshotai/kimi-k2-thinking-maas`.
- [Vertex] `vertex/qwen/qwen3-235b-a22b-instruct-2507-maas`.
- [Vertex] `vertex/qwen/qwen3-coder-480b-a35b-instruct-maas`.
- [Vertex] `vertex/qwen/qwen3-next-80b-a3b-instruct-maas`.
- [Vertex] `vertex/qwen/qwen3-next-80b-a3b-thinking-maas`.
- [Vertex] `vertex/zaiorg/glm-5.2-maas`.
- [Vertex] `vertex/google/gemma-4-26b-a4b-it-maas`.
- [Vertex] `vertex/meta/llama-4-maverick-17b-128e-instruct-maas`.
- [Vertex] `vertex/meta/llama-4-scout-17b-16e-instruct-maas`.
- [Vertex] `vertex/gemini-3-flash-preview`.
- [VertexAnthropic] `claude-fable-5-1`.
- [VertexAnthropic] `claude-opus-5`.
- [VertexAnthropic] `claude-sonnet-5`.
- [VertexAnthropic] `claude-fable-5`.
- [VertexAnthropic] `claude-opus-4-8`.
- [VertexAnthropic] `claude-opus-4-7`.
- [VertexAnthropic] `claude-sonnet-4-6`.
- [VertexAnthropic] `claude-opus-4-6`.

### Prices that differ from the direct-API catalogs

- [Vertex] Google Cloud and Gemini API cache storage and grounding prices remain provider-specific. Gemini 3 Flash uses Google's published $0.50/$3 input/output rates and $14 per 1,000 search requests.
- [VertexAnthropic] Opus 4.1 is available at Google's published $15/$75 input/output rate per 1M tokens. The direct Anthropic endpoint is retired.

### Capabilities that differ from the direct-API catalogs

- [VertexAnthropic] Google's capability tables control these records. Direct Claude abilities omitted by Google stay out, including code execution, file uploads, and the removed abilities listed above.
- [Vertex] Gemini 2.5 Flash Image has a 32,768-token input limit; the direct API page gives 65,536. Google documents PDF support on Vertex. Gemini 3.1 Flash-Lite Image also has different caching support across the two providers.
- [Vertex] Mistral Small's input table lists text, so the record no longer claims document input. Google's Grok pages do not establish native web search.

### Sources and coverage

- [All] Sources were read on September 11, 2026, using Browser and batched `curl` requests. Scripts compare every starting catalog record. Groq is explicitly incomplete. A provider match does not imply that every optional field was published or extracted.
- [All] Provider evidence and migration reports stay in the ignored local `audits/` directory. They are excluded from commits.
- [Anthropic] [Model index](https://platform.claude.com/docs/en/about-claude/models/overview), [pricing](https://platform.claude.com/docs/en/about-claude/pricing), [deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations), and [release notes](https://platform.claude.com/docs/en/release-notes/api). Individual model pages and the context, caching, fast-mode, and tool guides supplement the index.
- [OpenAI] [Model index](https://developers.openai.com/api/docs/models), [pricing](https://developers.openai.com/api/docs/pricing), [deprecations](https://developers.openai.com/api/docs/deprecations), and [changelog](https://developers.openai.com/api/docs/changelog). Model pages, the image guide, and the fast-mode guide supply limits and abilities. Snapshot pages that return 404 use the family page; snapshot-specific fields remain unchanged without explicit evidence.
- [Gemini] [Models](https://ai.google.dev/gemini-api/docs/models), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [deprecations](https://ai.google.dev/gemini-api/docs/deprecations), and [changelog](https://ai.google.dev/gemini-api/docs/changelog). Shared model pages supply the Custom Tools and Robotics variants.
- [xAI] [Models](https://docs.x.ai/developers/models), [pricing](https://docs.x.ai/developers/pricing), [release notes](https://docs.x.ai/developers/release-notes), and [the image retirement notice](https://docs.x.ai/developers/migration/imagine-image-quality-nov-2). Per-model pages supply the remaining model facts.
- [DeepInfra] [Model list](https://api.deepinfra.com/models/list) and individual detail records at `https://api.deepinfra.com/models/<owner>/<name>`. Browser confirmed effective discounts and hosted tier prices. The site lists recent models; no separate usable change feed was found.
- [Vertex] [Pricing](https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing), [Claude models](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/partner-models/claude), [partner deprecations](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/deprecations/partner-models), and [open-model deprecations](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/deprecations/open-models). Browser displayed all 57 pricing tables. Model pages supply limits, abilities, regions, and dates. Google's release notes were also checked.
- [Groq] [Release notes](https://console.groq.com/docs/changelog) were accessible. [Models](https://console.groq.com/docs/models), deprecations, and capability pages were blocked. The five existing records remain unverified for this date; two receive the Batch shape migration only.

# 2026-09-08 TARS MODEL UPDATE

## Other Updates:
- [OpenAI] `gpt-6-astra`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-5.5`, `gpt-5.5-pro`, `gpt-5.4`, `gpt-5.4-pro`, and `daybreak-blue-latest` — the records now give the long-context prices as dollar amounts. The prices did not change. A prompt of more than 272,000 input tokens costs twice the standard input and cached input price and one and a half times the output price, for the whole request.
- [OpenAI] `gpt-5.5-pro` — the record now carries the long-context price that OpenAI publishes: $60.00 input and $270.00 output per 1M tokens above 272,000 input tokens.
- [OpenAI] `gpt-5.6-cyber` and `daybreak-red-latest` — both models accept at most 272,000 input tokens, so a prompt cannot go above the long-context threshold. We removed the long-context price.
- [xAI] `grok-4.6`, `grok-4.5`, `grok-4.3`, `grok-4.20-0309-reasoning`, `grok-4.20-0309-non-reasoning`, `grok-4.20-multi-agent-0309`, and `grok-build-0.1` — the records now give the long-context prices as dollar amounts. The prices did not change. Prompts of 200k tokens or more cost twice the standard input, cached input, and output price, as before.
- [Gemini] `gemini-2.5-computer-use-preview-10-2025` — the model accepts 128k input tokens, so a prompt cannot reach the 200k long-context tier. We removed the long-context price.
- [Vertex] `gemini-3-pro-image` — the model has a 65k context window, so a prompt cannot reach the 200k long-context tier. We removed the long-context price.
- [Vertex] `grok-4.3` — the Agent Platform model page gives a 200k context length, so a prompt cannot go above the 200k threshold. We removed the long-context price. The direct xAI record keeps its 1M context window and its long-context price.

## Notes:

### Corrections to earlier updates
- [OpenAI] Ten records stated the long-context tier as a pair of multipliers inside `additionalPricePerMillion.extra`, so a reader had to multiply to learn the price. Two of the ten are for models that cannot reach the threshold. This update writes the prices out and removes the two.
- [Vertex] The 2026-09-07 update added the three `_high_context` price fields and `limits.high_context: 200000` to `gemini-3-pro-image`. The model has a 65,536 token context window, so the tier is unreachable. This update removes the fields.
- [Gemini] The 2026-08-31 update added `high_context: 200000` to `gemini-2.5-computer-use-preview-10-2025`. The model has a 128,000 token input limit, so the tier is unreachable. This update removes the threshold and the two tier prices.
- [Anthropic] `claude-sonnet-4-0` and `claude-sonnet-4-20250514` carried four `_high_context` price fields with no `limits.high_context` and a 200k context window. Both records are retired. This update removes the four fields.

### Schema and catalog changes
- One shape for long-context pricing in every catalog, across three thresholds: 200,000 tokens at Anthropic, Google, and xAI, and 272,000 at OpenAI. `limits.high_context` holds the input-token threshold, and `additionalPricePerMillion` holds the absolute prices above it in `input_tokens_price_per_million_high_context`, `output_tokens_price_per_million_high_context`, `cached_tokens_price_per_million_high_context`, `caching_tokens_price_per_million_high_context`, and `caching_1h_per_million_high_context`. The tier applies to a request whose input token count is greater than the threshold.
- `schemas/models.ts` removes `high_context_multiplier` from `AdditionalPricing`, adds `caching_1h_per_million_high_context`, and states the rule in the comments. A prompt must be able to go above `limits.high_context`, so the threshold sits below the input ceiling.
- New `schemas/validate.ts`. Run `bun schemas/validate.ts` to check every catalog. It rejects a tier written as a ratio, a tier price without a threshold, a threshold without input and output tier prices, a threshold a prompt cannot go above, a tier price below the base price, and an unknown `high_context` key. The script exits with code 1 and one `file:model: reason` line per violation.
- [xAI] The seven chat records replace `high_context_multiplier: 2` with `input_tokens_price_per_million_high_context`, `output_tokens_price_per_million_high_context`, and `cached_tokens_price_per_million_high_context`. The values are the ones on the xAI pricing page.
- [OpenAI] Nine records take `limits.high_context: 272000` and the absolute `*_high_context` prices. The ten records that carried `extra.input_tokens_above_272k_multiplier` and `extra.output_tokens_above_272k_multiplier` no longer do. OpenAI is the third threshold in the catalog after the 200k used by Anthropic, Google, and xAI.
- `schemas/validate.ts` now rejects a tier written as a ratio under any key in `additionalPricePerMillion`, `limits`, or either `extra` bag, not only `high_context_multiplier`. It also measures reachability against `limits.max_input_tokens` when the provider publishes one, and against `contextWindow` otherwise. The OpenAI multipliers sat in `extra`, where the first version of the script did not look.
- New `schemas/validate.test.ts` with nine cases, including both multiplier shapes and a threshold equal to the input cap. Run `bun schemas/validate.test.ts`.
- The `update-models` skill now runs the validator in the Validate step and carries a **Long-context tier** judgment call. A model with a context window above 200k and flat pricing is named under **Prices that did not change** on each run, so a missing tier means verified flat.
- The skill named `gemini-prod.json`. The file is `gemini.json`. The skill now uses the right name.

### Prices that did not change
- [Anthropic] All 22 priced records match the pricing page. The 17 records on the deprecation table match its status column.
- [OpenAI] All 64 records with a model page match on input, cached input, and output price, context window, and maximum output tokens. Only the shape of the long-context tier changed.
- [DeepInfra] All 172 records match the model list endpoint on price, context window, capabilities, modalities, and shutdown date.
- [Gemini] All 25 records match the pricing page and the model pages.
- [Vertex] All 49 records and all 14 VertexAnthropic records match the Agent Platform pricing tables. The 16 deprecated open models match the open-models deprecation page.
- [Groq] All 5 records match the model index on price, context window, maximum completion tokens, and rate limits.
- [OpenAI] `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.2`, `gpt-5.1`, `gpt-5`, and the GPT-4.1 family have flat pricing. `gpt-5.4-mini` and `gpt-5.4-nano` have a 400k context window but accept at most 272,000 input tokens.
- [xAI] All seven long-context tiers match the pricing page: 2x the standard input, cached input, and output price at 200k prompt tokens and above.
- [Gemini] `gemini-3.1-pro-preview`, `gemini-3.1-pro-preview-customtools`, and `gemini-2.5-pro` keep their long-context tiers. The Flash models have flat pricing across the 1M context window, as on 2026-09-07.
- [Anthropic] The current 1M context models have flat pricing across the window, as recorded on 2026-07-24 for `claude-opus-5`.

### Sources and coverage
- [xAI] `docs.x.ai/developers/pricing.md`, read on 2026-09-08. The table gives a `< 200k` and a `≥ 200k` row for each of the seven models.
- [Gemini] `ai.google.dev/gemini-api/docs/models/gemini-2.5-computer-use-preview-10-2025` gives a 128,000 token input limit. `ai.google.dev/gemini-api/docs/pricing` still prints a `> 200k` price for the model.
- [Vertex] `docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-pro-image` gives a 65,536 token context window. `.../models/partner-models/grok/grok-4-3` gives a 200,000 token context length. The Agent Platform pricing page prints a long-context column for both.
- [Anthropic] `platform.claude.com` release notes, models overview, pricing, model deprecations, context windows, and prompt caching, read on 2026-09-08. The caching page gives the per-model minimum cacheable prompt length.
- [OpenAI] `developers.openai.com` pricing, deprecations, changelog, and a model page for each of the 64 catalog models with one, read on 2026-09-08. The `models/compare.md` endpoint returns only the first four rows, so the per-model pages carry the comparison. The 272,000-token rule is stated on each model page and in the Long context columns of the pricing tables.
- [Gemini] `ai.google.dev/gemini-api/docs` changelog, models, pricing, and deprecations, read on 2026-09-08.
- [DeepInfra] `api.deepinfra.com/models/list` and the per-model endpoints, read on 2026-09-08.
- [Vertex] The Agent Platform pricing page returned all 57 tables to `curl` on 2026-09-08, so this run did not need a browser for it. The model pages, both deprecation pages, and the Grok pages were read the same way.
- [Groq] `console.groq.com/docs/models` was read in the browser on 2026-09-08; the host answers `curl` with an access-denied body. The index carries price, context window, maximum completion tokens, and rate limits, which covers every field in the 5 records.

### Follow-up work
- [Groq] The deprecations page, the changelog, and the capability pages started refusing requests part way through this run, in the browser as well as through `curl`. The 5 records were verified against the model index only. Read those pages on the next run and confirm the capability lists.
- [Gemini] Google publishes a scheduled price increase for `gemini-3.8-flash`, `gemini-3.7-flash`, and `gemini-3.6-flash` on 2027-01-01: input rises from $0.75 to $1.50, output from $3.75 to $7.50, and cached input from $0.075 to $0.15 per 1M tokens. The records keep the price in effect today.
- [Vertex] The pricing page lists Gemini 2.5 Pro Computer Use-Preview with a published price. The catalog has no record for it. Decide on the next run whether it belongs in `vertex.json`.
- [OpenAI] `daybreak-blue-latest` and `daybreak-red-latest` are aliases that point to `gpt-5.6-sol` and `gpt-5.6-cyber` today. Their long-context state follows whichever model the alias points to, so check it whenever OpenAI moves the alias.

# 2026-09-07 TARS MODEL UPDATE

## New Models:
- [OpenAI] `gpt-6-astra` — OpenAI's most capable model, made for the hardest end-to-end work: reasoning, coding, computer use, research, and document creation. OpenAI released the model on 2026-09-03. Text and image input, text output. 1.05M context, 922k max input, and 128k max output. $10.00 input, $1.00 cached input, $12.50 cache write, and $50.00 output per 1M tokens. Prompts of more than 272k tokens cost 2x input and 1.5x output. Batch and Flex cost 50% of the standard rate. Fast mode costs 2x. Reasoning effort accepts `low`, `medium`, `high`, `xhigh`, and `max`. The model does not accept the `none` effort, custom `temperature`, `top_p`, or `logprobs`. Tool calling needs the Responses API. The model supports web search, file search, image generation, code interpreter, computer use, structured outputs, and prompt caching.
- [DeepInfra] `zai-org/GLM-5.3` — a reasoning model from Z.ai for software engineering and long-horizon agent tasks. Text input and output. 1M context and 131k max output. $1.20 input, $0.12 cached input, and $4.00 output per 1M tokens. The model supports tool use, structured outputs, and prompt caching.
- [DeepInfra] `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp` — DeepSeek's experimental multimodal model in the V4-Flash family. Text and image input, text output. 1M context and 262k max output. $0.44 input, $0.14 cached input, and $1.32 output per 1M tokens. The model supports tool use, structured outputs, prompt caching, and reasoning that you can turn off.
- [DeepInfra] `inclusionAI/Ling-3.0-flash-Fin` — a finance-tuned version of Ling-3.0-flash from Ant Group. Text input and output. 262k context. $0.06 input, $0.012 cached input, and $0.18 output per 1M tokens. The model supports tool use, structured outputs, and reasoning.
- [DeepInfra] `BAAI/bge-m3-multi-8k` — the BGE-M3 text embedding model with its full 8,192-token context. $0.01 per 1M input tokens.

## Price Changes:
- [DeepInfra] `anthropic/claude-sonnet-5` — $2.00/$10.00 → $3.00/$15.00 per 1M tokens.
- [DeepInfra] `deepseek-ai/DeepSeek-V4-Flash-0731` — input $0.08 → $0.06 per 1M tokens. The output price stays at $0.18.
- [Vertex] `gemini-3-pro-image` — Google now publishes the input price. Input costs $2.00 per 1M tokens for prompts up to 200k tokens and $4.00 above that. Cached input costs $0.20 and $0.40. Text output costs $12.00 and $18.00. The image output price stays at $120 per 1M tokens.

## Deprecated Models:
- [xAI] `grok-imagine-image-quality` — xAI announced the retirement on 2026-09-02. The shutdown date is 2026-11-02. After that date, requests to this name go to `grok-imagine-image-2.0` with `quality` set to `low`, at $0.04 per image. The aliases `grok-imagine-image-quality-latest` and `grok-imagine-image-pro` follow the same path. `grok-imagine-image` is not affected.
- [DeepInfra] `MiniMaxAI/MiniMax-M2.7`, `zai-org/GLM-5`, and `zai-org/GLM-4.7-Flash` — DeepInfra gives a shutdown date of 2026-09-10. Replacements: `MiniMaxAI/MiniMax-M3`, `zai-org/GLM-5.2`, and `zai-org/GLM-5.3-Flash`.

## Retired Models:
- [DeepInfra] `moonshotai/Kimi-K2.5` — shut down 2026-09-07. Replacement: `moonshotai/Kimi-K2.6`.
- [DeepInfra] 32 models that we marked as deprecated on 2026-08-31 are shut down. DeepInfra no longer serves a model page for them. The shutdown dates run from 2026-04-15 to 2026-08-24. The models are: `allenai/Olmo-3.1-32B-Instruct`, `allenai/olmOCR-2-7B-1025`, `anthropic/claude-3-7-sonnet-latest`, `anthropic/claude-4-opus`, `anthropic/claude-4-sonnet`, `deepseek-ai/DeepSeek-OCR`, `deepseek-ai/DeepSeek-R1-0528-Turbo`, `deepseek-ai/DeepSeek-R1-Distill-Llama-70B`, `deepseek-ai/DeepSeek-V3.1-Terminus`, `meta-llama/Llama-3.2-11B-Vision-Instruct`, `meta-llama/Meta-Llama-3-8B-Instruct`, `meta-llama/Meta-Llama-3.1-70B-Instruct`, `meta-llama/Meta-Llama-3.1-8B-Instruct`, `MiniMaxAI/MiniMax-M2.1`, `MiniMaxAI/MiniMax-M2.5`, `mistralai/Mixtral-8x7B-Instruct-v0.1`, `moonshotai/Kimi-K2-Instruct-0905`, `moonshotai/Kimi-K2-Thinking`, `moonshotai/Kimi-K2.5-Turbo`, `nvidia/Llama-3.1-Nemotron-70B-Instruct`, `nvidia/Llama-3.3-Nemotron-Super-49B-v1.5`, `nvidia/NVIDIA-Nemotron-Nano-12B-v2-VL`, `nvidia/NVIDIA-Nemotron-Nano-9B-v2`, `PaddlePaddle/PaddleOCR-VL-0.9B`, `Qwen/Qwen2.5-VL-32B-Instruct`, `Qwen/Qwen3-235B-A22B-Thinking-2507`, `Qwen/Qwen3-Coder-480B-A35B-Instruct`, `Qwen/Qwen3-Embedding-0.6B-batch`, `Qwen/Qwen3-Embedding-4B-batch`, `Qwen/Qwen3-Embedding-8B-batch`, `Sao10K/L3.3-70B-Euryale-v2.3`, and `zai-org/GLM-4.6V`. The 2026-08-31 update names the replacement for each model.

## Other Updates:
- [xAI] `grok-imagine-image-2.0` — the `quality` parameter now accepts `auto`, and `auto` is the default. Auto serves `low` for image generation and `medium` for image editing. xAI bills the quality that it serves. Image editing accepts up to 5 source images. The aspect ratios `21:9` and `5:2` are new.
- [DeepInfra] `google/gemma-4-31B-it-turbo` — the model accepts image input. We added vision to the record.
- [DeepInfra] `inclusionAI/Ling-3.0-flash` — the model supports structured outputs. We added the ability to the record.
- [DeepInfra] `BAAI/bge-m3-multi` — DeepInfra now truncates input to 512 tokens on this endpoint. The context window goes from 8,192 to 512. Use `BAAI/bge-m3-multi-8k` for the full context.
- [Groq] `qwen/qwen3.8-27b` — the record now carries the developer-plan rate limits of 250k tokens per minute and 1,000 requests per minute.

## Notes:

### Corrections to earlier updates
- [DeepInfra] The 2026-08-31 update said that DeepInfra publishes no shutdown date for deprecated models. This is not correct. The `deprecated` field in the model list is a unix timestamp of the shutdown date. A model with a date in the past has no model page, so we now treat it as retired. The 32 models in the Retired Models section carry that state from this update on. The 2026-08-31 records stored the timestamp as `deprecated_date`. We now store it as `retirement_date`.

### Follow-up work
- [DeepInfra] `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp` carries a 51% discount with no end date in the provider list. The record keeps the list price, as for the `XiaomiMiMo` discounts in the 2026-08-17 block. Check the price again on the next run.
- [DeepInfra] `moonshotai/Kimi-K2.5` shut down at 04:19 UTC on 2026-09-07. The model page was still online at the time of this update. The record is disabled because the date has passed.
- [OpenAI] OpenAI publishes a Fast mode price for `gpt-6-astra` of $20.00 input and $100.00 output per 1M tokens. The catalog has no field for Fast mode prices, so the record does not carry them. Fast mode is not available for this model with EU data residency.
- [OpenAI] OpenAI publishes Batch prices for 17 older models that carry no batch multiplier in the catalog, for example `gpt-5.2`, `gpt-4.1`, and `o3`. The batch price is 50% of the standard price for all of them. Decide on the next run whether the records take `batch_discount_multiplier: 0.5`.
- [xAI] The `grok-imagine-image-2.0` record still gives one price of $0.04 per image for both `low` and `medium`. The pricing page gives one price. The migration guide says that `low` is $0.01 cheaper than `grok-imagine-image-quality`, which is $0.05. This agrees with $0.04 for `low`. xAI does not publish a separate `medium` price.
- [Vertex] Google publishes an input price of $0.50 for text and $1.00 for audio for `gemini-3-flash-preview`, but no output price. The model stays out of the catalog.
- [Vertex] The `gemini-3-pro-image` record carries no cache write price. The Agent Platform pricing table gives a cache hit price only.
- [Groq] The model page for `openai/gpt-oss-safeguard-20b` links to code execution, but the code execution page does not list the model. The record keeps no code execution, as the capability page is the source.
- The file `CHANGELOG_TEMP.MD` in the repository root is a copy of the 2026-08-31 block. It is not part of this update. Delete it if it is not needed.

### Schema and catalog changes
- [OpenAI] The new record raises the catalog count from 68 to 69. It takes `mode: responses`, `max_input_tokens: 922000`, and the same `extra` multipliers as `gpt-5.6-sol`.
- [DeepInfra] The four new records raise the catalog count from 168 to 172. 33 records take `isEnabled: false` and a `retirement_date`. Three records take `deprecated: true` and `retirement_date: 2026-09-10` and stay enabled. Every deprecated record gains a `retirement_date` from the provider timestamp.
- [xAI] `grok-imagine-image-quality` takes `deprecated: true`, `deprecated_date: 2026-09-02`, and `retirement_date: 2026-11-02`. The record stays enabled. `grok-imagine-image-2.0` gains `auto` in `options.quality` and `21:9` and `5:2` in `options.aspect_ratio`.
- [Vertex] `gemini-3-pro-image` takes `inputTokensPricePerMillion: 2.00`, the three `_high_context` price fields, and `limits.high_context: 200000`, as on `gemini-3.1-pro-preview`.

### Models that stay out of the catalog
- [Gemini] `lyria-3.5` — a music generation model in public preview since 2026-09-03. The model makes audio, so no catalog mode fits it.
- [DeepInfra] 81 models in the provider list carry a shutdown date in the past and have no model page. They were never in the catalog and stay out. Examples: `deepseek-ai/DeepSeek-R1`, `meta-llama/Meta-Llama-3.1-405B-Instruct`, and `mistralai/Mixtral-8x22B-Instruct-v0.1`.
- [DeepInfra] The four `rerank` records stay as they are. The mode is not in the accepted list.
- [Vertex] `gemini-3-flash-preview` — see Follow-up work.
- [Vertex] The Interactions API agents, the Live API models, the speech models, Imagen, Veo, Lyria, and `mistral-ocr-2505` stay out, as in the 2026-09-04 update.

### Prices that did not change
- [Anthropic] All 17 models on the pricing page match the catalog. The token prices, the cache prices, and the batch prices are the same as on 2026-09-04.
- [OpenAI] All 37 models on the standard pricing table match the catalog, apart from the new `gpt-6-astra`.
- [Gemini] All 22 models on the pricing page match the catalog. The three retired Imagen models are no longer on the pricing page.
- [xAI] All 7 chat models and 3 image models match the pricing page. The high-context prices match the 2x multiplier in the records.
- [DeepInfra] 166 of the 168 existing records match the provider list price.
- [Vertex] 48 of the 49 records match the Agent Platform pricing page. This covers the Gemini 2.5 and Gemini 3 models and the embedding models. It also covers the Grok, DeepSeek, Qwen, GLM, Kimi, MiniMax, gpt-oss, Gemma, Llama, Mistral, and E5 models.
- [VertexAnthropic] All 12 priced Claude records match the Agent Platform pricing page. The non-global prices stay at 1.1x.
- [Groq] All 5 records match the models index and the model pages. This covers the token prices, the cached input prices, the context windows, and the max output tokens.

### Sources and coverage
- Anthropic: release notes, models overview, pricing, and deprecations. No model change since 2026-09-04. The release notes of 2026-09-03 cover the `ant` CLI only.
- OpenAI: changelog, model comparison, pricing, deprecations, fast mode, and the GPT-6 Astra model page. The deprecations page has no new entry since 2026-08-26.
- Gemini: changelog, pricing, models, and deprecations. Only Lyria 3.5 is new.
- xAI: release notes, pricing, models, the two Imagine model pages, the image generation guide, and the retirement guide for 2026-11-02.
- DeepInfra: the model list endpoint and the detail endpoint for the new, changed, and retired models.
- Vertex and VertexAnthropic: the Agent Platform pricing page in Chrome, the open-model and partner-model deprecation pages, and the left-navigation model list. The deprecation pages and the model list have no change since 2026-09-04.
- Groq: changelog, models index, deprecations, rate limits, the five model pages, and the capability pages for vision, reasoning, structured outputs, prompt caching, tool use, browser search, web search, and code execution. The first fetch on this run returned an access error from the Groq edge. A later fetch succeeded. The deprecations page has no entry after 2026-08-16.
- We compared every record in all eight catalogs to the provider pages with a script. Price, cached price, context window, and deprecation state were part of the comparison.

# 2026-09-04 TARS MODEL UPDATE — VERTEX

## New Catalogs:
- [Vertex] `vertex.json` — 49 models served by Gemini Enterprise Agent Platform (Vertex AI). 19 Google models (11 chat, 4 image generation, 4 embedding) and 30 partner and open models (28 chat, 2 embedding).
- [VertexAnthropic] `vertexanthropic.json` — 14 Anthropic Claude models served by Agent Platform. The `vertexanthropic/claude-*` names that `anthropic.json` already gives in `fallback_policies` now resolve to real records.

## New Models:
- [Vertex] Chat: `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-3.1-pro-preview`, `gemini-3.1-pro-preview-customtools`, `gemini-2.5-pro`, `gemini-2.5-flash`, and `gemini-2.5-flash-lite`.
- [Vertex] Image generation: `gemini-3-pro-image`, `gemini-3.1-flash-image`, `gemini-3.1-flash-lite-image`, and `gemini-2.5-flash-image`.
- [Vertex] Embedding: `gemini-embedding-2` ($0.20 text, $0.45 image, $12.00 video, $6.50 audio per 1M tokens), `gemini-embedding-001` ($0.15 per 1M tokens), `text-embedding-005`, and `text-multilingual-embedding-002` ($0.025 per 1M tokens each).
- [VertexAnthropic] `claude-fable-5-1`, `claude-opus-5`, `claude-sonnet-5`, `claude-fable-5`, `claude-opus-4-8`, `claude-opus-4-7`, `claude-sonnet-4-6`, `claude-opus-4-6`, `claude-opus-4-5`, `claude-sonnet-4-5`, `claude-haiku-4-5`, `claude-opus-4-1`, `claude-opus-4`, and `claude-sonnet-4`.

### Partner models (managed APIs)
All prices are per 1M tokens, input then output.
- [Vertex] xAI Grok: `grok-4.6` $2.00/$6.00, `grok-4.3` $1.25/$2.50, `grok-4.20-reasoning` and `grok-4.20-non-reasoning` $1.25/$2.50, and the deprecated `grok-4.1-fast-reasoning` and `grok-4.1-fast-non-reasoning` $0.20/$0.50. Prompts of more than 200k tokens cost twice as much for Grok 4.6, 4.3, and 4.20. Grok 4.20 has a 2M context window, the largest in the catalog.
- [Vertex] Mistral AI: `mistral-medium-3` $0.40/$2.00, `codestral-2` $0.30/$0.90, and `mistral-small-2503` $0.10/$0.30. All three have a 128k context window and run in `us-central1` and `europe-west4`.
- [Vertex] Meta Llama: `llama-4-scout-17b-16e-instruct-maas` $0.25/$0.70 with a 1.31M context window, `llama-4-maverick-17b-128e-instruct-maas` $0.35/$1.15 with a 524k context window, and `llama-3.3-70b-instruct-maas` $0.72/$0.72 with a 128k context window. All three cap output at 8,192 tokens.
- [Vertex] DeepSeek: `deepseek-v3.1-maas` $0.60/$1.70, `deepseek-v3.2-maas` $0.56/$1.68, `deepseek-r1-0528-maas` $1.35/$5.40, and `deepseek-ocr-maas` $0.30/$1.20. DeepSeek-OCR reads images and returns text.
- [Vertex] Qwen: `qwen3-coder-480b-a35b-instruct-maas` $0.22/$1.80, `qwen3-235b-a22b-instruct-2507-maas` $0.22/$0.88, and `qwen3-next-80b-a3b-instruct-maas` and `qwen3-next-80b-a3b-thinking-maas` $0.15/$1.20.
- [Vertex] Z.ai GLM: `glm-5.2-maas` $1.40/$4.40 with a 1M context window, `glm-5-maas` $1.00/$3.20, and `glm-4.7-maas` $0.60/$2.20.
- [Vertex] OpenAI open weights: `gpt-oss-120b-maas` $0.09/$0.36 and `gpt-oss-20b-maas` $0.07/$0.25.
- [Vertex] Others: `kimi-k2-thinking-maas` $0.60/$2.50, `minimax-m2-maas` $0.30/$1.20, and `gemma-4-26b-a4b-it-maas` $0.15/$0.60.
- [Vertex] Embedding: `multilingual-e5-large-instruct-maas` $0.025 and `multilingual-e5-small-maas` $0.015 per 1M input tokens. Both take a maximum sequence of 512 tokens.

## Notes:

### Prices that differ from the direct-API catalogs
- [Vertex] Non-global endpoints cost 1.1 times the global price. This applies to the GA Gemini 3 and later families from 2026-07-01. The records carry `non_global_endpoint_multiplier: 1.1` for `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, and `gemini-3.1-flash-image`. The other models are global only.
- [Vertex] Cache storage costs $1.00 per 1M tokens per hour for the Flash and Flash-Lite models and $4.50 for the Pro models. The Gemini API price for `gemini-3.8-flash` is $0.50, so the two catalogs differ here.
- [Vertex] Grounding costs $14 per 1,000 queries for the Gemini 3 models. For the Gemini 2.5 models it costs $35 per 1,000 prompts with Google Search, $45 with Web Grounding for Enterprise, and $25 with Google Maps. Grounding with your data costs $2.50 per 1,000 prompts for all models.
- [Vertex] `gemini-3.1-flash-image` publishes a cached input price of $0.05 and `gemini-2.5-flash-image` publishes a text output price of $2.50. The Gemini API catalog has no value for either field.
- [VertexAnthropic] The token prices match `anthropic.json` for all 12 priced models.

### Capabilities that differ from the direct-API catalogs
- [VertexAnthropic] Agent Platform does not offer the code execution tool or the Files API for Claude, so no record carries `code_execution` or `file_upload`. The `anthropic.json` records carry both.
- [VertexAnthropic] Agent Platform lists computer use for `claude-fable-5-1`, `claude-opus-5`, `claude-sonnet-5`, `claude-fable-5`, `claude-opus-4-8`, `claude-opus-4-7`, `claude-sonnet-4-6`, `claude-opus-4-6`, and `claude-opus-4-5` only. The other five records have no `computer_use`.
- [Vertex] `gemini-2.5-flash-image` has no context caching and no structured output on Agent Platform, and `gemini-3.1-flash-lite-image` has no function calling. The records drop those capabilities.
- [Vertex] The Grok records differ from `xai.json`. Agent Platform gives no web search, no code execution, and no file upload for Grok, and it splits Grok 4.20 into a reasoning and a non-reasoning model ID. The context windows also differ: Agent Platform gives 524,288 for Grok 4.6 and 200,000 for Grok 4.3, where `xai.json` gives 500,000 and 1,000,000.

### Deprecated partner models
- [Vertex] Google deprecated 16 MaaS models on 2026-07-21 and retires them on 2026-10-21: `deepseek-v3.1-maas`, `deepseek-v3.2-maas`, `deepseek-r1-0528-maas`, `deepseek-ocr-maas`, `glm-4.7-maas`, `glm-5-maas`, `gpt-oss-20b-maas`, `kimi-k2-thinking-maas`, `llama-3.3-70b-instruct-maas`, `minimax-m2-maas`, `multilingual-e5-large-instruct-maas`, `multilingual-e5-small-maas`, `qwen3-235b-a22b-instruct-2507-maas`, `qwen3-coder-480b-a35b-instruct-maas`, `qwen3-next-80b-a3b-instruct-maas`, and `qwen3-next-80b-a3b-thinking-maas`. The records carry the dates and stay enabled, because the endpoints still answer until the retirement date. Google gives a Model Garden self-deploy option for each one.
- [Vertex] `grok-4.1-fast-reasoning` and `grok-4.1-fast-non-reasoning` — shut down 2026-08-20. Both records take `isEnabled: false`. Google names Grok 4.3 and Grok 4.6 as the replacements.

### Models that stay out of the catalog
- [Vertex] `gemini-3-flash-preview` — the Agent Platform pricing page gives an input price of $0.50 but no output price. We leave the model out until Google publishes one.
- [Vertex] The Gemini Robotics ER models, the Live API models, `gemini-3.5-transcribe`, `gemini-3.5-live-translate`, the Gemini Omni video models, Imagen, and Veo — no catalog mode fits them, or Agent Platform publishes no model page for them.
- [Vertex] `mistral-ocr-2505` — the model takes documents only, not text, so it does not meet the catalog rule for accepted models.
- [Vertex] Jamba 1.5 Large and Jamba 1.5 Mini — both were shut down on 2026-02-27.
- [VertexAnthropic] `claude-3-opus`, `claude-3-haiku`, `claude-3-5-sonnet`, `claude-3-5-sonnet-v2`, `claude-3-5-haiku`, and `claude-3-7-sonnet` — all six are on the partner deprecation page with shutdown dates that have passed.

### Follow-up work
- [Vertex] The Mistral model pages give no capability list, so `mistral-medium-3` and `codestral-2` have an empty `capabilities` array and `mistral-small-2503` carries only `pdf_support`. Google publishes no function calling or structured output support for them on Agent Platform.
- [Vertex] The Grok model pages give no maximum output token count, only an output tokens-per-minute quota. Those four records have no `max_output_tokens`.
- [Vertex] The `multilingual-e5-*` pages say batch inference is not supported, but the pricing page gives a batch price. The records keep `batch_discount_multiplier: 0.5`.
- [Vertex] The partner and open model pages list no context caching. Where the pricing page gives a cache hit price, the record carries `prompt_caching` and `cachedTokensPricePerMillion`, and `cachingTokensPricePerMillion` stays null because Google publishes no cache write price.
- [Vertex] The cache storage table does not list `gemini-3.8-flash` or `gemini-3.7-flash`. Their records carry no `caching_storage_per_million_per_hour`. The other Flash records use the published $1.00 rate.
- [Vertex] The pricing table shows a dash for the `gemini-3-pro-image` input price and image output price. The record keeps `inputTokensPricePerMillion: null`. The cached input price of $0.20 and the text output price of $12.00 are published, and the image output price of $120 per 1M tokens comes from the published $0.134 per 1,120-token 1K image.
- [Vertex] The introductory price of $0.75 input and $3.75 output for `gemini-3.8-flash`, `gemini-3.7-flash`, and `gemini-3.6-flash` runs through 2026-12-31. On 2027-01-01 it goes to $1.50 and $7.50.
- [VertexAnthropic] `claude-opus-4` and `claude-sonnet-4` still have model pages, but Agent Platform no longer publishes a price for them. Both records keep `isEnabled: false` and null prices, because `anthropic.json` names them as fallback targets.
- [VertexAnthropic] Agent Platform lists extended thinking for the 4.x models only. It does not list it for `claude-fable-5-1`, `claude-opus-5`, `claude-sonnet-5`, `claude-fable-5`, or `claude-opus-4-5`, because those models always think. All 14 records carry `reasoning`.
- [VertexAnthropic] `claude-sonnet-4-5` has a 1M context window in preview and 200k at GA. The record uses 1,000,000 with `high_context: 200000`, so the published above-200k prices ($6.00 input, $22.50 output, $0.60 cache hit) stay in the record.
- [VertexAnthropic] The retirement dates come from the "not sooner than" dates on the model pages, as `anthropic.json` already does for `claude-opus-4-1`.

### Schema and catalog changes
- `schemas/models.ts` — `PROVIDERS` gains `vertex` and `vertexanthropic`.
- `README.md` — the catalog table gains `vertex.json` and `vertexanthropic.json`.
- The partner records use a `launch_stage` key in `metadata` to hold the Agent Platform stage (`ga`, `preview`, `experimental`, `deprecated`).
- `providers.json` — no change. Both provider records already exist.

### Sources and coverage
- Agent Platform pricing: https://docs.cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing — Gemini 3, Gemini 2.5, grounding, cache storage, embeddings, and the Anthropic partner tables.
- Agent Platform models: the model page of every record under https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/, plus the Claude overview, the partner model overview, the partner and open model deprecation pages, and the text embeddings page.

# 2026-09-04 TARS MODEL UPDATE

## New Models:
- [Anthropic] `claude-fable-5-1` — the newest Claude model for demanding reasoning and long-horizon agent work. Anthropic released the model on 2026-09-01. Text, image, and PDF input, text output. 1M context and 128k max output. $10.00 input and $50.00 output per 1M tokens, the same price as Claude Fable 5. Cached input costs $0.25 per 1M tokens, one quarter of the price on other Claude models. A 5-minute cache write costs $12.50 and a 1-hour cache write costs $20.00 per 1M tokens. The model thinks on every request, and effort accepts `low`, `medium`, `high`, `xhigh`, and `max`, with `high` as the default. The model supports tool use, structured outputs, computer use, browser use, code execution, web search, and file upload.
- [Anthropic] `claude-mythos-5-1` — the same model for Project Glasswing participants. Same modalities, limits, and price as `claude-fable-5-1`. Anthropic gives access by invitation only, so the model stays disabled.
- [Gemini] `gemini-3.8-flash` — Google's most intelligent Flash model, made for long-horizon software engineering, autonomous agents, and complex enterprise work. Google released the model on 2026-09-02. Text, image, video, audio, and PDF input, text output. 1M context and 65k max output. $0.75 input, $0.075 cached input, and $3.75 output per 1M tokens. This is an introductory price through 2026-12-31. Cache storage costs $0.50 per 1M tokens per hour. Thinking accepts `low`, `medium`, and `high`. The model supports tool use, structured outputs, code execution, URL context, and computer use in preview. Grounding with Google Search and Google Maps costs $14 per 1,000 requests.

## Retired Models:
- [Gemini] `gemini-robotics-er-1.6-preview` — shut down 2026-08-31. Replacement: `gemini-robotics-er-2-preview`.
- [Gemini] `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, and `imagen-4.0-fast-generate-001` — shut down 2026-08-17. Replacement: `gemini-3.1-flash-image`.

## Other Updates:
- [Anthropic] `claude-fable-5` and `claude-mythos-5` — the two models support computer use and browser use. Anthropic added both toolsets on 2026-08-19. We added the missing ability to the catalog.
- [Gemini] `gemini-3.7-flash` — Google now lists this model as the previous-generation Flash model. We changed the description. The price and the limits do not change.

## Notes:

### Models that are added but not enabled
- [Anthropic] `claude-mythos-5-1` — Project Glasswing gives access by invitation only. The record keeps the published price and limits.

### Follow-up work
- [Anthropic] Anthropic gives the retirement date of `claude-fable-5-1` as "not sooner than September 1, 2027". This is not a firm date, so the record has no retirement date.
- [Anthropic] Anthropic publishes no tool-use system prompt token count for the Fable and Mythos models. The field stays empty.
- [Gemini] The introductory prices of `gemini-3.8-flash`, `gemini-3.7-flash`, and `gemini-3.6-flash` run through 2026-12-31. On 2027-01-01 the price goes to $1.50 input, $0.15 cached input, and $7.50 output per 1M tokens. Cache storage goes to $1.00 per 1M tokens per hour.
- [Gemini] The `gemini-robotics-er-2-preview` model page lists grounding with Google Maps, but the pricing page gives no Maps price for this model. The catalog keeps the $14 per 1,000 rate that Google gives for the other Gemini 3 models.
- [Gemini] The Gemini deprecations page calls its shutdown dates the earliest possible dates. We record them as retirement dates, as in earlier updates.

### Schema and catalog changes
- [Anthropic] The two new records raise the catalog count from 37 to 39. Both records take `min_cacheable_prompt_tokens: 512`, `max_images_per_prompt: 600`, and `inference_geo_us_multiplier: 1.1`. `claude-fable-5` and `claude-mythos-5` gain `computer_use` in `capabilities`.
- [Gemini] The new record raises the catalog count from 24 to 25. The four retired records take `isEnabled: false`. Seven records gain a `retirement_date`: the four retired ones, and `gemini-2.5-flash-image`, `gemini-3.1-flash-lite`, and `gemini-embedding-001`, which carried `deprecated: true` with no date.

### Deprecated partner models
- [Vertex] Google deprecated 16 MaaS models on 2026-07-21 and retires them on 2026-10-21: `deepseek-v3.1-maas`, `deepseek-v3.2-maas`, `deepseek-r1-0528-maas`, `deepseek-ocr-maas`, `glm-4.7-maas`, `glm-5-maas`, `gpt-oss-20b-maas`, `kimi-k2-thinking-maas`, `llama-3.3-70b-instruct-maas`, `minimax-m2-maas`, `multilingual-e5-large-instruct-maas`, `multilingual-e5-small-maas`, `qwen3-235b-a22b-instruct-2507-maas`, `qwen3-coder-480b-a35b-instruct-maas`, `qwen3-next-80b-a3b-instruct-maas`, and `qwen3-next-80b-a3b-thinking-maas`. The records carry the dates and stay enabled, because the endpoints still answer until the retirement date. Google gives a Model Garden self-deploy option for each one.
- [Vertex] `grok-4.1-fast-reasoning` and `grok-4.1-fast-non-reasoning` — shut down 2026-08-20. Both records take `isEnabled: false`. Google names Grok 4.3 and Grok 4.6 as the replacements.

### Models that stay out of the catalog
- [Gemini] `lyria-3.5-clip-preview` and `lyria-3.5-pro-preview` — music generation models, released 2026-09-03. The models make audio, so no catalog mode fits them.
- [Gemini] `gemini-omni-1.1-flash` — a video generation and editing model, GA on 2026-08-27. The model makes video, so no catalog mode fits it.
- [Gemini] The speech, live, and video models stay out, as in earlier updates: `gemini-3.5-transcribe`, `gemini-3.5-transcribe-live`, `gemini-3.5-live-translate-preview`, `gemini-3.1-flash-live-preview`, `gemini-3.1-flash-tts-preview`, `gemini-2.5-flash-native-audio-preview-12-2025`, `gemini-2.5-flash-preview-tts`, `gemini-2.5-pro-preview-tts`, and the Veo models.
- [Gemini] The Interactions API agents stay out: Deep Research, Deep Research Max, and Antigravity.

### Prices that did not change
- [Anthropic] All 17 models on the pricing page match the catalog. The two new models are the only additions. The `claude-sonnet-5` price stays at $2.00 and $10.00 per 1M tokens. Anthropic canceled the increase to $3.00 and $15.00 that was set for 2026-09-01.
- [Gemini] All 24 existing records match the pricing page. This covers the token prices, the cached-token prices, the cache storage prices, the long-context prices, and the grounding prices.

### Sources and coverage
- Anthropic: release notes, models overview, pricing, deprecations, context windows, fast mode, prompt caching, request size limits, and the model pages for Claude Fable 5.1 and Claude Mythos 5.1. We also read the compatibility list on the computer use, browser use, code execution, structured outputs, and effort pages.
- We compared all 37 existing records to the provider pages with a script. Price, cache price, context window, max output, and image limit match for every model. The retired records stay in the catalog because Anthropic still lists them.
- Gemini: release notes, models index, pricing, deprecations, and the model pages for Gemini 3.8 Flash, Gemini 3.7 Flash, and Gemini Robotics ER 2.
- We compared all 24 existing Gemini records to the pricing and deprecations pages with a script. Only the retirement state changed.

# 2026-08-27 TARS MODEL UPDATE

## New Models:
- [Groq] `qwen/qwen3.8-27b` — a preview multimodal model. Text and image input, text output. 131k context and 16k max output. $0.80 input and $4.00 output per 1M tokens. 450 tokens per second. The maximum file size is 20 MB. The model accepts a maximum of 3 input images.
- [DeepInfra] We added 5 models. All prices are per 1M tokens, input then output.
    - `zai-org/GLM-5.3-Flash` $0.15/$0.50 — a multimodal model with a 1M context window. Text, image, and video input. Reasoning and tool use.
    - `Qwen/Qwen3.8-27B` $0.40/$3.00 — a vision model with a 262k context window. Reasoning and tool use.
    - `ibm-granite/granite-4.2-30b` $0.16/$0.65, `ibm-granite/granite-4.2-8b` $0.06/$0.25, and `ibm-granite/granite-4.2-3b` $0.03/$0.12 — IBM reasoning models with a 131k context window and tool use.

## Price Changes:
- [OpenAI] `gpt-5.6-sol` — $5.00/$30.00 → $4.00/$20.00 per 1M tokens. Cached input $0.50 → $0.40. Cache writes $6.25 → $5.00. Prompts of more than 272k tokens now cost $8.00 input and $30.00 output. OpenAI gives this promotional price at least through 2026-11-21.
- [OpenAI] `daybreak-blue-latest` — the same price change as `gpt-5.6-sol`, because the alias points to that model.

## Deprecated Models:
- [DeepInfra] `Qwen/Qwen3-235B-A22B-Thinking-2507` — DeepInfra marked the model as deprecated on 2026-08-25. Replacement: `Qwen/Qwen3.6-35B-A3B`. DeepInfra publishes no shutdown date, so the model continues to work.
- [Gemini] `gemini-robotics-er-1.6-preview` — Google now gives a firm shutdown date of 2026-08-31. Replacement: `gemini-robotics-er-2-preview`.

## Retired Models:
- [Gemini] `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, and `imagen-4.0-fast-generate-001` — shut down 2026-08-17. Replacement: `gemini-3.1-flash-image`.

## Other Updates:
- [Groq] We removed `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, and `minimaxai/minimax-m2.7` from the catalog. Groq marks the three models as Enterprise only and publishes no price. Enterprise models stay out of the catalog from this update on.

## Notes:

### Corrections to earlier updates
- [Gemini] We removed `deep-research-preview-04-2026`, `deep-research-max-preview-04-2026`, and `antigravity-preview-05-2026` from the catalog. Google serves these agents through the Interactions API only, and no catalog mode fits that API. The 2026-08-17 block and earlier blocks kept the three records with null prices.

### Follow-up work
- [OpenAI] The `gpt-5.6-sol` promotional price runs at least through 2026-11-21. Check the price after that date.
- [Gemini] The `gemini-3.7-flash` and `gemini-3.6-flash` promotional prices run through 2026-12-31. The prices rise to $1.50 input and $7.50 output on 2027-01-01.
- [xAI] The rate-limits page no longer publishes per-model limits. The limits are now per tier in the xAI console. The catalog keeps the last published values.
- [DeepInfra] The `rerank` records stay in the catalog until `CLAUDE.md` decides on that mode.

### Schema and catalog changes
- [Gemini] The three removed agent records drop the catalog count from 27 to 24. The three Imagen records take `isEnabled: false`, `deprecated_date: 2026-06-15`, and `retirement_date: 2026-08-17`. `gemini-robotics-er-1.6-preview` takes `retirement_date: 2026-08-31`.
- [Groq] The new Qwen record and the three removed Enterprise records change the count from 7 to 5. Groq publishes the context window of `qwen/qwen3.8-27b` as 131,042 tokens on both the index and the model page. The catalog records that value as written.
- [DeepInfra] The five new records raise the count from 163 to 168. `Qwen/Qwen3-235B-A22B-Thinking-2507` takes `deprecated: true` and `deprecated_date: 2026-08-25`.

### Deprecated partner models
- [Vertex] Google deprecated 16 MaaS models on 2026-07-21 and retires them on 2026-10-21: `deepseek-v3.1-maas`, `deepseek-v3.2-maas`, `deepseek-r1-0528-maas`, `deepseek-ocr-maas`, `glm-4.7-maas`, `glm-5-maas`, `gpt-oss-20b-maas`, `kimi-k2-thinking-maas`, `llama-3.3-70b-instruct-maas`, `minimax-m2-maas`, `multilingual-e5-large-instruct-maas`, `multilingual-e5-small-maas`, `qwen3-235b-a22b-instruct-2507-maas`, `qwen3-coder-480b-a35b-instruct-maas`, `qwen3-next-80b-a3b-instruct-maas`, and `qwen3-next-80b-a3b-thinking-maas`. The records carry the dates and stay enabled, because the endpoints still answer until the retirement date. Google gives a Model Garden self-deploy option for each one.
- [Vertex] `grok-4.1-fast-reasoning` and `grok-4.1-fast-non-reasoning` — shut down 2026-08-20. Both records take `isEnabled: false`. Google names Grok 4.3 and Grok 4.6 as the replacements.

### Models that stay out of the catalog
- [Gemini] `gemini-3.5-transcribe` and `gemini-3.5-transcribe-live` — speech-to-text models, GA on 2026-08-26. The models accept audio input only and no text input, so they fall outside the catalog rules. The live model also answers on the Live API only.
- [Gemini] The Interactions API agents (Deep Research, Deep Research Max, Antigravity) stay out. See Corrections.
- [DeepInfra] 81 deprecated text or embedding models on the provider list stay out, as in earlier updates.
- [Groq] All Enterprise models stay out: `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, `minimaxai/minimax-m2.7`, `minimaxai/minimax-m2.5`, and `qwen/qwen3-vl-32b-instruct`. Groq publishes no price for them.

### Prices that did not change
- [Anthropic] All 24 models on the pricing page match the catalog. No changes since 2026-08-17.
- [xAI] All 10 models match the catalog, including the image models and the long-context tiers.
- [OpenAI] All models except `gpt-5.6-sol` and `daybreak-blue-latest` match the catalog.
- [Gemini] All 24 remaining records match the pricing page.
- [DeepInfra] All 163 existing records match the provider list. The `XiaomiMiMo` discounts (39% and 32.5%, no end date) stay recorded at the base price, as in the 2026-08-17 block.

### Sources and coverage
- Anthropic: release notes, models overview, pricing, deprecations, context windows, fast mode. The release notes since 2026-08-17 name platform features only.
- OpenAI: changelog, compare table, pricing, deprecations, fast mode. The compare table now lists only the four flagship models.
- Gemini: changelog, models, pricing, deprecations, and the Transcribe model page.
- xAI: release notes, models, pricing, rate limits. Nothing new since Grok 4.6.
- Groq: changelog (nothing since April), models index, deprecations, capability pages, and the Qwen 3.8 model page.
- DeepInfra: the models/list API and per-model detail endpoints for the five new records.

# 2026-08-17 TARS MODEL UPDATE

## New Models:
- [DeepInfra] We added 55 models. All prices are per 1M tokens, input then output.
    - Anthropic (7): `claude-opus-5` $5.00/$25.00, `claude-fable-5` $10.00/$50.00, `claude-sonnet-5` $2.00/$10.00, `claude-opus-4-8` and `claude-opus-4-7` $5.00/$25.00, `claude-sonnet-4-6` $3.00/$15.00, `claude-haiku-4-5` $1.00/$5.00
    - Google (9): `gemini-3.7-flash` $0.75/$3.75, `gemini-3.5-flash` $1.50/$9.00, `gemini-3.1-pro` $2.00/$12.00, `gemini-3.1-flash-lite` $0.25/$1.50, and the Gemma 4 family `gemma-4-31B-it` $0.13/$0.38, `gemma-4-31B-it-turbo` $0.09/$0.34, `gemma-4-31B-it-Ultra` $0.27/$0.76, `gemma-4-26B-A4B-it` $0.07/$0.34, `gemma-4-E4B-it` $0.02/$0.10
    - Qwen (10): `Qwen3.8-Max` $1.65/$4.951, `Qwen3.8-2.4T-A95B` $2.00/$6.00, `Qwen3.7-Max` $2.50/$7.50, `Qwen3.6-27B` $0.32/$3.20, `Qwen3.6-35B-A3B` $0.10/$0.95, `Qwen3.5-397B-A17B` $0.45/$3.00, `Qwen3.5-122B-A10B` $0.29/$2.40, `Qwen3.5-35B-A3B` $0.14/$1.00, `Qwen3.5-27B` $0.26/$2.60, `Qwen3.5-9B` $0.10/$0.15
    - DeepSeek (4): `DeepSeek-V4-Pro` and `DeepSeek-V4-Pro-0813` $1.30/$2.60, `DeepSeek-V4-Flash` $0.09/$0.18, `DeepSeek-V4-Flash-0731` $0.08/$0.18
    - NVIDIA (6): `NVIDIA-Nemotron-3-Ultra-550B-A55B` $0.50/$2.20, `NVIDIA-Nemotron-3.5-Lightning` $0.08/$0.20, `Nemotron-Content-Safety-3.5` $0.20/$0.20, and three embedding models `Nemotron-3-Embed-8B` $0.035, `Nemotron-3-Embed-1B-BF16` $0.015, `Nemotron-3-Embed-1B-NVFP4` $0.010
    - Moonshot (3): `Kimi-K3` $2.85/$14.25, `Kimi-K2.7-Code` $0.68/$3.40, `Kimi-K2.6` $0.75/$3.50
    - MiniMax (3): `MiniMax-M3` $0.28/$1.10, `MiniMax-M2.7` $0.25/$1.00, `MiniMax-M2.7-Turbo` $0.38/$1.70
    - Z.ai (2): `GLM-5.2` $0.75/$2.40, `GLM-5.1` $1.05/$3.50
    - ByteDance (2): `Seed-2.0-pro` and `Seed-2.0-code` $0.50/$3.00
    - OpenAI (1): `gpt-oss-120b-Ultra` $0.20/$0.95
    - New suppliers (8): `XiaomiMiMo/MiMo-V2.5-Pro` $1.00/$3.00, `XiaomiMiMo/MiMo-V2.5` $0.40/$2.00, `thinkingmachines/Inkling` $0.95/$4.05, `thinkingmachines/Inkling-Small` $0.45/$1.20, `stepfun-ai/Step-3.7-Flash` $0.20/$1.15, `tencent/Hy3` $0.14/$0.58, `inclusionAI/Ling-3.0-flash` $0.06/$0.18, `meta-models/Muse-Glimmer-30B` $0.30/$1.20
- [Gemini] `gemini-3.7-flash` — the newest Flash model for coding, agents, and multi-step work. Text, image, video, audio, and PDF input. Text output. 1M context and 65k max output. $0.75 input, $0.075 cached input, and $3.75 output per 1M tokens. Thinking effort accepts `low`, `medium`, and `high`.
- [Gemini] `gemini-robotics-er-2-preview` — a robotics model for spatial reasoning and multi-robot work. Text, image, video, and audio input. Text output. 131k context and 65k max output. $2.00 input, $0.20 cached input, and $10.00 output per 1M tokens.
- [Gemini] `gemini-embedding-001` — a text embedding model at $0.15 per 1M input tokens. 2,048 input token limit. Output dimensions are flexible from 128 to 3072. Google gives a shutdown date of 2028-05-14.
- [Groq] `qwen/qwen3.6-27b` — a preview multimodal model. Text and image input, text output. 131k context and 16k max output. $0.60 input and $3.00 output per 1M tokens. 500 tokens per second. The maximum file size is 20 MB. The model accepts a maximum of 3 input images.
- [Groq] `minimaxai/minimax-m2.7` — a preview model for agentic work and software engineering. Text input and output. 196k context and 131k max output. 260 tokens per second. Groq offers this model to Enterprise customers only and publishes no price.
- [OpenAI] `gpt-5.6-cyber` — a cybersecurity model for authorized vulnerability research and security testing. Text and image input, text output. 400k context, 128k max output, and 272k max input. $12.50 input, $1.25 cached input, and $75.00 output per 1M tokens. Prompts of more than 272k tokens cost 2x input and 1.5x output. The Responses API is the only endpoint, and Batch is not supported.
- [OpenAI] `daybreak-blue-latest` — an alias for frontier general-purpose models with safeguards for defensive cybersecurity work. It points to `gpt-5.6-sol` and uses the same prices and limits.
- [OpenAI] `daybreak-red-latest` — an alias for advanced cybersecurity models. It points to `gpt-5.6-cyber` and uses the same prices and limits.
- [OpenAI] `gpt-image-2` — an image generation model. Text and image input, image output. Flexible image sizes and low, medium, and high quality tiers.
- [xAI] `grok-4.6` — the newest frontier model for code, agents, and knowledge work. Text and image input, text output. 500k context. $2.00 input, $0.50 cached input, and $6.00 output per 1M tokens. Prompts of 200k tokens or more cost 2x. Reasoning effort accepts `low`, `medium`, `high` (default), and `xhigh`.
- [xAI] `grok-imagine-image-2.0` — an image model at $0.04 per image. xAI recommends this model for images. It is the only image model that accepts the `quality` parameter (`low` or `medium`). Resolutions are `1k` and `2k`.
- [xAI] `grok-imagine-image-quality` — premium image generation at $0.05 per image. Aliases are `grok-imagine-image-quality-latest` and `grok-imagine-image-pro`.
- [Gemini] `gemini-robotics-er-2-streaming-preview` — a robotics model for real-time text streaming. Text, image, video, and audio input. Text output. 131k context and 65k max output. $2.00 input and $10.00 output per 1M tokens. Google serves this model through the Live API only, so the model stays disabled.

## Price Changes:
- [OpenAI] `gpt-5.6-terra` — $2.50/$15.00 → $2.00/$12.00 per 1M tokens. Cached input $0.25 → $0.20. Cache writes $3.125 → $2.50.
- [OpenAI] `gpt-5.6-luna` — $1.00/$6.00 → $0.20/$1.20 per 1M tokens. Cached input $0.10 → $0.02. Cache writes $1.25 → $0.25.
- [Gemini] `gemini-3.6-flash` — $1.50/$7.50 → $0.75/$3.75 per 1M tokens. Cached input $0.15 → $0.075. Cache storage $1.00 → $0.50 per 1M tokens per hour. This promotional price runs through 2026-12-31.
- [xAI] `grok-4.5` — cached input $0.50 → $0.30 per 1M tokens.
- [xAI] `grok-imagine-image` — the price is now flat at $0.02 per image for both `1k` and `2k`.
- [xAI] `grok-imagine-image-quality` — the price is now flat at $0.05 per image. The 2k price drops from $0.07 to $0.05.
- [Anthropic] `claude-sonnet-5` — the $2.00/$10.00 price is now the standard price. The increase to $3.00/$15.00 on 2026-09-01 will not occur.
- [Anthropic] `claude-opus-4-8` — fast mode is now available at $10.00 input and $50.00 output per 1M tokens. Fast mode covers Claude Opus 5 and Claude Opus 4.8 only.
- [Anthropic] US-only inference costs 1.1x on all token types for Claude 4.6 and later models. Earlier models do not accept the parameter.
- [Gemini] `gemini-2.5-computer-use-preview-10-2025` — prompts of more than 200k tokens now cost $2.50 input and $15.00 output per 1M tokens.
- [DeepInfra] 22 models had a price change.
    - The price went up for 17 models:
        - `Qwen/Qwen2.5-72B-Instruct` $0.12/$0.39 → $0.36/$0.40
        - `meta-llama/Llama-3.2-11B-Vision-Instruct` $0.049/$0.049 → $0.345/$0.345
        - `NousResearch/Hermes-3-Llama-3.1-70B` $0.30/$0.30 → $0.70/$0.70
        - `nvidia/Llama-3.3-Nemotron-Super-49B-v1.5` $0.10/$0.40 → $0.40/$0.40
        - `Qwen/Qwen3-235B-A22B-Instruct-2507` $0.071/$0.10 → $0.09/$0.55
        - `Qwen/Qwen3-30B-A3B` $0.08/$0.28 → $0.12/$0.50
        - `Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo` input $0.22 → $0.30
        - `zai-org/GLM-4.6` $0.43/$1.74 → $0.50/$2.00
        - `deepseek-ai/DeepSeek-V3.1` $0.21/$0.79 → $0.25/$0.95
        - `deepseek-ai/DeepSeek-V3.1-Terminus` $0.21/$0.79 → $0.27/$0.95
        - `deepseek-ai/DeepSeek-V3-0324` $0.20/$0.77 → $0.24/$0.90
        - `meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` $0.15/$0.60 → $0.20/$0.80
        - `meta-llama/Llama-4-Scout-17B-16E-Instruct` input $0.08 → $0.10
        - `meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo` output $0.03 → $0.04
        - `google/gemma-3-12b-it` $0.04/$0.13 → $0.05/$0.15
        - `google/gemma-3-4b-it` $0.04/$0.08 → $0.05/$0.10
        - `MiniMaxAI/MiniMax-M2.5` output $0.95 → $1.15
    - The price went down for 6 models:
        - `zai-org/GLM-5` $0.80/$2.56 → $0.60/$2.08
        - `Qwen/Qwen3-Embedding-8B` $0.05 → $0.01
        - `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B` $0.10/$0.50 → $0.085/$0.40
        - `openai/gpt-oss-120b` $0.039/$0.19 → $0.037/$0.17
        - `mistralai/Mistral-Nemo-Instruct-2407` $0.02/$0.04 → $0.019/$0.03
        - `MiniMaxAI/MiniMax-M2.5` input $0.27 → $0.15

## Deprecated Models:
- [OpenAI] `gpt-5`, `gpt-5-mini`, `gpt-5-nano`, `gpt-5-pro`, `o3`, and `o3-pro` — OpenAI announced the deprecation on 2026-06-11. The shutdown date is 2026-12-11. Replacements: `gpt-5.6-sol` for `gpt-5` and `o3`, `gpt-5.6-terra` for `gpt-5-mini`, and `gpt-5.6-luna` for `gpt-5-nano`. Replace the two pro models with `gpt-5.6-sol` and `reasoning.mode: pro`. The six models work until the shutdown date.
- [DeepInfra] DeepInfra now marks 31 models as deprecated. DeepInfra publishes no shutdown date, so the models continue to work.
    - Anthropic: `claude-3-7-sonnet-latest` → `claude-sonnet-4-6`, `claude-4-sonnet` → `claude-sonnet-4-6`, `claude-4-opus` → `claude-opus-4-7`
    - Meta: `Meta-Llama-3-8B-Instruct` → `Llama-4-Scout-17B-16E-Instruct`, `Meta-Llama-3.1-8B-Instruct` and `Meta-Llama-3.1-70B-Instruct` → their Turbo builds, `Llama-3.2-11B-Vision-Instruct` → `google/gemma-4-31B-it`
    - Qwen: `Qwen2.5-VL-32B-Instruct` → `Qwen3-VL-30B-A3B-Instruct`, `Qwen3-Coder-480B-A35B-Instruct` → the Turbo build, and the three `Qwen3-Embedding-*-batch` models → their standard builds
    - DeepSeek: `DeepSeek-V3.1-Terminus` → `DeepSeek-V4-Flash-0731`, `DeepSeek-R1-0528-Turbo` and `DeepSeek-R1-Distill-Llama-70B` → `DeepSeek-R1-0528`, `DeepSeek-OCR` → `google/gemma-4-31B-it`
    - Moonshot: `Kimi-K2-Instruct-0905`, `Kimi-K2-Thinking`, and `Kimi-K2.5-Turbo` → `Kimi-K2.5`
    - MiniMax: `MiniMax-M2.1` and `MiniMax-M2.5` → `MiniMax-M2.7`
    - NVIDIA: `Llama-3.1-Nemotron-70B-Instruct`, `Llama-3.3-Nemotron-Super-49B-v1.5`, and `NVIDIA-Nemotron-Nano-12B-v2-VL` → `NVIDIA-Nemotron-3-Ultra-550B-A55B`. `NVIDIA-Nemotron-Nano-9B-v2` → `Nemotron-3-Nano-30B-A3B`
    - Others: `zai-org/GLM-4.6V` → `google/gemma-4-26B-A4B-it`, `mistralai/Mixtral-8x7B-Instruct-v0.1` → `Mistral-Small-24B-Instruct-2501`, `Sao10K/L3.3-70B-Euryale-v2.3` → `L3.1-70B-Euryale-v2.2`, `allenai/Olmo-3.1-32B-Instruct`, `allenai/olmOCR-2-7B-1025`, and `PaddlePaddle/PaddleOCR-VL-0.9B` → `google/gemma-4-31B-it`
- [Gemini] `gemini-2.5-pro`, `gemini-2.5-flash`, and `gemini-2.5-flash-lite` are no longer deprecated. Google now gives no shutdown date for the three models. The 2026-10-16 date in the 2026-07-21 update is no longer correct.
- [Gemini] `gemini-robotics-er-1.6-preview` — Google announced the deprecation on 2026-07-30. Replacement: `gemini-robotics-er-2-preview`. Google gives 2026-08-31 as the earliest shutdown date, so the model still works.

## Retired Models:
- [Groq] `llama-3.1-8b-instant` and `llama-3.3-70b-versatile` — shut down 2026-08-16. The shutdown applies to the free and developer tiers. Enterprise customers with a committed-spend contract keep access. Replacements: `openai/gpt-oss-20b` for Llama 3.1 8B, and `openai/gpt-oss-120b` or `qwen/qwen3.6-27b` for Llama 3.3 70B.
- [Groq] `qwen/qwen3-32b` — shut down 2026-07-17. Replacement: `openai/gpt-oss-120b`.
- [Groq] `meta-llama/llama-4-scout-17b-16e-instruct` — shut down 2026-07-17. Replacement: `openai/gpt-oss-120b` or `qwen/qwen3.6-27b`.
- [Anthropic] `claude-opus-4-1` and `claude-opus-4-1-20250805` — shut down on the Claude API on 2026-08-05. The models stay available on Amazon Bedrock and Google Cloud. Replacement: `claude-opus-4-8`.
- [OpenAI] `computer-use-preview`, `gpt-4o-mini-search-preview`, `gpt-4o-search-preview`, `gpt-5-chat-latest`, `gpt-5-codex`, `gpt-5.1-chat-latest`, `gpt-5.1-codex`, `gpt-5.1-codex-max`, `gpt-5.1-codex-mini`, `gpt-5.2-codex`, `o3-deep-research`, and `o4-mini-deep-research` — shut down 2026-07-23.
- [OpenAI] `gpt-5.2-chat-latest` and `gpt-5.3-chat-latest` — shut down 2026-08-10.
- [xAI] `grok-imagine-image-pro` — the name is now an alias of `grok-imagine-image-quality`.

## Other Updates:
- [Anthropic] `claude-sonnet-4-5` — the model has a 200k context window and no 1M tier. We removed the long-context price.
- [Gemini] `gemini-3.5-flash` — Google now lists this model as the legacy Flash model.
- [DeepInfra] `Qwen/Qwen3-Next-80B-A3B-Instruct` — context window 131,072 → 262,144.
- [xAI] `grok-4.3` — xAI removed the alias `grok-latest`. xAI now lists only `grok-4.3-latest`.
- [xAI] `grok-4.20-0309-reasoning`, `grok-4.20-0309-non-reasoning`, `grok-4.20-multi-agent-0309`, and `grok-build-0.1` — xAI removed the region `eu-west-1`. xAI now lists `us-east-1` and `us-west-2` only.
- [xAI] `grok-imagine-image` — xAI removed the region `eu-west-1` and added the region `us-saltlake-2`.
- [xAI] `grok-4.20-multi-agent-0309` — the display name is now "Grok 4.20 Multi-Agent Beta". The reasoning effort selects the agent count. `low` or `medium` runs 4 agents. `high` or `xhigh` runs 16 agents.
- [xAI] `grok-build-0.1` — xAI removed the 20% batch discount. xAI lists the discount for `grok-4.3` and the three `grok-4.20` models only.
- [xAI] Rate limits changed for all models. `grok-4.5` 7,200 → 9,000 rpm. `grok-4.3`, the two `grok-4.20` chat models, and `grok-build-0.1` 1,800 → 2,220 rpm. `grok-4.20-multi-agent-0309` 450 → 540 rpm. The two image models 300 → 360 rpm.
- [OpenAI] We corrected the abilities of 42 models. OpenAI gives a list of supported features and supported tools on each model page. We read that list again for every model. Older models gained abilities they always had: web search, code execution, image generation, file upload, and prompt caching. Examples: `gpt-4o` and `gpt-4o-mini` gained web search, code execution, image generation, and file upload. `gpt-5.1` and `gpt-5.2` gained the same four. `o3` gained all four. `gpt-5.3-codex`, `gpt-5.2-codex`, and the three `gpt-5.1-codex` models gained web search.
- [OpenAI] `gpt-4.1-nano` — the model does not support web search. OpenAI does not list web search for this model.
- [Groq] `qwen/qwen3.6-27b` and `minimaxai/minimax-m2.7` — these two models do not support structured outputs. Groq lists them for JSON object mode only. Use JSON object mode instead.
- [Groq] `openai/gpt-oss-safeguard-20b` — the model does not support code execution. Groq lists code execution for `openai/gpt-oss-120b` and `openai/gpt-oss-20b` only.
- [Groq] `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, and `openai/gpt-oss-safeguard-20b` — these three models support prompt caching. Cached input tokens cost 50% less.
- [Groq] `openai/gpt-oss-120b` and `openai/gpt-oss-20b` — the Batch API gives a 50% discount on these two models. The batch discount does not add to the prompt-caching discount.
- [Groq] The request limit is 1,000 requests per minute on the Developer plan for `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `openai/gpt-oss-safeguard-20b`, and `qwen/qwen3.6-27b`.
- [Gemini] `gemini-3.5-flash-lite` — the model now supports computer use. Google lists this ability as a preview.
- [Gemini] `gemini-3-pro-image` — the model does not support structured outputs. Google lists structured outputs as not supported.
- [xAI] The maximum file size is 48 MB for all text models. The earlier value of 20 MB was the maximum size of one input image, not the file size limit.
- [Anthropic] One request accepts a maximum of 600 images or PDF pages on models with a 1M token context window. The maximum is 100 on models with a 200k token context window.
- [DeepInfra] `deepseek-ai/DeepSeek-V4-Flash`, `deepseek-ai/DeepSeek-V4-Pro`, `deepseek-ai/DeepSeek-V4-Pro-0813`, `moonshotai/Kimi-K2.7-Code`, `moonshotai/Kimi-K3`, `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B`, and `zai-org/GLM-5.2` — these seven models accept explicit cache breakpoints. A 5-minute cache write costs 1.25x the input price. A 1-hour cache write costs 2x.
- [DeepInfra] 11 models do not support structured outputs. DeepInfra lists them for JSON mode only: `deepseek-ai/DeepSeek-R1-0528-Turbo`, `deepseek-ai/DeepSeek-R1-Distill-Llama-70B`, `google/gemma-4-31B-it-Ultra`, `inclusionAI/Ling-3.0-flash`, `meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo`, `MiniMaxAI/MiniMax-M2.1`, `MiniMaxAI/MiniMax-M2.5`, `MiniMaxAI/MiniMax-M2.7`, `MiniMaxAI/MiniMax-M2.7-Turbo`, `openai/gpt-oss-120b-Ultra`, and `thinkingmachines/Inkling`.

## Notes:

### Models that are added but not enabled
- [OpenAI] `gpt-5.6-cyber`, `daybreak-blue-latest`, and `daybreak-red-latest` — these models need separate approval through the Daybreak program.
- [Groq] `minimaxai/minimax-m2.7` — Groq offers this model to Enterprise customers only and publishes no price. The record holds `null` for all prices.
- [xAI] `grok-imagine-image-2.0` and `grok-imagine-image-quality` — these models stay disabled until integration is complete.
- [Gemini] `gemini-robotics-er-2-streaming-preview` — Google serves this model through the Live API, a WebSocket interface. The catalog points Gemini records at the OpenAI-compatible endpoint, which does not serve this model. The record stays disabled until integration is complete.
- Retired models keep their record with `isEnabled: false` while the provider still lists the model. We delete the record once the provider drops the model from its documentation, or folds the name into another model. For this reason we deleted `qwen/qwen3-32b`, `meta-llama/llama-4-scout-17b-16e-instruct`, and `grok-imagine-image-pro`.

### Corrections to earlier updates
- [Gemini] The 2026-07-21 update removed `gemini-embedding-001`. That update read the release date of 2026-07-14 as a shutdown date. Google gives a shutdown date of 2028-05-14, so the model is back in the catalog.
- [Gemini] The 2026-07-21 update gave a shutdown date of 2026-10-16 for `gemini-2.5-pro`, `gemini-2.5-flash`, and `gemini-2.5-flash-lite`. Google now gives no shutdown date for these three models.
- [OpenAI] Earlier updates gave incomplete abilities for 42 models. Each OpenAI model page gives a list of supported features and supported tools. Earlier updates read that list for the newest models only. We now read it for every model. See Other Updates for the models that changed.
- [Groq] Earlier updates read the ability list from each Groq model card. The model card for `openai/gpt-oss-safeguard-20b` names code execution, but the code execution page does not list the model. The model cards for `qwen/qwen3.6-27b` and `minimaxai/minimax-m2.7` name JSON object mode, which is not structured outputs. We now read the ability pages, because each one gives a list of supported models.
- [xAI] Earlier updates gave `max_file_size_mb: 20` for all models. That value is the maximum size of one input image. The file size limit is 48 MB.
- [DeepInfra] Earlier updates marked 31 models as deprecated but recorded no date. The list endpoint gives the date as a Unix timestamp.

### Follow-up work
- [Gemini] `gemini-3.7-flash` and `gemini-3.6-flash` prices increase on 2027-01-01 to $1.50 input, $0.15 cached input, $7.50 output, and $1.00 cache storage per 1M tokens per hour. The catalog holds the current price.
- [Gemini] The Imagen 4 models stay enabled. Their shutdown date of 2026-08-17 is today, but Google states that the listed dates are the earliest possible dates. The models page still shows Imagen 4 as "Deprecated" and not "Shut down".
- [DeepInfra] The catalog keeps 4 rerank models. The CLAUDE.md rule lists `chat`, `embedding`, `image_generation`, and `responses` as the accepted modes, so `rerank` is outside that list. These four records were in the catalog before this update. They stay for now.
- [Gemini] Google gives a shutdown date for 6 models, but states that every listed date is the earliest possible date. We record no shutdown date for these models. The dates are: `gemini-3.1-flash-lite` 2027-05-07, `gemini-2.5-flash-image` 2026-10-02, `gemini-embedding-001` 2028-05-14, and the three Imagen 4 models 2026-08-17.
- [DeepInfra] DeepInfra gives a price for two more service tiers. Priority costs 1.5x the standard price on 45 models. Flex costs 0.8x on 70 models. The catalog records neither, because the schema has one field for a price multiplier. A decision on how to hold service-tier prices is open.
- [OpenAI] `gpt-4o-search-preview` and `gpt-4o-mini-search-preview` keep the abilities from the earlier update. The two model pages name an `image_input` feature, but the same pages give text as the only input. The pages also omit web search, which the pricing page bills for both models. Both models shut down on 2026-07-23, so we made no change.
- [Gemini] `gemini-3.1-pro-preview-customtools` stays in the catalog. Google gives no model page for this name. The record was in the catalog before this update.
- [Anthropic] `claude-4-opus-20250514` and `claude-4-sonnet-20250514` stay in the catalog. Anthropic gives no page for either name. It lists `claude-opus-4-20250514` and `claude-sonnet-4-20250514` instead. Both records lack the cache-write prices and the vision ability that their matching records hold. The records were in the catalog before this update.

### Schema and catalog changes
- [DeepInfra] We rebuilt the capabilities from the tags that DeepInfra publishes. This change removes `function_calling` from all 60 models that had it. The CLAUDE.md rule allows `tool_choice` only. The change also replaces `capabilities: null` with an empty array on 31 embedding and rerank models.
- [DeepInfra] We recomputed the cached input price for all models. DeepInfra gives a multiplier of the input price, not an absolute price.
- [DeepInfra] We added `quantization` metadata where DeepInfra publishes it, for example `fp4`, `fp8`, and `bfloat16`.
- [Anthropic] We added `inference_geo_us_multiplier: 1.1` to `claude-opus-5`, `claude-fable-5`, `claude-mythos-5`, `claude-sonnet-5`, `claude-opus-4-8`, `claude-opus-4-7`, `claude-opus-4-6`, and `claude-sonnet-4-6`.
- [Anthropic] We removed the long-context price fields from `claude-sonnet-4-5` and `claude-sonnet-4-5-20250929`.
- [Anthropic] We added `tool_use_system_prompt_tokens` from the pricing page for the `auto` and `none` tool choices. These tokens count against the input price.
    - `claude-opus-5` 286, `claude-opus-4-8` 290, `claude-opus-4-7` 675, `claude-opus-4-6` 497
    - `claude-opus-4-5` and `claude-opus-4-5-20251101` 496, `claude-opus-4-1` and `claude-opus-4-1-20250805` 313
    - `claude-sonnet-5` 354, `claude-sonnet-4-6` 497, `claude-sonnet-4-5` and `claude-sonnet-4-5-20250929` 496
    - `claude-haiku-4-5` and `claude-haiku-4-5-20251001` 496, `claude-3-5-haiku-latest` and `claude-3-5-haiku-20241022` 264
- [Gemini] `gemini-2.5-computer-use-preview-10-2025` — we added `high_context: 200000`.
- [Gemini] Google added two new consumption options: Flex inference at 0.5x the standard price and Priority inference at 1.8x. The catalog records the batch discount only, because the schema has one multiplier field for discounts.
- [xAI] The image size keys `1024x1024` and `2048x2048` are now `1k` and `2k`. We removed the `input_image_per_image` surcharge from both image models. xAI no longer publishes a price for input images.
- [xAI] Rate limits come from the rate limits page at Tier 0. xAI gives requests per second and states that the per-second limit is the per-minute budget divided by 60. The catalog holds the per-second value multiplied by 60.
- [OpenAI] We rebuilt `capabilities` for all 68 models from the supported features and supported tools lists on each model page. The mapping is: `function_calling` to `tool_choice`, `code_interpreter` and `hosted_shell` to `code_execution`, `file_uploads` to `file_upload`, and `web_search`, `image_generation`, `computer_use`, `structured_outputs`, and `prompt_caching` to the same name. `vision` comes from an image input modality. `reasoning` comes from reasoning token support. We map `file_search` to no capability, because it names the retrieval tool and not file upload. This change removed `file_upload` from `gpt-5.6-cyber`, `daybreak-blue-latest`, and `daybreak-red-latest`, which do not list `file_uploads`. We also map `streaming`, `apply_patch`, `skills`, `mcp`, `tool_search`, `evals`, `stored_completions`, `predicted_outputs`, and `fine_tuning` to no capability.
- [OpenAI] We added `max_input_tokens` to the 19 models whose pages give a maximum input size. The value is 922,000 for `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, and `daybreak-blue-latest`, and 272,000 for the other 15. The other models give no maximum input size, so the field stays absent.
- [xAI] We added `max_image_size_mb: 20` to all 10 models and set `max_file_size_mb: 48` on the 7 text models. The 3 Imagine models hold `max_image_size_mb` only, because they accept image input and not file attachments.
- [Anthropic] We added `max_images_per_prompt` to the 14 current models: 600 on the 1M token models and 100 on the 200k token models.
- [Anthropic] We added `deprecated`, `deprecated_date`, `retirement_date`, and `deprecated_reason` to `claude-2.1` (2025-07-21), `claude-3-sonnet-20240229` (2025-07-21), and `claude-instant-1.2` (2024-11-06). These dates come from the deprecation history table. All three records were already disabled.
- [Gemini] We removed `retirement_date` from 6 models. See Follow-up work for the dates.
- [Gemini] We added `gemini-embedding-2-preview` as an alias of `gemini-embedding-2`. The models page uses the `-preview` name, and the deprecations page and the model page use the plain name.
- [Groq] We added `limits.rpm` to 4 models. Earlier updates recorded `tpm` from the Developer plan column of the models page but not `rpm` from the same column.
- [DeepInfra] We added `caching_5m_per_million`, `caching_1h_per_million`, and `limits.explicit_cache_granularity_tokens` to the 7 models with explicit cache breakpoints. DeepInfra gives the cache-write rates as multipliers of the input price.
- [DeepInfra] We added `deprecated_date` to all 31 deprecated models, from the `deprecated` Unix timestamp on the list endpoint.

### Deprecated partner models
- [Vertex] Google deprecated 16 MaaS models on 2026-07-21 and retires them on 2026-10-21: `deepseek-v3.1-maas`, `deepseek-v3.2-maas`, `deepseek-r1-0528-maas`, `deepseek-ocr-maas`, `glm-4.7-maas`, `glm-5-maas`, `gpt-oss-20b-maas`, `kimi-k2-thinking-maas`, `llama-3.3-70b-instruct-maas`, `minimax-m2-maas`, `multilingual-e5-large-instruct-maas`, `multilingual-e5-small-maas`, `qwen3-235b-a22b-instruct-2507-maas`, `qwen3-coder-480b-a35b-instruct-maas`, `qwen3-next-80b-a3b-instruct-maas`, and `qwen3-next-80b-a3b-thinking-maas`. The records carry the dates and stay enabled, because the endpoints still answer until the retirement date. Google gives a Model Garden self-deploy option for each one.
- [Vertex] `grok-4.1-fast-reasoning` and `grok-4.1-fast-non-reasoning` — shut down 2026-08-20. Both records take `isEnabled: false`. Google names Grok 4.3 and Grok 4.6 as the replacements.

### Models that stay out of the catalog
- [DeepInfra] DeepInfra lists 361 models. The catalog holds 163 of them: 129 chat, 30 embedding, and 4 rerank. We exclude these types because the rules do not accept their modes:
    - 50 text-to-image
    - 30 text-to-video
    - 20 text-to-speech
    - 14 speech recognition
    - 2 image classification
    - 1 text-to-music

    Text-to-image is an accepted mode. DeepInfra prices these models per image unit, and the catalog holds no DeepInfra image model today.
- [Gemini] `gemini-3.5-live-translate-preview`, `gemini-3.1-flash-live-preview`, `gemini-3.1-flash-tts-preview`, `gemini-omni-flash`, `gemini-2.5-flash-native-audio-preview-12-2025`, `gemini-2.5-flash-preview-tts`, `gemini-2.5-pro-preview-tts`, the Veo 3.1 models, and the Lyria 3 models.
- [Groq] `whisper-large-v3` and `whisper-large-v3-turbo` (audio transcription), `canopylabs/orpheus-arabic-saudi` and `canopylabs/orpheus-v1-english` (text to speech), and `meta-llama/llama-prompt-guard-2-22m` and `meta-llama/llama-prompt-guard-2-86m` (classifiers). The systems `groq/compound` and `groq/compound-mini` are also excluded, because Groq lists no price for them.
- [OpenAI] `gpt-oss-120b` and `gpt-oss-20b` are open-weight models and OpenAI publishes no price for them. `gpt-5.5-cyber` and `gpt-5.4-cyber` appear in the cyber pricing table but have no model page.
- [Anthropic] `claude-mythos-preview` is deprecated and Anthropic publishes no price or specification for it. Replacement: `claude-mythos-5`.
- [xAI] `grok-imagine-video`, `grok-imagine-video-1.5`, and the `grok-voice-*` models.
- [Gemini] `gemma-4` appears on the pricing page with a free tier only. Google gives no paid price, so the model stays out.
- [Gemini] `deep-research-preview-04-2026`, `deep-research-max-preview-04-2026`, and `antigravity-preview-05-2026` stay in the catalog with `null` prices. Google lists all three on the models page but gives no price for any of them.
- [Groq] `minimaxai/minimax-m2.5` and `qwen/qwen3-vl-32b-instruct` — the changelog announced both for Enterprise customers on 2026-04-18. Neither model is on the models page today.

### Prices that did not change
- [Anthropic] Web search $10 per 1,000 searches. Code execution $0.05 per hour per container after 1,550 free hours per month. Code execution is free with `web_search_20260209` or `web_fetch_20260209` and later.
- [OpenAI] Web search $10 per 1,000 calls. Web search preview on non-reasoning models $25 per 1,000 calls. File search $2.50 per 1,000 calls.
- [Gemini] Grounding is $14 per 1,000 requests for Gemini 3.x models. It is $35 for search and $25 for Maps per 1,000 grounded prompts for Gemini 2.5 models. Gemini 3.x models share 5,000 free search requests per month.
- [xAI] Web search $5, X search $5, code execution $5, file attachments $10, and collections search $2.50 per 1,000 calls.
- [Groq] Cached input tokens cost 50% less. The Batch API gives a 50% discount.
- [DeepInfra] All 163 records hold the price that the list endpoint gives today. No price changed after the earlier price update in this block.

### Sources and coverage
We compared every record in every file against a provider record with a script. Every model in every catalog is accounted for. The paragraphs below give the sources and the result for each provider.

- [DeepInfra] Data comes from `https://api.deepinfra.com/models/list`. This address gives the JSON that the `deepinfra.com/models` page renders. The page itself is a JavaScript application and gives no server-side HTML. No model in the catalog is absent from that list. Every model that the list gives with an accepted mode, and that DeepInfra does not mark as deprecated, is in the catalog. For all 163 records we compared these fields: the input price, the output price, the cached input price, and the cache-write price. We also compared the context window, the deprecation state, the quantization, and the tags.
- [Anthropic] All other records match the documentation. We compared prices, cache-write prices, context windows, max output tokens, and knowledge cutoffs against the models overview, the pricing page, and the context windows page. Anthropic gives tentative retirement dates for active models in the form "not sooner than". These dates are not recorded, because they are not hard cutoffs. Fast mode covers Claude Opus 5 and Claude Opus 4.8 only. This matches the catalog.
- [OpenAI] All other records match the documentation. We read each of the 68 model pages and the pricing page. We compared context windows, max output tokens, modalities, token prices, cache prices, abilities, and knowledge cutoffs. No price and no limit changed. Only the abilities changed. Fast mode is the new name for priority processing since 2026-07-30. Both `service_tier: "priority"` and `service_tier: "fast"` work. The models comparison page now gives four models only, so we read each model page instead.
- [Gemini] All other records match the documentation. We read each model page, the pricing page, the changelog, and the deprecations page. We compared prices, context windows, max output tokens, modalities, abilities, and grounding prices. Each Gemini model page gives an abilities table that marks every ability as supported or not supported. We read that table for every model.
- [Groq] All other records match the documentation. We compared prices, context windows, max completion tokens, token speeds, and rate limits against the models page and each model card. Abilities come from the ability pages, because each one gives a list of supported models. The model cards and the ability pages disagree for two models. We followed the ability pages.
- [xAI] All other records match the documentation. We read each of the 10 model pages, the pricing page, and the release notes. We compared prices, cached prices, long-context prices, context windows, aliases, regions, rate limits, and batch discounts. Only the file size limit changed. xAI now publishes a knowledge cutoff for Grok 4.6 (2026-02-01). The other 9 models have no published cutoff, so the field stays empty.

# 2026-07-25 TARS MODEL UPDATE

## New Models:
- [Anthropic] `claude-opus-5` — new flagship Opus model released 2026-07-24 at $5/$25 per MTok (cached input $0.50; 5m cache write $6.25, 1h cache write $10), 1M context window at standard pricing, 128k max output, thinking on by default, full `low`/`medium`/`high`/`xhigh`/`max` effort ladder, `computer-use-2025-11-24` support, code execution, web search, vision, PDF/files, and structured outputs. Also records the 512-token prompt-cache minimum (down from 1,024 on Opus 4.8) and fast-mode pricing ($10/$50 per MTok, Claude API only).

## Updated Models:
- [Anthropic] `claude-fable-5` — re-enabled (`isEnabled: false` → `true`); Anthropic states access to Claude Fable 5 and Claude Mythos 5 has been restored. Added `knowledge_cutoff: 2026-01-01`.
- [Anthropic] `claude-mythos-5` — added `knowledge_cutoff: 2026-01-01`; kept `isEnabled: false` (limited availability, invitation-only through Project Glasswing).
- [Anthropic] `claude-sonnet-4-6` — max output tokens 64,000 → 128,000 per the models overview legacy table.
- [Anthropic] `claude-3-5-haiku-latest` / `claude-3-5-haiku-20241022` — marked deprecated with `deprecated_date: 2025-12-19` and `retirement_date: 2026-02-19` (retired on the Claude API; still available on Amazon Bedrock and Google Cloud). Replacement: `claude-haiku-4-5-20251001`.
- [Anthropic] Added `reasoning_efforts` metadata from the effort docs:
    - `claude-opus-4-8`, `claude-opus-4-7` — `low`, `medium`, `high`, `xhigh`, `max`
    - `claude-opus-4-6`, `claude-sonnet-4-6` — `low`, `medium`, `high`, `max` (no `xhigh`)
    - `claude-opus-4-5`, `claude-opus-4-5-20251101` — `low`, `medium`, `high` (`max` is Claude 4.6 and later)

## Notes:
- [Anthropic] `claude-sonnet-5` pricing left at the introductory $2/$10 per MTok, which Anthropic documents as in effect through 2026-08-31; standard pricing of $3/$15 (cached input $0.30; 5m cache write $3.75, 1h cache write $6) takes effect 2026-09-01 and will need a follow-up update.
- [Anthropic] `claude-opus-4-1` / `claude-opus-4-1-20250805` remain deprecated with retirement 2026-08-05; recommended replacement is now `claude-opus-4-8`.
- [Anthropic] Computer use is confirmed unsupported on `claude-fable-5` and `claude-mythos-5`; `computer-use-2025-11-24` covers Opus 5, Sonnet 5, Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 4.6, and Opus 4.5 only.

# 2026-07-21 TARS MODEL UPDATE

## New Models:
- [Gemini] `gemini-3.6-flash` — stable multimodal chat model at $1.50/$7.50 per 1M tokens (cached input $0.15), 1M context, 65k max output, reasoning, tools, structured outputs, computer use, search/Maps grounding, and 50% batch discount.
- [Gemini] `gemini-3.5-flash` — stable multimodal chat model at $1.50/$9.00 per 1M tokens (cached input $0.15), 1M context, 65k max output, reasoning, tools, structured outputs, computer use, search/Maps grounding, and 50% batch discount.
- [Gemini] `gemini-3.5-flash-lite` — stable high-throughput model at $0.30/$2.50 per 1M tokens (cached input $0.03), 1M context, 65k max output, reasoning, tools, structured outputs, and search/Maps grounding.
- [Gemini] `gemini-3.1-flash-lite` — stable replacement for the retired preview at $0.25/$1.50 per 1M text/image/video tokens ($0.50 audio; cached input $0.025/$0.05), 1M context and 65k max output.
- [Gemini] `gemini-3.1-flash-image` — Nano Banana 2 image generation/editing model with text/image/PDF input, text/image output, 131k context, search grounding, and image output priced from $0.045 (0.5K) to $0.151 (4K).
- [Gemini] `gemini-3.1-flash-lite-image` — Nano Banana 2 Lite image generation/editing model with text/image input, text/image output, 65k context, tool choice, and $0.0336 per 1K image.
- [Gemini] `gemini-3-pro-image` — Nano Banana Pro image generation/editing model at $2.00/$12.00 per 1M text tokens and $120.00 per 1M image-output tokens; 1K/2K images cost $0.134 and 4K images $0.24.
- [Gemini] `gemini-2.5-flash-image` — Nano Banana image generation/editing model at $0.30 per 1M input tokens and $0.039 per image, with a 50% batch discount.
- [Gemini] `gemini-embedding-2` — stable multimodal embedding model with 8,192-token input, flexible 128–3,072 dimensions, and per-modality pricing for text, image, audio, and video.
- [Gemini] `gemini-robotics-er-1.6-preview` — multimodal robotics model at $1.00/$5.00 per 1M tokens ($2.00 audio input), 131k context, 65k max output, reasoning, tools, computer use, and search grounding.
- [Gemini] `gemini-2.5-computer-use-preview-10-2025` — computer-use model with image/text input, text output, 128k context, and $1.25/$10.00 per 1M token pricing.
- [Gemini] `deep-research-preview-04-2026` / `deep-research-max-preview-04-2026` — Interactions API research agents with multimodal input, cited text/image reports, 1M context, and 65k max output.
- [Gemini] `antigravity-preview-05-2026` — Interactions API managed agent for multi-step reasoning, code execution, file workflows, and web search with 1M context and 65k max output.
- [Gemini] `imagen-4.0-fast-generate-001` / `imagen-4.0-generate-001` / `imagen-4.0-ultra-generate-001` — Imagen 4 image models at $0.02/$0.04/$0.06 per image with up to four outputs.

## Deprecated Models:
- [Gemini] `gemini-3.1-flash-lite` — scheduled for shutdown 2027-05-07; replacement: `gemini-3.5-flash-lite`.
- [Gemini] `gemini-2.5-pro`, `gemini-2.5-flash`, and `gemini-2.5-flash-lite` — scheduled for shutdown 2026-10-16; replacements: `gemini-3.1-pro-preview`, `gemini-3.6-flash`, and `gemini-3.1-flash-lite` respectively.
- [Gemini] `gemini-2.5-flash-image` — scheduled for shutdown 2026-10-02; Google currently lists the retired `gemini-3.1-flash-image-preview` as its replacement.
- [Gemini] Imagen 4 model family — scheduled for shutdown 2026-08-17; replacement: `gemini-3.1-flash-image`.

## Removed Models:
- [Gemini] `gemini-2.0-flash`, `gemini-2.0-flash-001`, `gemini-2.0-flash-lite`, and `gemini-2.0-flash-lite-001` — shut down 2026-06-01.
- [Gemini] `gemini-2.5-flash-preview-09-2025` and `gemini-2.5-flash-lite-preview-09-2025` — retired preview models replaced by stable Gemini 3.x models.
- [Gemini] `gemini-3.1-flash-lite-preview` — shut down 2026-05-25; replaced by `gemini-3.1-flash-lite`.
- [Gemini] `gemini-embedding-001` and `gemini-embedding-2-preview` — replaced by stable `gemini-embedding-2`; Gemini Embedding 001 shut down 2026-07-14.
- [Gemini] `gemini-robotics-er-1.5-preview` — shut down 2026-04-30; replaced by `gemini-robotics-er-1.6-preview`.

## Updated Models:
- [Gemini] `gemini-3.1-pro-preview` / `gemini-3.1-pro-preview-customtools` — retained current $2.00/$12.00 pricing, high-context tier above 200k tokens, 1M context, 65k max output, and verified tool/grounding capabilities.
- [Gemini] `gemini-3-flash-preview` — retained current $0.50/$3.00 pricing, corrected audio/cache pricing, 1M context, 65k max output, and verified computer-use/tool/grounding capabilities.
- [Gemini] Catalog capabilities normalized to `tool_choice`; removed legacy `function_calling`, added modality-required vision/speech/image-generation capabilities, and aligned limits and pricing with official model, pricing, and deprecation documentation.

# 2026-07-10 TARS MODEL UPDATE

## New Models:
- [OpenAI] `gpt-5.6-sol` — frontier GPT-5.6 model at $5.00/$30.00 per 1M tokens (cached input $0.50; cache writes $6.25), 1.05M context, 128k max output, configurable reasoning (`none`/`low`/`medium`/`high`/`xhigh`/`max`), text/image input, text output, tools, structured outputs, vision, image generation, web search, code execution, and computer use; alias `gpt-5.6`.
- [OpenAI] `gpt-5.6-terra` — balanced GPT-5.6 tier at $2.50/$15.00 per 1M tokens (cached input $0.25; cache writes $3.125), with the same 1.05M context, 128k max output, reasoning efforts, modalities, and tool capabilities as GPT-5.6 Sol.
- [OpenAI] `gpt-5.6-luna` — cost-sensitive GPT-5.6 tier at $1.00/$6.00 per 1M tokens (cached input $0.10; cache writes $1.25), with the same 1.05M context, 128k max output, reasoning efforts, modalities, and tool capabilities as GPT-5.6 Sol.
- [OpenAI] `chat-latest` — latest ChatGPT Instant alias at $5.00/$30.00 per 1M tokens (cached input $0.50), 400k context, 128k max output, text/image input, text output, tools, structured outputs, vision, image generation, web search, and code interpreter support.

## Deprecated Models:
- [OpenAI] `gpt-5.2-chat-latest` / `gpt-5.3-chat-latest` — deprecated 2026-05-08; scheduled for removal 2026-08-10.
- [OpenAI] `gpt-image-1-mini`, `gpt-image-1.5`, and `chatgpt-image-latest` — deprecated 2026-06-02; scheduled for removal 2026-12-01 in favor of `gpt-image-2`.

## Retired Models:
- [OpenAI] `dall-e-2` / `dall-e-3` — disabled after their 2026-05-12 API shutdown.

# 2026-07-09 TARS MODEL UPDATE

## New Models:
- [xAI] `grok-4.5` — flagship coding/agentic model at $2.00/$6.00 per 1M tokens (cached $0.50), 500k context, configurable reasoning (`low`/`medium`/`high`, default high), tools, structured outputs, vision; regions `us-east-1`, `us-west-2`; no batch discount.
- [xAI] `grok-4.3` — flagship general model at $1.25/$2.50 per 1M tokens (cached $0.20), 1M context, configurable reasoning (`none`/`low`/`medium`/`high`), 20% batch discount, tools, structured outputs, vision; aliases `grok-4.3-latest`, `grok-latest`.
- [xAI] `grok-build-0.1` — coding model at $1.00/$2.00 per 1M tokens (cached $0.20), 256k context, reasoning, tools, structured outputs, vision; aliases include retired `grok-code-fast-1` / `grok-code-fast` / `grok-code-fast-1-0825`.

## Removed Models:
- [xAI] `grok-4-1-fast-reasoning` — retired 2026-05-15 (redirects to `grok-4.3` with low reasoning effort).
- [xAI] `grok-4-1-fast-non-reasoning` — retired 2026-05-15 (redirects to `grok-4.3` with none reasoning effort).

## Updated Models:
- [xAI] `grok-4.20-0309-reasoning` / `grok-4.20-0309-non-reasoning` / `grok-4.20-multi-agent-0309`
    - Token pricing: $2.00/$6.00 → $1.25/$2.50 (cached $0.20)
    - Context window: 2,000,000 → 1,000,000
    - Batch discount: 50% off (`batch_discount_multiplier: 0.5`) → 20% off (`0.8`); multi-agent now includes batch discount
    - Multi-agent rate limits: 1,800 rpm / 10M tpm → 450 rpm / 2.5M tpm
    - Regions: added `us-west-2`
    - Removed undocumented `web_search_per_thousand_sources`; kept documented tool surcharges (web/X search, code execution, file attachments, collections)
    - High-context tier remains 2× above 200k tokens

# 2026-06-30 TARS MODEL UPDATE

- [Anthropic] `claude-sonnet-5` — added active chat model with 1M context, 128k max output, introductory $2/$10 per MTok pricing through 2026-08-31, adaptive reasoning/effort, tool choice, structured outputs, vision/PDF/files, web search, code execution, and computer use.
- [Anthropic] `claude-mythos-5` — added disabled limited-availability model; access is suspended as of 2026-06-12.
- [Anthropic] `claude-fable-5` — kept disabled and recorded the 2026-06-12 access suspension.
- [Anthropic] Disabled retired Claude Sonnet 4 and Claude Opus 4 Claude API rows as of 2026-06-15.

# 2026-06-10 TARS MODEL UPDATE

## New Models:
- [Anthropic] `claude-fable-5` — added Claude Fable 5.

## Deprecated Models:
- [Anthropic] `claude-opus-4-1`
- [Anthropic] `claude-opus-4-1-20250805`

# 2026-05-28 TARS MODEL UPDATE

## New Models:
- [Anthropic] `claude-opus-4-8` — added Claude Opus 4.8.

# 2026-04-28 TARS MODEL UPDATE

## New Models:
- [OpenAI] `gpt-5.5` — added newest frontier responses model with text/image input, text output, reasoning support, structured outputs/tool choice, vision, image generation, web search, code execution, computer use.
- [OpenAI] `gpt-5.5-pro` — added higher-compute GPT-5.5 responses model with text/image input, text output, reasoning support, structured outputs/tool choice, vision, image generation, web search, code execution.
- [OpenAI] `gpt-5.4-mini` — added smaller GPT-5.4 responses model with text/image input, text output, reasoning support, structured outputs/tool choice, vision, image generation, web search, code execution, computer use.
- [OpenAI] `gpt-5.4-nano` — added GPT-5.4 nano responses model with text/image input, text output, reasoning support, structured outputs/tool choice, vision, image generation, web search, code execution.
- [OpenAI] `o3-pro` — (reenabled) higher-compute o3 reasoning model for Responses API with text/image input, text output, reasoning support, structured outputs/tool choice, vision.

## Deprecated Models:
- [OpenAI] `gpt-4o-mini-search-preview` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `gpt-5-chat-latest` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `gpt-5.1-codex-mini` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `gpt-5.1-codex-max` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `o4-mini-deep-research` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `gpt-5.2-codex` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `o3-deep-research` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `gpt-5.1-codex` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `gpt-5-codex` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `computer-use-preview` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `gpt-5.1-chat-latest` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `o4-mini` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-10-23`.
- [OpenAI] `gpt-4.1-nano` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-10-23`.
- [OpenAI] `gpt-image-1` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-10-23`.
- [OpenAI] `o1-pro` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-10-23`.
- [OpenAI] `gpt-4o-search-preview` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-07-23`.
- [OpenAI] `o3-mini` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-10-23`.
- [OpenAI] `o1` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-10-23`.
- [OpenAI] `gpt-4o-2024-11-20` — OpenAI does not publish an exact deprecation or retirement date for this ID.
- [OpenAI] `gpt-4o-2024-05-13` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-10-23`.
- [OpenAI] `gpt-4o` — OpenAI does not publish an exact deprecation or retirement date for this ID.
- [OpenAI] `gpt-4o-2024-08-06` — OpenAI does not publish an exact deprecation or retirement date for this ID.
- [OpenAI] `gpt-4-turbo` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-10-23`.
- [OpenAI] `gpt-3.5-turbo` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-10-23`.
- [OpenAI] `gpt-4` — set `deprecated_date: 2026-04-22`, `retirement_date: 2026-10-23`.
- [OpenAI] `dall-e-3` — set `deprecated_date: 2025-11-14`, `retirement_date: 2026-05-12`.
- [OpenAI] `dall-e-2` — set `deprecated_date: 2025-11-14`, `retirement_date: 2026-05-12`.

## Retired Models:
- [OpenAI] `codex-mini-latest` — retired as of `2026-02-12`.
- [OpenAI] `chatgpt-4o-latest` — retired as of `2026-02-17`.
- [OpenAI] `gpt-4.5-preview` — retired as of `2025-07-14`.
- [OpenAI] `gpt-4-turbo-preview` — retired as of `2026-03-26`.
- [OpenAI] `o1-mini` — retired as of `2025-10-27`.
- [OpenAI] `o1-preview` — retired as of `2025-07-28`.

## Updated Models:
- [OpenAI] Normalized capabilities across shared OpenAI models:
    - Removed `function_calling` in favor of `tool_choice` only.
    - Removed unsupported `file_upload` capability entries.
    - Added `vision` to image-input image models and `image_generation` where model/tool support is represented in the catalog.
- [OpenAI] Updated deprecated model records so only retired models are disabled; active deprecated models retain `deprecated: true`, and retired models are listed separately above.
- [OpenAI] Removed the deprecated marker from `gpt-5` and `o3`.
- [OpenAI] `gpt-4.1-nano` — corrected context window from 1,048,576 to 1,047,576.
- [OpenAI] `gpt-5`, `gpt-5.1`, and `gpt-5.2` — added explicit reasoning effort metadata.
- [OpenAI] `gpt-5.1` — corrected output modality from image+text to text only and trimmed capabilities to reasoning, structured outputs/tool choice, and vision.
- [OpenAI] `gpt-5.4` and `gpt-5.4-pro` — added aliases and normalized capabilities.
- [OpenAI] `gpt-5.5-pro` — removed unsupported above-272k input/output pricing multipliers; OpenAI documents no cached-input discount and regional processing uplift for this model.
- [OpenAI] `chatgpt-image-latest`, `gpt-image-1`, `gpt-image-1-mini`, and `gpt-image-1.5` — added vision capability and aliases/source URLs, and refreshed image generation options metadata.
- [OpenAI] `text-embedding-3-large` — corrected output modality from `embedding` + `video` to `embedding`.
- [OpenAI] `text-embedding-ada-002` — removed incorrect `video_generation` capability.


# 2026-04-21 TARS MODEL UPDATE

## Retired Models:
- [Anthropic] `claude-3-haiku-20240307` — Anthropic now lists Claude Haiku 3 as retired on the Claude API effective 2026-04-20, and states that requests to retired models fail. Recommended replacement: `claude-haiku-4-5-20251001`.


# 2026-04-18 TARS MODEL UPDATE

## Notes:
- Going forward, we aim to be faster and more detailed with model updates — shorter lag between provider announcements and our catalog changes, and richer per-model details (capabilities, pricing tiers, rate limits, aliases, deprecation metadata).

## New Models:
- [Anthropic] `claude-opus-4-7` — new flagship GA model released 2026-04-16 at $5/$25 per MTok (same as Opus 4.6), 1M context window at standard pricing, 128k max output, adaptive thinking, high-resolution vision (up to 2576px), and `computer-use-2025-11-24` support.
- [xAI] `grok-4-1-fast-reasoning`
- [xAI] `grok-4-1-fast-non-reasoning`
- [xAI] `grok-4.20-0309-reasoning`
- [xAI] `grok-4.20-0309-non-reasoning`
- [xAI] `grok-4.20-multi-agent-0309`
- [Groq] `openai/gpt-oss-safeguard-20b`

## Removed Models:
- [xAI] `grok-4-0709` — no longer listed on `docs.x.ai/developers/models`
- [xAI] `grok-4-fast-reasoning` — no longer listed on `docs.x.ai/developers/models`
- [xAI] `grok-4-fast-non-reasoning` — no longer listed on `docs.x.ai/developers/models`
- [xAI] `grok-code-fast-1` — no longer listed on `docs.x.ai/developers/models`
- [xAI] `grok-3` — no longer listed on `docs.x.ai/developers/models`
- [xAI] `grok-3-mini` — no longer listed on `docs.x.ai/developers/models`
- [Groq] `meta-llama/llama-4-maverick-17b-128e-instruct`
- [Groq] `moonshotai/kimi-k2-instruct-0905` — retired at 2026-04-15 (replacement: `openai/gpt-oss-120b`). Deprecation announced 2026-03-23.

## Deprecated Models:
- [Anthropic] `claude-3-haiku-20240307` — marked deprecated with `deprecated_date: 2026-02-19` and `retirement_date: 2026-04-20` per the model deprecations page (replacement: `claude-haiku-4-5-20251001`).
- [Anthropic] `claude-sonnet-4-20250514` scheduled to be retired at 2026-06-15 (replacement: `claude-sonnet-4-6`). Announced 2026-04-14.
- [Anthropic] `claude-opus-4-20250514` scheduled to be retired at 2026-06-15 (replacement: `claude-opus-4-6`). Announced 2026-04-14.

## Renamed Models:
- [xAI] `grok-4.20-beta-0309-reasoning` → `grok-4.20-0309-reasoning` — xAI promoted Grok 4.20 from beta to GA; canonical model ID on docs dropped `beta` (display name "Grok 4.20 Beta" → "Grok 4.20"). Old beta ID kept as alias for backwards compatibility.
- [xAI] `grok-4.20-beta-0309-non-reasoning` → `grok-4.20-0309-non-reasoning` — same GA promotion as above.
- [xAI] `grok-4.20-multi-agent-beta-0309` → `grok-4.20-multi-agent-0309` — same GA promotion as above.

## Disabled Models (added with `isEnabled: false`):
- [xAI] `grok-imagine-image` — image generation model; per-image pricing doesn't map cleanly to the token-based schema, disabled pending integration.
- [xAI] `grok-imagine-image-pro` — image generation model; same reason as above.

## Updated Models:
- [Anthropic] `claude-sonnet-4-6`
    - Context window: 200,000 → 1,000,000 (docs confirm full 1M at standard pricing — `Opus 4.7, Opus 4.6, and Sonnet 4.6 include the full 1M token context window at standard pricing`)
    - Removed high-context tier pricing (`input_tokens_price_per_million_high_context`, `cached_tokens_price_per_million_high_context`, `output_tokens_price_per_million_high_context`, `caching_tokens_price_per_million_high_context`) — no premium applies above 200k
- [Anthropic] `claude-3-haiku-20240307`
    - Removed `computer_use` capability — Haiku 3 is not listed among models supported by either `computer-use-2025-11-24` or `computer-use-2025-01-24` per the computer use tool docs
- [xAI] `grok-4.20-multi-agent-0309`
    - Removed `batch_discount_multiplier` (multi-agent doesn't support the Batch API per docs)
    - Rate limits: 607 rpm / 4M tpm → 1,800 rpm / 10M tpm
    - Aliases expanded (`grok-4.20-multi-agent`, `grok-4.20-multi-agent-latest`, `grok-4.20-multi-agent-beta-0309`)
- [xAI] `grok-4.20-0309-reasoning` / `grok-4.20-0309-non-reasoning`
    - Rate limits: 607 rpm / 4M tpm → 1,800 rpm / 10M tpm
    - Aliases expanded with canonical non-beta forms (`grok-4.20`, `grok-4.20-reasoning`, `grok-4.20-non-reasoning`, `-latest` and `-gv2` variants)
    - Description: removed "Beta" wording; typo fix ("adherance" → "adherence")
- [xAI] `grok-4-1-fast-reasoning` / `grok-4-1-fast-non-reasoning`
    - Rate limits: 607 rpm / 4M tpm → 1,800 rpm / 10M tpm
    - Removed `us-east-4` region (not listed on current docs pages)
- [xAI] Source URLs migrated from `docs.x.ai/docs/models/...` to `docs.x.ai/developers/models/...` for all xAI models

## Schema Changes:
- Removed `function_calling` and `parallel_function_calling` from `MODEL_CAPABILITIES` in `schema.ts`. Consolidated under `tool_choice` — a model that supports function calling / tool use / tool calling / parallel function calling now sets only `tool_choice`.
- All xAI models migrated: `function_calling` → `tool_choice`.
- All Anthropic models migrated: removed `function_calling` from every model's capabilities (all retain `tool_choice`).
- Applied new CLAUDE.md rules to xAI models:
    - Functionality with an entry in `additionalPricePerMillion` implies its capability (e.g. `web_search_per_thousand_calls` → `web_search` capability). Added `code_execution` to all xAI chat models.
    - `modalities.input.image` → `vision` capability. Added `vision` to all xAI multimodal chat models.
    - `modalities.output.image` → `image_generation` capability. Applied to the two new `grok-imagine-*` models.

# 2026-02-20 TARS MODEL UPDATE

## New Models:
- [Google Gemini] `gemini-3-1-pro-preview`
    - Built to refine the performance and reliability of the Gemini 3 Pro series, Gemini 3.1 Pro Preview provides better thinking, improved token efficiency, and a more grounded, factually consistent experience. 
    - It's optimized for software engineering behavior and usability, as well as agentic workflows requiring precise tool usage and reliable multi-step execution across real-world domains.
- [Google Gemini] `gemini-3-1-pro-preview-customtools`
    - Gemini 3.1 Pro Preview endpoint optimized for agentic workflows that use custom tools and bash
- [Google Gemini] `gemini-3-flash-preview`
    - Gemini 3 Flash combines Gemini 3 Pro's reasoning capabilities with the Flash line's levels on latency, efficiency, and cost. It not only enables everyday tasks with improved reasoning, but is designed to tackle the most complex agentic workflows.

## Deprecated Models:
- [Anthropic] `claude-3-haiku-20240307` scheduled to be retired at 2026-04-20
- [Anthropic] `claude-3-haiku` scheduled to be retired at 2026-04-20

## Retired Models:
- [Anthropic] `claude-3-7-sonnet-20250219`
- [Anthropic] `claude-3-7-sonnet-latest`
- [Anthropic] `claude-3-5-haiku-20241022`
- [Anthropic] `claude-3-5-haiku-latest`
- [VertexAnthropic] `vertexanthropic/claude-3-5-haiku`
- [VertexAnthropic] `vertexanthropic/claude-3-5-haiku@20241022`
