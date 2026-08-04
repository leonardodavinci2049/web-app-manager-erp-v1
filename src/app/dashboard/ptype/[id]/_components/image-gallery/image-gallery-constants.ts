export const PTYPE_GALLERY_ENTITY_TYPE = "PTYPE" as const;
export const PTYPE_GALLERY_LIMIT = 7;
export const PTYPE_GALLERY_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const PTYPE_GALLERY_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export const PTYPE_GALLERY_ACCEPT = PTYPE_GALLERY_ACCEPTED_MIME_TYPES.join(",");
export const DEFAULT_PTYPE_IMAGE_URL = "/default-images/ptype.webp";
