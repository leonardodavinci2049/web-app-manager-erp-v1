export const SELLER_GALLERY_ENTITY_TYPE = "SELLER" as const;
export const SELLER_GALLERY_LIMIT = 7;
export const SELLER_GALLERY_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const SELLER_GALLERY_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export const SELLER_GALLERY_ACCEPT =
  SELLER_GALLERY_ACCEPTED_MIME_TYPES.join(",");
export const DEFAULT_SELLER_IMAGE_URL = "/default-images/seller.webp";
