// Cross-field catalog rules from AGENTS.md. Pricing validation remains separate.
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)

const toolCapabilities = {
  web_search_per_thousand_calls: "web_search",
  web_search_per_thousand_sources: "web_search",
  x_search_per_thousand_calls: "web_search",
  x_search_per_thousand_posts: "web_search",
  x_search_per_thousand_user_profiles: "web_search",
  grounding_google_search_per_thousand: "web_search",
  grounding_google_maps_per_thousand: "web_search",
  web_grounding_enterprise_per_thousand: "web_search",
  code_execution_per_thousand_calls: "code_execution",
  code_execution_per_hour: "code_execution",
  file_attachments_per_thousand_calls: "file_upload",
} as const

// Collections and grounding in customer data do not establish web search, file
// uploads, or caller-defined tool support. Add mappings only with a documented
// capability contract for those services.

function calendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split("-").map(Number)
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
}

/** Policy checks cannot establish provider support or verify source documents. */
export function catalogErrors(record: unknown, asOf: string = new Date().toISOString().slice(0, 10)): string[] {
  if (!object(record)) return ["model must be an object"]
  const errors: string[] = []
  const validAsOf = calendarDate(asOf)
  if (!validAsOf) errors.push("asOf must be a valid YYYY-MM-DD calendar date")

  const capabilities: unknown[] = Array.isArray(record.capabilities) ? record.capabilities : []
  const modalities = object(record.modalities) ? record.modalities : {}
  const input: unknown[] = Array.isArray(modalities.input) ? modalities.input : []
  const output: unknown[] = Array.isArray(modalities.output) ? modalities.output : []
  const requireCapability = (condition: boolean, capability: string, source: string) => {
    if (condition && !capabilities.includes(capability))
      errors.push(`${source} requires the ${capability} capability`)
  }

  requireCapability(input.includes("image"), "vision", "modalities.input image")
  requireCapability(input.includes("audio"), "speech_recognition", "modalities.input audio")
  requireCapability(output.includes("image"), "image_generation", "modalities.output image")

  for (const legacy of ["function_calling", "parallel_function_calling"]) {
    if (capabilities.includes(legacy)) errors.push(`${legacy} is not allowed; use tool_choice`)
  }

  if (object(record.additionalPricePerMillion)) {
    for (const [key, capability] of Object.entries(toolCapabilities)) {
      // Presence implies support even when the published rate is null or zero.
      requireCapability(Object.hasOwn(record.additionalPricePerMillion, key), capability, key)
    }
  }

  const enabled = record.isEnabled !== false
  const generatesImages = record.mode === "image_generation" || output.includes("image") || capabilities.includes("image_generation")
  if (enabled && generatesImages && record.provider !== "openai" && record.provider !== "gemini")
    errors.push("image generation requires isEnabled: false unless provider is openai or gemini")

  const metadata = object(record.metadata) ? record.metadata : {}
  const retirement = metadata.retirement_date
  if (retirement !== undefined && retirement !== null && retirement !== "") {
    if (!calendarDate(retirement)) errors.push("metadata.retirement_date must be a valid YYYY-MM-DD calendar date")
    else if (enabled && validAsOf && retirement <= asOf)
      errors.push(`metadata.retirement_date ${retirement} has passed as of ${asOf}; set isEnabled: false`)
  }

  return errors
}
