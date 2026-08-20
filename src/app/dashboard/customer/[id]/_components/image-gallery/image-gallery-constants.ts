export const CUSTOMER_GALLERY_ENTITY_TYPE = "CUSTOMER" as const;
export const CUSTOMER_GALLERY_LIMIT = 7;
export const CUSTOMER_GALLERY_MAX_FILE_SIZE = 2 * 1024 * 1024;
export const CUSTOMER_GALLERY_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export const CUSTOMER_GALLERY_ACCEPT =
  CUSTOMER_GALLERY_ACCEPTED_MIME_TYPES.join(",");
export const DEFAULT_CUSTOMER_IMAGE_URL = "/default-images/customer.webp";
