# Catalog pricing contract

Read this contract before adding, changing, or validating catalog prices.
[models.ts](../schemas/models.ts) defines the allowed fields.
[validate-catalogs.ts](../scripts/validate-catalogs.ts) derives the allowed keys from those definitions and enforces them on JSON.

## Representation and units

Top-level token prices remain decimal strings in USD per million tokens.
Additional rates are finite, nonnegative JSON numbers in USD, or `null`.
Zero means explicitly free. Null means no published rate for that cell.
An omitted field means the catalog has no entry for that cell.
Neither null nor omission establishes availability or permits a fallback to another rate.

| Field family | Unit |
| --- | --- |
| `*_price_per_million*`, `*_per_million_tokens`, `caching_5m_per_million`, `caching_1h_per_million` | USD per million tokens of the named kind |
| `caching_storage_per_million_per_hour` | USD per million stored tokens per hour |
| `*_per_thousand*` | USD per 1,000 named calls, sources, or grounding operations |
| `code_execution_per_hour` | USD per execution hour |
| `image_tokens` | USD per million image tokens, by direction, service, and context tier |
| `input_image_price_per_image`, including service prefixes | USD per processed input image |
| `image_generation`, including service prefixes | USD per generated image, by documented quality and size |
| `x_search_per_thousand_posts` | USD per 1,000 fetched posts |
| `x_search_per_thousand_user_profiles` | USD per 1,000 fetched user profiles |
| `*_multiplier` | Dimensionless factor with the documented scope |

The pricing object has no catch-all field. Media tables retain their existing nesting.
Image quality and size labels come from the provider. Their leaf values use the same numeric rules.
Store provider billing units, raw cents, and unresolved dimensions in local audits under `audits/`.
These supporting artifacts are ignored by Git and excluded from commits.
Record material limitations and source URLs in `CHANGELOG.md` so committed changes remain reviewable.
An image unit is not necessarily one image. A provider's billed token is not necessarily a text token.

## Input image processing

`additionalPricePerMillion.input_image_price_per_image` records a flat USD charge per processed input image.
Its unit is one input image, despite the historical `additionalPricePerMillion` container name.
For example, Janus-Pro-1B costs $0.0005 per input image:

```json
{
  "additionalPricePerMillion": {
    "input_image_price_per_image": 0.0005
  }
}
```

The field accepts a finite, nonnegative number or null. Omission means no recorded cell.
A numeric rate, including zero, counts as a published inference price even when all token prices are null.
Null and omission do not establish a published inference price. Unknown token rates remain null.
Any record with this field, including a null cell, requires image input and the `vision` capability.
Service-specific charges use the same field with a `batch_`, `flex_`, `fast_mode_`, or `priority_` prefix.
The same input and capability requirements apply to these service fields.
The field does not require image output or the `image_generation` mode.
Recording a price does not change `isEnabled`, endpoint compatibility, or a provider hold.

Use this field only when provider documentation establishes a charge per processed input image.
Keep unresolved provider image units in local audits until their conversion to processed input images is documented.
Use `image_tokens` for image-token charges and `image_generation` for generated-image charges.
Count each charge once. Separate image and token charges require evidence that both apply.
Consumers must support this field to calculate these charges. Older consumers cannot infer them from null token prices.

## Service rates

Standard token rates use the existing top-level fields.
Additional service rates use `batch_`, `flex_`, `fast_mode_`, or `priority_` plus a declared base key.
`TOKEN_PRICE_BASES` declares the existing text-token keys.
`MEDIA_TOKEN_RATE_KEYS` declares the audio and embedding-media keys.
`SERVICE_UNIT_RATE_KEYS` declares cache storage and processed-input-image keys.
DeepInfra Priority remains separate from OpenAI and Anthropic Fast mode.
Store absolute service prices. Apply effective promotions once before converting a documented service multiplier.
Preserve unpublished cached rates as null. Omit cells absent from the source.

For example, this fragment records a published Batch price and an unpublished cached-input price:

