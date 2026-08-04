export const CATEGORY_GALLERY_ENTITY_TYPE = "CATEGORY" as const;
export const CATEGORY_GALLERY_LIMIT = 7;
export const CATEGORY_GALLERY_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const CATEGORY_GALLERY_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export const CATEGORY_GALLERY_ACCEPT =
  CATEGORY_GALLERY_ACCEPTED_MIME_TYPES.join(",");
export const DEFAULT_CATEGORY_IMAGE_URL =
  "/default-images/category-banner.webp";
