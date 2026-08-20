export const BRAND_GALLERY_ENTITY_TYPE = "BRAND" as const;
export const BRAND_GALLERY_LIMIT = 7;
export const BRAND_GALLERY_MAX_FILE_SIZE = 2 * 1024 * 1024;
export const BRAND_GALLERY_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export const BRAND_GALLERY_ACCEPT = BRAND_GALLERY_ACCEPTED_MIME_TYPES.join(",");
export const DEFAULT_BRAND_IMAGE_URL = "/images/product/no-image.jpeg";
