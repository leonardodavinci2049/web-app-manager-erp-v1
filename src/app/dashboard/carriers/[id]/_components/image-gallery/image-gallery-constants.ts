export const CARRIER_GALLERY_ENTITY_TYPE = "CARRIER" as const;
export const CARRIER_GALLERY_LIMIT = 7;
export const CARRIER_GALLERY_MAX_FILE_SIZE = 2 * 1024 * 1024;
export const CARRIER_GALLERY_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export const CARRIER_GALLERY_ACCEPT =
  CARRIER_GALLERY_ACCEPTED_MIME_TYPES.join(",");
export const DEFAULT_CARRIER_IMAGE_URL = "/default-images/carrier.webp";
