*New models in TARE Internal*

Claude Fable 5.2 is out on the Claude API and on Google Cloud, and a few more models landed with it:

• Anthropic *Claude Fable 5.2* — *$8 / $40* per 1M tokens, 1,000,000-token context, 128K max output. Batch is $4 / $20, and fast mode is $16 / $80. It takes text, images, and PDFs. Google Cloud has it at the same prices on the global, `us`, and `eu` endpoints.
• OpenAI *GPT Image 2.6 Sunburst* and *Flare* — *$30* per 1M image output tokens. Input costs $5 per 1M text tokens and $8 per 1M image tokens. Sunburst is for detailed visual work, and Flare is for fast iteration. Image API only, no Batch.
• Google Cloud *Meta Muse Wonder 1.0* ($4 / $20), *Muse Ember 1.0* ($0.10 / $0.50, or $0.30 / $1.50 above 200K tokens), and *Muse Spark 1.3* ($1.25 / $4.25). 1M context. Preview, global endpoint, and Responses API only.
• Google Cloud *Gemini Robotics ER 2 Preview* — *$1 / $5* through Dec 31, then $2 / $10. A robotics reasoning model with a 131K context. Global endpoint only.
• DeepInfra *Kimi K3.1 Pro* — *$1.90 / $9.50* (5% off), 1M context, text and image input.
• Gemini *Embedding 001* is back on the Gemini API at $0.15 per 1M tokens. It is deprecated, so use Gemini Embedding 2 for new work.

*Also worth knowing* :information_source:

:lock: *Added, but turned off*
• *Claude Mythos 5.2* — the same model as Fable 5.2, only for organizations in Anthropic's verification programs.
• *GPT-6-Cyber* — $20 / $100, for authorized vulnerability research. It needs a Daybreak Red account and an extra approval.

:no_entry: *Retired since Oct 27*
• *Oct 29* — DeepInfra MythoMax L2 13B (use L3 8B Lunaris) and Step 5 Preview (use GLM-5.3 Flash).
• *Nov 2* — DeepInfra Hermes 3 Llama 3.1 405B and 70B. Use DeepSeek V4.1 Flash 1017.
• *Nov 2* — xAI Grok Imagine Image Quality. Requests now go to Grok Imagine Image 2.0 at low quality.
• *Nov 3* — DeepInfra Meta Llama 3.1 70B Instruct Turbo. Use Llama 3.3 70B Instruct Turbo.
• *Nov 6* — Gemini Embedding 2 Preview. Requests now go to Gemini Embedding 2 at the same prices.
• Gemini 3.7 Flash and 3.5 Flash on the Gemini API. Google sends their requests to Gemini 3.8 Flash and 3.6 Flash, so TARS turns both off. Both stay available on Google Cloud.

:calendar: *Retiring soon*
• *Nov 15* — DeepInfra Ling 3.1 Flash. Use DeepSeek V4.1 Flash 1017.
• *Nov 19* — Gemini 3.6 Flash on Google Cloud. Use Gemini 3.8 Flash.
• *Nov 30* — Claude Sonnet 4.5 on the Claude API and Google Cloud. Use Claude Sonnet 5.5. Fast mode for Claude Opus 4.8 also ends. Use fast mode on Claude Opus 5.5.
• *Dec 1* — Gemini 2.5 Pro and 2.5 Flash on the Gemini API. Pro requests go to Gemini 3.8 Flash, and Flash requests go to Gemini 3.5 Flash-Lite.
• *Dec 1* — OpenAI GPT Image 1.5, GPT Image 1 Mini, and ChatGPT Image Latest. Use GPT Image 2.6 Sunburst or Flare.
• *Dec 11* — OpenAI GPT-5, GPT-5 mini/nano/pro, o3, and o3-pro.

:moneybag: *Price changes*
• *Hy4 Preview* — its 5% promotion ended: $0.792 / $2.376 → *$0.834 / $2.501*
• *MiMo V2.6 Flash* — its 35% promotion ended: $0.091 / $0.182 → *$0.14 / $0.28*
• *Nemotron 3 Super* — input $0.085 → *$0.075*. Output stays at $0.40.
• *Claude web search on Google Cloud* — now *$10 per 1,000 searches* for every Claude model.
• *Gemini 3 Pro Image* — the Gemini API no longer offers Flex or Priority for it. Standard and Batch prices stay.
• *Coming up* — The GPT-5.6 Sol promotion ($4 / $20) ends Nov 30. Gemini 4 Argon doubles to $4 / $20 on Dec 1. On Jan 1, 2027, Gemini 3.8 Flash goes to $1.50 / $7.50, and Robotics ER 2 goes to $2 / $10.

:warning: *On promotional rates*
DeepInfra has 12 promotions with no published end date. Kimi K3.1 Pro (5% off) is new. The Hy4 Preview and MiMo V2.6 Flash promotions also had no published end date, and both ended in this period. Budget for the list price.

:globe_with_meridians: *Availability and limits*
• Claude API Messages requests now take up to 128 MB, up from 32 MB.
• Grok 4.7 on Google Cloud is now generally available on the global and US endpoints. Grok Imagine Image 2.0 now also runs in `us-saltlake-2`.
• Claude models on Google Cloud now list structured outputs. An organization policy turns the feature off by default.
• Five DeepInfra DeepSeek models now return up to 393,216 output tokens, and DeepSeek V3.1 up to 163,840.

:wrench: *Catalog fixes*
• Claude records now show the 500 MB Files API upload limit. Before, they showed 32 MB, the old request limit.
• xAI per-minute rate limits now match the values that xAI publishes. For example, Grok 4.7 is 7,200 RPM, not 9,000.
• Grok on Google Cloud no longer lists prompt caching, because Google does not list it for Grok. The cache-hit prices stay.
