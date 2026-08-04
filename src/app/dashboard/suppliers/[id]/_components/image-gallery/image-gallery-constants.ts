export const SUPPLIERS_GALLERY_ENTITY_TYPE = "SUPPLIERS" as const;
export const SUPPLIERS_GALLERY_LIMIT = 7;
export const SUPPLIERS_GALLERY_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const SUPPLIERS_GALLERY_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export const SUPPLIERS_GALLERY_ACCEPT =
  SUPPLIERS_GALLERY_ACCEPTED_MIME_TYPES.join(",");
export const DEFAULT_SUPPLIERS_IMAGE_URL = "/default-images/supplier.webp";