```json
{
  "additionalPricePerMillion": {
    "batch_input_tokens_price_per_million": 5,
    "batch_output_tokens_price_per_million": 25,
    "batch_cached_tokens_price_per_million": null
  }
}
```

Each represented text-token service requires input and output cells, with null for an unpublished rate.
Media and storage services have independent cells. Their presence does not require invented text or media output prices.
Add cache-read and cache-write cells only when their source and scope are established.
The `caching_tokens` key retains its existing general cache-write meaning.
The `caching_5m` and `caching_1h` keys distinguish published retention durations.

## Media and storage services

Audio fields retain their existing names under each service prefix.
For example, `batch_input_tokens_price_per_million_audio` records Batch audio input in USD per million tokens.
`batch_cached_tokens_price_per_million_audio` records cache reads in the same unit.
The `caching_tokens_price_per_million_audio` base means cache creation, including under a service prefix.
An audio cache-read rate does not establish a cache-creation rate.

Embedding media also retain their existing base names:
`input_audio_per_million_tokens`, `input_image_per_million_tokens`, and `input_video_per_million_tokens`.
Their service fields use the same prefixes. These rates require the corresponding input modality.
Output audio rates require audio output. These requirements also apply to null cells.

Image-token prices remain inside `image_tokens`. Their keys use the same service prefixes.
For example, this fragment records Priority image-output tokens:

```json
{
  "additionalPricePerMillion": {
    "image_tokens": {
      "priority_output_image_tokens_price_per_million": 216
    }
  }
}
```

Image-token input and cache prices require image input. Image-token output prices require image output.
Generated-image service tables use `batch_image_generation`, `flex_image_generation`, `fast_mode_image_generation`, or `priority_image_generation`.
Each table retains documented quality and size labels, with USD per generated image as its unit.
These service tables require image output.

Service cache storage uses keys such as `flex_caching_storage_per_million_per_hour`.
Its unit remains USD per million stored tokens per hour.
Storage and processed-input-image prices do not have context-token overrides.

Use only the service and modality combinations that the provider documents.
Preserve literal published values, including rounded rates and current promotions.
Keep an unpublished cell null or absent according to the source.
An absent media cell does not authorize a fallback to another service or modality.
A documented unified input rate retains its existing generic field.
Per-image and image-token prices can describe two representations of one charge. Consumers must select one representation for that usage.
Separate input processing, output generation, and storage charges require evidence that each charge applies.

## Long context

`limits.high_context` is the input-token threshold.
`limits.high_context_comparison` is `gt` for strictly greater than, or `gte` for greater than or equal to.
Omission means `gt`, preserving the existing contract.
Use the direct provider's operator. Mirrored services can have different boundaries.

Append `_high_context` to the corresponding rate key.
For example, `batch_input_tokens_price_per_million_high_context` overrides Batch input pricing at the threshold.
Compare each long-context price with its own service's base price.
A populated override requires a known base price. Null is not zero.
Each represented text-token context tier requires input and output cells.
Text-token overrides must equal or exceed their own base rate.

Media scalar keys and nested image-token keys also accept `_high_context`.
They use the same input-token threshold and comparison operator.
An independent media override does not require a text-token override or a matching output rate.
Every numeric media override requires its own published base in the same service and namespace.
Media overrides can be lower than that base, as documented for Vertex Gemini 2.5 Flash audio.
For example, this fragment records $1 per million audio input tokens through 200,000 input tokens, then $0.30:

```json
{
  "contextWindow": 1048576,
  "modalities": { "input": ["text", "audio"], "output": ["text"] },
  "capabilities": ["speech_recognition"],
  "limits": { "high_context": 200000, "high_context_comparison": "gt" },
  "additionalPricePerMillion": {
    "input_tokens_price_per_million_audio": 1,
    "input_tokens_price_per_million_audio_high_context": 0.3
  }
}
```

Each record supports one shared input-token threshold. Conflicting modality thresholds remain unresolved until the contract can represent them.

