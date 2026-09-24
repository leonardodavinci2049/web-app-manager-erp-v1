import type { SettingsSearchState } from "./settings-list-types";

type SearchParamValue = string | string[] | undefined;

const SETTINGS_PATH = "/dashboard/settings";
const MAX_SEARCH_LENGTH = 100;

function normalizeSearch(value: SearchParamValue): string {
  const raw = typeof value === "string" ? value : value?.[0];
  return (raw ?? "").trim().slice(0, MAX_SEARCH_LENGTH);
}

export function parseSettingsSearchParams(
  searchParams: Record<string, SearchParamValue>,
): SettingsSearchState {
  return { search: normalizeSearch(searchParams.search) };
}

export function buildSettingsUrl(state: SettingsSearchState): string {
  const params = new URLSearchParams();
  const search = normalizeSearch(state.search);
  if (search) params.set("search", search);

  const query = params.toString();
  return query ? `${SETTINGS_PATH}?${query}` : SETTINGS_PATH;
}

export function buildSettingsDetailHref(
  configId: number,
  state: SettingsSearchState,
): string {
  const returnTo = buildSettingsUrl(state);
  return `${SETTINGS_PATH}/${configId}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getSafeSettingsReturnTo(value?: string): string {
  if (!value) return SETTINGS_PATH;

  try {
    const url = new URL(value, "http://manager.local");
    if (
      url.origin !== "http://manager.local" ||
      url.pathname !== SETTINGS_PATH
    ) {
      return SETTINGS_PATH;
    }

    return buildSettingsUrl({
      search: normalizeSearch(url.searchParams.get("search") ?? undefined),
    });
  } catch {
    return SETTINGS_PATH;
  }
}
