export const PRODUCT_GALLERY_ENTITY_TYPE = "PRODUCT" as const;
export const PRODUCT_GALLERY_LIMIT = 7;
export const PRODUCT_GALLERY_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const PRODUCT_GALLERY_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export const PRODUCT_GALLERY_ACCEPT =
  PRODUCT_GALLERY_ACCEPTED_MIME_TYPES.join(",");
export const DEFAULT_PRODUCT_IMAGE_URL = "/images/product/no-image.jpeg";
