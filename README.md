# Model Catalogs

This repository holds provider and model catalogs for the Tetrate Agent Router Management Plane.
[providers.json](providers.json) lists the providers. Each model catalog contains one provider's models, prices, limits, and capabilities.
[CHANGELOG.md](CHANGELOG.md) records catalog updates, source coverage, and unresolved limitations.

## Catalog files

| File | Provider |
|---|---|
| `anthropic.json` | Anthropic |
| `openai.json` | OpenAI |
| `gemini.json` | Google Gemini |
| `xai.json` | xAI |
| `groq.json` | Groq |
| `deepinfra.json` | DeepInfra |
| `vertex.json` | Google Vertex AI (Agent Platform) |
| `vertexanthropic.json` | Google Vertex AI — Anthropic Claude models |

## Type schema reference

The `schemas/` folder contains the reusable TypeScript contract:

- [models.ts](schemas/models.ts) defines model records, pricing fields, units, null semantics, and threshold boundaries.
- [providers.ts](schemas/providers.ts) defines provider records.

Literal field definitions stay beside the types. The runtime validator derives its allowed pricing keys from those definitions.
TypeScript types do not validate JSON files at runtime.

Related files have separate locations:

| Location | Purpose |
|---|---|
| [docs/pricing.md](docs/pricing.md) | Pricing interpretation and update rules |
| [scripts/validate-catalogs.ts](scripts/validate-catalogs.ts) | Runtime validation of model catalogs |
| [tests/](tests/) | Validator regression checks, CLI checks, and the type-check fixture |

## Validation

Catalog validation requires Bun. From the repository root, run:

```sh
bun scripts/validate-catalogs.ts
```

After pricing or schema changes, run the regression checks:

```sh
bun tests/validate.test.ts
bun tests/validate-cli.test.ts
```

For schema changes, also run the type check with the TypeScript compiler:

```sh
tsc --noEmit --strict --target es2022 tests/models.typecheck.ts
```

A passing validator proves structural consistency. Official provider sources establish current prices, capabilities, and availability.

## How to update the catalogs

An AI agent compares each catalog record with the current provider documentation. Both local updater skills use the same pricing contract.

1. Open an agent session in this repository.
2. Invoke the `update-models` skill for your agent:

| Agent | Local skill | Record rules |
|---|---|---|
| Codex | [.agents/skills/update-models/SKILL.md](.agents/skills/update-models/SKILL.md) | [AGENTS.md](AGENTS.md) |
| Claude Code | [.claude/skills/update-models/SKILL.md](.claude/skills/update-models/SKILL.md) | [CLAUDE.md](CLAUDE.md) |

Before price changes, read [the pricing contract](docs/pricing.md).

The skill instructs the agent to:

- Read the change feed and the documentation of each provider.
- Compare every catalog record with the provider record.
- Apply the changed prices, limits, and capabilities.
- Add new models and mark deprecated or retired models.
- Run catalog validation and the required regression checks.
- Write a dated block at the top of `CHANGELOG.md`.

The `audits/` directory holds local provider evidence and completed migration artifacts. Git ignores this directory, and commits exclude its contents.
The changelog records material source gaps, unresolved pricing, and source URLs so each committed update remains reviewable.
