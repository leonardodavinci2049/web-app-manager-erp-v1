"use client";

import Image from "next/image";
import { useState } from "react";
import { createImageErrorHandler, getValidImageUrl } from "@/utils/image-utils";
import { RegistryImageUploadStub } from "./registry-image-upload-stub";
import type { RegistryViewMode } from "./use-registry-view-mode";

const PRODUCT_FALLBACK = "/images/product/no-image.jpeg";

interface RegistryEntityImageProps {
  name: string;
  imagePath?: string;
  defaultImage: string;
  entityLabel: string;
  viewMode: RegistryViewMode;
  size?: "sm" | "md";
  compact?: boolean;
  eager?: boolean;
  className?: string;
}

/**
 * Imagem padronizada de cadastro (Client). Reproduz o padrao visual do catalogo
 * de produtos: no modo grade, um banner de proporcao 3/2 com zoom no hover e o
 * gatilho de upload quando nao ha imagem propria; no modo lista, um quadrado
 * arredondado. O tamanho "sm" renderiza um avatar compacto para linhas de
 * tabela, sem gatilho de upload. Cada modulo preserva sua propria imagem padrão
 * via `defaultImage`.
 */
export function RegistryEntityImage({
  name,
  imagePath,
  defaultImage,
  entityLabel,
  viewMode,
  size = "md",
  compact = false,
  eager = false,
  className,
}: RegistryEntityImageProps) {
  const [imageError, setImageError] = useState(false);
  const imageErrorHandler = createImageErrorHandler();

  const hasRealImage =
    !!imagePath &&
    imagePath.trim() !== "" &&
    imagePath !== PRODUCT_FALLBACK &&
    !imageError;

  const src = hasRealImage ? getValidImageUrl(imagePath) : defaultImage;
  const alt = `Imagem ${entityLabel} ${name}`;

  const handleImageError = hasRealImage
    ? (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setImageError(true);
        imageErrorHandler.onError(e);
      }
    : undefined;
  const handleImageLoad = hasRealImage ? () => setImageError(false) : undefined;

  const loading = eager ? "eager" : "lazy";

  if (viewMode === "list" && size === "sm") {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md sm:h-14 sm:w-14">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="56px"
          loading={loading}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
    );
  }

  if (viewMode === "list") {
    const dimensions = compact
      ? "h-14 w-14 sm:h-16 sm:w-16"
      : "h-16 w-16 sm:h-20 sm:w-20";

    return (
      <div className={`relative shrink-0 ${dimensions} ${className ?? ""}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="rounded-md object-cover"
          sizes="80px"
          loading={loading}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        {!hasRealImage && (
          <RegistryImageUploadStub
            viewMode={viewMode}
            entityLabel={entityLabel}
            compact={compact}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-[3/2] overflow-hidden rounded-md ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1200px) 25vw, 20vw"
        loading={loading}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      {!hasRealImage && (
        <RegistryImageUploadStub
          viewMode={viewMode}
          entityLabel={entityLabel}
          compact={compact}
        />
      )}
    </div>
  );
}