The threshold must be reachable within `limits.max_input_tokens`, or `contextWindow` when no input cap is published.
Equality with the ceiling is reachable only for `gte`.
Select the service and threshold before reading its price. Apply only one token rate to each unit of usage.

## Tool units and effective dates

X Search has separate fields for calls, fetched posts, and fetched user profiles.
`x_search_per_thousand_calls` retains its original call unit.
The post and profile fields do not replace or reinterpret the call field automatically.
Each X Search field requires the `web_search` capability, including a null or zero rate.

Catalog prices describe the rates in effect at the time of the update.
The schema does not schedule a future price or select it by timestamp.
Keep future prices and their exact effective time in the changelog until they take effect.
For xAI, the September 21, 2026 change takes effect at noon Pacific time.
At that time, replace the applicable call rate with the published post and profile rates.
Before that time, retain the current call rate.

Container memory, session lengths, minimum charges, conditional waivers, and ambiguous provider image units remain outside this contract.
Their billing semantics need a separate design. A general rate field cannot safely represent them.

## Multipliers and compatibility

Batch uses absolute `batch_*` rates exclusively. `batch_discount_multiplier` is removed and rejected by validation.
Readers must select the published Batch cell directly. Do not apply another discount or infer a cached rate.
Existing absolute rates, including null, remain authoritative.
Separate Batch audio, image, and video prices require independent provider evidence.

Regional factors retain explicit names: `inference_geo_us_multiplier`,
`regional_processing_uplift_multiplier`, and `non_global_endpoint_multiplier`.
Their applicability comes from the provider's documentation. They do not establish combinations with other discounts.

The provisional `service_tier_prices`, `service_tier_*_multiplier`, `extra`, and `provider_billing` keys are removed.
Local migration audits record each old path, value, source, and destination or unresolved status.
Completed migration helpers and their tests remain local under ignored `audits/`.

Consumers must adopt the flat fields and the `gte` boundary before using those rates.
The service-media extension preserves existing field names and units.
Consumers must explicitly support its flat fields, nested image-token keys, and generated-image service tables before estimating those charges.
Older readers can miss these charges even when their JSON parser accepts the added fields.
Readers must select a published media override even when it costs less than its base rate.
Consumers that require raw billing dimensions need a separate billing contract. The normalized catalog cannot calculate those charges.
This repository has no production billing reader, so these checks do not establish downstream compatibility.
Removing the Batch factor is a breaking change for consumers that previously multiplied Standard prices.
Local evidence preserves source cells and distinguishes unresolved or inherited pricing from newly checked provider facts.

## Update and validation workflow

1. Inventory every existing additional-pricing key before changing a catalog.
2. Match each price cell to the provider's service, unit, threshold operator, and effective date.
3. Record source URLs and unresolved mappings in the run's local audit.
4. Before introducing a pricing dimension, extend the shared schema and validator with declared fields.
5. Preserve explicit zero, null, and omission during conversion.
6. Run these checks from the repository root:

```sh
bun tests/validate.test.ts
bun tests/catalog-policy.test.ts
bun tests/validate-cli.test.ts
bun scripts/validate-catalogs.ts
```

For schema changes, also run the TypeScript compiler:

```sh
tsc --noEmit --strict --target es2022 tests/models.typecheck.ts
```

Validate that each catalog diff contains only the intended changes.
Validate equivalent pricing instructions in both local skills. Preserve their browser and path differences.

A passing validator proves structural consistency. It does not prove provider support or current price accuracy.
A blocked provider source leaves verification incomplete. Record that limitation even when validation passes.

The catalog command also checks modality/capability links, mapped tool charges, the image-provider restriction, and retirement dates.
An omitted `isEnabled` means enabled. A retired model must be disabled on its retirement date and afterward.
The command uses the current UTC date. Policy tests pass a fixed date for repeatable boundary checks.
Out-of-scope historical modes retain their existing records. These checks do not authorize new modes.
