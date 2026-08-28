/**
 * The shape of the providers.json export.
 *
 * The file lists the AI providers that serve the models in the model
 * catalogs. Each provider name here matches the `provider` field in the
 * catalog records.
 */
export type Providers = {
  /** The version of the export format. */
  version: string
  providers: {
    /** The unique provider slug, for example "anthropic" or "xai". */
    name: string
    /** The human-readable provider name, for example "Google Gemini". */
    displayName?: string | null
    /** The base URL of the provider API. */
    apiBaseUrl?: string | null
    /**
     * How requests authenticate, for example "api_key", "vertex", or
     * "vertex_anthropic". A value of "none" means no credential.
     */
    authType?: string | null
    /** Provider-specific routing configuration. */
    metadata?: {
      /** True when the provider serves its own models, for example OpenAI. */
      first_party?: boolean
      /** The request format family, "openai" or "anthropic". */
      type?: string
      /**
       * The wire schema of the backend, for example "openai",
       * "anthropic", "gcpvertexai", or "gcpanthropic".
       */
      backend_schema?: string
      /**
       * How the request carries the API key, for example "bearer",
       * "anthropic", or "gemini".
       */
      api_key_flavor?: string
      /**
       * The API schema version, for example "openai/v1" or
       * "vertex-2023-10-16".
       */
      schema_version?: string
      /** The cloud region of the endpoint, for example "global". */
      region?: string
      /** The Google Cloud project that hosts the Vertex AI endpoints. */
      gcp_project_name?: string
      /**
       * Alternate provider configurations for single operations, keyed
       * by operation name, for example "chat_completion" or
       * "image_generation". A variant overrides the provider fields for
       * that operation only.
       */
      operation_variants?: {
        [operation: string]:
          | {
              /** The provider id that serves this operation. */
              provider_id?: string
              type?: string
              backend_schema?: string
              auth_type?: string
            }
          | undefined
      }
      // Provider-specific fields not covered above
      [key: string]: unknown
    } | null
    /** Whether the gateway can route requests to this provider. */
    isEnabled: boolean
    /** The creation time of the record. Not present in all exports. */
    createdAt?: string | null
    /** The last update time of the record. Not present in all exports. */
    updatedAt?: string | null
  }[]
}
