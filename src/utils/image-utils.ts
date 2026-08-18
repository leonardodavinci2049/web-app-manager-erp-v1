import {
  REMOTE_IMAGE_ORIGINS,
  toImageOriginKey,
} from "@/core/config/image-origins";

/**
 * Image validation and fallback utilities
 */

// Imagem padrão para fallback
export const DEFAULT_PRODUCT_IMAGE = "/images/product/no-image.jpeg";

/**
 * Origins remotos permitidos para `next/image`.
 * Derivado de `REMOTE_IMAGE_ORIGINS` (fonte única de verdade), consumido
 * também por `images.remotePatterns` em `next.config.ts`.
 */
const ALLOWED_IMAGE_ORIGINS = new Set(
  REMOTE_IMAGE_ORIGINS.map((origin) => toImageOriginKey(origin)),
);

function isAllowedImageOrigin(url: URL): boolean {
  const port = url.port ? `:${url.port}` : "";
  const originKey = `${url.protocol}//${url.hostname}${port}`;
  return ALLOWED_IMAGE_ORIGINS.has(originKey);
}

/**
 * Valida se uma URL de imagem é válida
 * URLs remotas precisam pertencer aos origins configurados em
 * `next.config.ts`; caso contrário o Next.js Image rejeita o render.
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return false;
  }

  const trimmedUrl = url.trim();

  // Se é uma URL relativa (começa com /), é válida
  if (trimmedUrl.startsWith("/")) {
    return true;
  }

  try {
    const urlObj = new URL(trimmedUrl);

    // Verifica se é HTTPS ou HTTP
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return false;
    }

    // Apenas origins configurados em next.config.ts
    return isAllowedImageOrigin(urlObj);
  } catch {
    return false;
  }
}

/**
 * Valida se uma extensão de arquivo é de imagem
 */
export function isValidImageExtension(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const lowerUrl = url.toLowerCase();

  return validExtensions.some((ext) => lowerUrl.includes(ext));
}

/**
 * Retorna uma URL de imagem válida ou a imagem padrão
 */
export function getValidImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return DEFAULT_PRODUCT_IMAGE;
  }

  const trimmedUrl = url.trim();

  // Se não passa na validação básica, usa a imagem padrão
  if (!isValidImageUrl(trimmedUrl)) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  // Se não tem extensão de imagem válida, usa a imagem padrão
  if (!isValidImageExtension(trimmedUrl)) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  return trimmedUrl;
}

/**
 * Hook personalizado para gerenciar estado de erro de imagem
 */
export function createImageErrorHandler(
  fallbackUrl: string = DEFAULT_PRODUCT_IMAGE,
) {
  return {
    onError: (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const img = event.currentTarget;
      if (img.src !== fallbackUrl) {
        img.src = fallbackUrl;
      }
    },
    onLoad: () => {
      // Opcional: pode ser usado para resetar estados de erro
    },
  };
}
