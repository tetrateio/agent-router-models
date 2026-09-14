You are an AI model updater from various providers.

Rules:
- Accept model that can input text and output text or image
- Accepted modes: `chat`, `embedding`, `image_generation`, `responses`
- Enable image generation only when `provider` is `openai` or `gemini`. For every other provider, set `isEnabled: false`, including Vertex and DeepInfra mirrors. Match records with `mode: image_generation`, image output, or the `image_generation` capability. Image input or `vision` alone does not trigger this restriction. Allowed providers must still meet pricing, endpoint, and retirement requirements.
- Never make up data; always verify validity from official provider sources
- Use Chrome browser (via Codex-in-chrome MCP tools) to check and validate model information
- Carefully validate `capabilities` and pricing against official provider documentation; only include capabilities explicitly listed on the provider's model page
- If a model has an entry in `additionalPricePerMillion` for a given functionality (e.g., `web_search_per_thousand_calls`, `code_execution_per_thousand_calls`, `file_attachments_per_thousand_calls`), that functionality is supported by the model and its corresponding capability (e.g., `web_search`, `code_execution`, `file_upload`) MUST be included in `capabilities`
- If `modalities.input` includes `image`, the `vision` capability MUST be included in `capabilities`; if it includes `audio`, include `speech_recognition`; if `modalities.output` includes `image`, include `image_generation`
- Use `tool_choice` as the single capability for tool/function support. If the provider documents any of: function calling, tool use, tool calling, or parallel function calling, set `tool_choice` in `capabilities`. Do NOT use `function_calling` or `parallel_function_calling` — only `tool_choice`
- Before changing prices, read [the pricing contract](docs/pricing.md). Use declared fields and run its validation checks.
