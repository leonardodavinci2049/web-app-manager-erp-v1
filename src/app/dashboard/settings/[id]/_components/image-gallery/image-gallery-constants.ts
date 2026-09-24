export const SETTINGS_GALLERY_ENTITY_TYPE = "APP" as const;
export const SETTINGS_GALLERY_LIMIT = 7;
export const SETTINGS_GALLERY_MAX_FILE_SIZE = 2 * 1024 * 1024;
export const SETTINGS_GALLERY_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export const SETTINGS_GALLERY_ACCEPT =
  SETTINGS_GALLERY_ACCEPTED_MIME_TYPES.join(",");
export const DEFAULT_SETTINGS_IMAGE_URL = "/default-images/app-config.png";
