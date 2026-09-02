/**
 * A galeria da entrada e' somente leitura e exibe as imagens do fornecedor
 * vinculado (`ID_FORNECEDOR`), por isso o entity type e' o de fornecedores.
 */
export const ENTRY_GALLERY_ENTITY_TYPE = "SUPPLIERS" as const;
export const ENTRY_GALLERY_LIMIT = 7;
export const DEFAULT_ENTRY_GALLERY_IMAGE_URL = "/default-images/supplier.webp";
