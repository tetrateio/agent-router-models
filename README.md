# Model Catalogs

This repository holds the provider data and the AI model data for the Tetrate Agent Router Management Plane. `providers.json` lists the providers. Each catalog is a JSON file with the models, prices, limits, and capabilities of one provider. `schemas/models.ts` defines the model record format, and `schemas/providers.ts` defines the provider record format. `CHANGELOG.md` records each update.

## Catalog files

| File | Provider |
|---|---|
| `anthropic.json` | Anthropic |
| `openai.json` | OpenAI |
| `gemini-prod.json` | Google Gemini |
| `xai.json` | xAI |
| `groq.json` | Groq |
| `deepinfra.json` | DeepInfra |
| `vertex.json` | Google Vertex AI (Agent Platform) |
| `vertexanthropic.json` | Google Vertex AI — Anthropic Claude models |

The other JSON files are backups, staging copies, and exports.

## How to update the catalogs

An AI agent does the update. The agent compares each catalog record with the current documentation of the provider. The update scripts run on [Bun](https://bun.sh), so install Bun first.

1. Open a Claude Code session in this repository.
2. Run the `/update-models` skill.

The skill instructs the agent to:

- Read the change feed and the documentation of each provider.
- Compare every catalog record with the provider record.
- Apply the changed prices, limits, and capabilities.
- Add new models and mark deprecated or retired models.
- Write a dated block at the top of `CHANGELOG.md`.

`CLAUDE.md` holds the field rules for catalog records. The skill and the agent obey these rules.
