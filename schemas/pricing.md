# Catalog pricing contract

Read this contract before adding, changing, or validating catalog prices.
[models.ts](models.ts) defines the allowed fields. [validate.ts](validate.ts) enforces them on JSON.

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
| `image_generation` | USD per generated image, by documented quality and size |
| `*_multiplier` | Dimensionless factor with the documented scope |

The pricing object has no catch-all field. Media tables retain their existing nesting.
Image quality and size labels come from the provider; their leaf values use the same numeric rules.
Provider billing units, raw cents, and unresolved dimensions belong in an audit under `audits/`.
An image unit is not necessarily one image. A provider's billed token is not necessarily a text token.

## Service rates

Standard token rates use the existing top-level fields.
Additional service rates use `batch_`, `flex_`, `fast_mode_`, or `priority_` plus a token-price key from `TOKEN_PRICE_BASES`.
DeepInfra Priority remains separate from OpenAI and Anthropic Fast mode.
Store absolute service prices. Apply effective promotions once before converting a documented service multiplier.
Preserve unpublished cached rates as null; omit cells absent from the source.

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
Use the direct provider's operator; mirrored services can have different boundaries.

Append `_high_context` to the corresponding rate key.
For example, `batch_input_tokens_price_per_million_high_context` overrides Batch input pricing at the threshold.
Compare each long-context price with its own service's base price.
A populated override requires a known base price; null is not zero.
Each represented long-context tier requires input and output cells.

The threshold must be reachable within `limits.max_input_tokens`, or `contextWindow` when no input cap is published.
Equality with the ceiling is reachable only for `gte`.
Select the service and threshold before reading its price; never apply two token rates to the same usage.

## Multipliers and compatibility

`batch_discount_multiplier` remains for existing consumers. Its scope is Standard input/output pricing.
When explicit Batch prices exist, they are authoritative and must agree with that legacy factor.
Do not multiply an explicit Batch price again or use the factor to infer cached prices.
This migration does not synthesize absolute Batch rates for catalogs that contain only the legacy factor.

Regional factors retain explicit names: `inference_geo_us_multiplier`,
`regional_processing_uplift_multiplier`, and `non_global_endpoint_multiplier`.
Their applicability comes from the provider's documentation. They do not establish combinations with other discounts.

The provisional `service_tier_prices`, `service_tier_*_multiplier`, `extra`, and `provider_billing` keys are removed.
[The migration audit](../audits/2026-09-11-pricing-migration.json) records each old path, value, source, and destination or unresolved status.
[migrate-pricing.ts](migrate-pricing.ts) contains the one-time transformation; it leaves formatting and audit storage to its caller.

Consumers must adopt the flat fields and the `gte` boundary before using those rates.
Consumers that require raw billing dimensions need a separate billing contract; the normalized catalog cannot calculate those charges.
This repository has no production billing reader, so these checks do not establish downstream compatibility.
The legacy Batch factor should remain until its downstream consumers have been checked.

## Update and validation workflow

1. Inventory every existing additional-pricing key before changing a catalog.
2. Match each price cell to the provider's service, unit, threshold operator, and effective date.
3. Record source URLs and unresolved mappings in the run's audit.
4. Use declared fields; extend the shared schema and validator before introducing a new pricing dimension.
5. Preserve explicit zero, null, and omission during conversion.
6. Run these checks from the repository root:

```sh
bun schemas/validate.test.ts
bun schemas/migrate-pricing.test.ts
bun schemas/validate-cli.test.ts
bun schemas/validate.ts
```

For schema changes, also compile `schemas/models.typecheck.ts` with TypeScript using `--noEmit --strict --target es2022`.
Compare pre/post migration records to confirm that unrelated fields and existing prices remain unchanged.
Check both local skills for equivalent pricing instructions, preserving their browser and path differences.

A passing validator proves structural consistency. It does not prove provider support or current price accuracy.
A blocked provider source leaves verification incomplete; record that limitation even when validation passes.
