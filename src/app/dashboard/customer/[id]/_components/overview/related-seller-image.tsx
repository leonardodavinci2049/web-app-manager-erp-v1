"use client";

import Image from "next/image";
import { useState } from "react";
import { isValidImageUrl } from "@/utils/image-utils";

const DEFAULT_SELLER_IMAGE = "/default-images/seller.webp";

interface RelatedSellerImageProps {
  imagePath?: string;
  sellerName: string;
}

export function RelatedSellerImage({
  imagePath,
  sellerName,
}: RelatedSellerImageProps) {
  const normalizedImagePath = imagePath?.trim() ?? "";
  const validImagePath = isValidImageUrl(normalizedImagePath)
    ? normalizedImagePath
    : "";
  const [failedImagePath, setFailedImagePath] = useState<string | null>(null);
  const src =
    validImagePath && failedImagePath !== validImagePath
      ? validImagePath
      : DEFAULT_SELLER_IMAGE;

  return (
    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border-2 border-sky-100 bg-muted ring-4 ring-sky-50 sm:size-20 dark:border-sky-900 dark:ring-sky-950">
      <Image
        src={src}
        alt={`Imagem do vendedor ${sellerName}`}
        fill
        className="object-cover"
        sizes="(min-width: 640px) 80px, 64px"
        onError={() => {
          if (validImagePath) setFailedImagePath(validImagePath);
        }}
      />
    </div>
  );
}
