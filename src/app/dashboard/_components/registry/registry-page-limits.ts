/**
 * Shared paging constants for the registry listing routes. Page limits are the
 * quantities accepted by the filter panels ("Registros por pagina") and by the
 * service paging contracts; `accum` is the URL parameter that stores how many
 * extra batches "Carregar mais" appended on top of the current page.
 */
export const REGISTRY_PAGE_LIMITS = [25, 50, 100] as const;

export type RegistryPageLimit = (typeof REGISTRY_PAGE_LIMITS)[number];

export const REGISTRY_DEFAULT_PAGE_LIMIT: RegistryPageLimit = 50;

/** URL parameter name for the extra batches appended by "Carregar mais". */
export const ACCUM_PARAM_NAME = "accum";

/**
 * Safety cap on URL-driven accumulation. Each extra batch is one more
 * fixed-size service call, so the URL cannot fan out an unbounded number of
 * requests. Beyond the cap the button is disabled and pagination takes over.
 */
export const MAX_REGISTRY_EXTRA_BATCHES = 9;
