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
| `image_tokens` | USD per million image tokens, by input/output/cache direction |
| `input_image_price_per_image` | USD per processed input image |
| `image_generation` | USD per generated image, by documented quality and size |
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
The field does not require image output or the `image_generation` mode.
Recording a price does not change `isEnabled`, endpoint compatibility, or a provider hold.

Use this field only when provider documentation establishes a charge per processed input image.
Keep unresolved provider image units in local audits until their conversion to processed input images is documented.
Use `image_tokens` for image-token charges and `image_generation` for generated-image charges.
Count each charge once. Separate image and token charges require evidence that both apply.
Consumers must support this field to calculate these charges. Older consumers cannot infer them from null token prices.

## Service rates

Standard token rates use the existing top-level fields.
Additional service rates use `batch_`, `flex_`, `fast_mode_`, or `priority_` plus a token-price key from `TOKEN_PRICE_BASES`.
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

Each represented service tier requires input and output cells, with null for an unpublished rate.
Add cache-read and cache-write cells only when their source and scope are established.
The `caching_tokens` key retains its existing general cache-write meaning.
The `caching_5m` and `caching_1h` keys distinguish published retention durations.

## Long context

`limits.high_context` is the input-token threshold.
`limits.high_context_comparison` is `gt` for strictly greater than, or `gte` for greater than or equal to.
Omission means `gt`, preserving the existing contract.
Use the direct provider's operator. Mirrored services can have different boundaries.

Append `_high_context` to the corresponding rate key.
For example, `batch_input_tokens_price_per_million_high_context` overrides Batch input pricing at the threshold.
Compare each long-context price with its own service's base price.
A populated override requires a known base price. Null is not zero.
Each represented long-context tier requires input and output cells.

The threshold must be reachable within `limits.max_input_tokens`, or `contextWindow` when no input cap is published.
Equality with the ceiling is reachable only for `gte`.
Select the service and threshold before reading its price. Apply only one token rate to each unit of usage.

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
