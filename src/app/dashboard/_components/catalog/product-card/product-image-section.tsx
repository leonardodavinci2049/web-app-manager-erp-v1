"use client";

import { Plane, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import { createImageErrorHandler, getValidImageUrl } from "@/utils/image-utils";
import { ProductImageUpload } from "../product-image-upload";

interface ProductImageSectionProps {
  product: UIProductManager;
  viewMode: "grid" | "list";
  productDetailsHref?: string;
  hasPromotion?: boolean;
  eager?: boolean;
  compact?: boolean;
}

/**
 * Secao de imagem do card (Client): exibe a imagem do produto ou o uploader,
 * com badges de estado (promocao/novo/importado/esgotado). Dispara
 * `router.refresh()` apos upload para refletir a nova imagem.
 */
export function ProductImageSection({
  product,
  viewMode,
  productDetailsHref,
  hasPromotion = false,
  eager = false,
  compact = false,
}: ProductImageSectionProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const isOutOfStock = product.storeStock === 0;

  const imageUrl = getValidImageUrl(product.imagePath);
  const imageErrorHandler = createImageErrorHandler();
  const detailsHref = productDetailsHref ?? `/dashboard/product/${product.id}`;

  const hasRealImage =
    product.imagePath &&
    product.imagePath.trim() !== "" &&
    product.imagePath !== "/images/product/no-image.jpeg" &&
    !imageError;

  if (!hasRealImage) {
    return (
      <ProductImageUpload
        productId={String(product.id)}
        productName={product.name}
        viewMode={viewMode}
        compact={compact}
        isOutOfStock={isOutOfStock}
        onUploadSuccess={() => router.refresh()}
      />
    );
  }

  if (viewMode === "list") {
    const imageContent = (
      <div
        className={`relative flex-shrink-0 ${
          compact ? "h-14 w-14 sm:h-16 sm:w-16" : "h-16 w-16 sm:h-20 sm:w-20"
        }`}
      >
        <Image
          src={imageUrl}
          alt={`Imagem do produto ${product.name}`}
          fill
          className="rounded-md object-cover"
          sizes="80px"
          loading={eager ? "eager" : "lazy"}
          onError={(e) => {
            setImageError(true);
            imageErrorHandler.onError(e);
          }}
          onLoad={() => setImageError(false)}
        />
        {isOutOfStock && (
          <Badge
            variant="destructive"
            className={`absolute z-10 whitespace-nowrap py-0 ${
              compact
                ? "top-0.5 right-0.5 px-0.5 text-[7px] sm:text-[8px]"
                : "top-1 right-1 px-1 text-[9px]"
            }`}
          >
            SEM ESTOQUE
          </Badge>
        )}
      </div>
    );

    return <Link href={detailsHref}>{imageContent}</Link>;
  }

  const gridImageContent = (
    <div className="relative aspect-[3/2] overflow-hidden rounded-md">
      <Image
        src={imageUrl}
        alt={`Imagem do produto ${product.name}`}
        fill
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1200px) 25vw, 20vw"
        loading={eager ? "eager" : "lazy"}
        onError={(e) => {
          setImageError(true);
          imageErrorHandler.onError(e);
        }}
        onLoad={() => setImageError(false)}
      />

      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {hasPromotion && (
          <Badge className="bg-red-500 text-xs hover:bg-red-600">
            Promoção
          </Badge>
        )}
        {product.launch && (
          <Badge className="bg-blue-500 text-xs hover:bg-blue-600">
            <Star className="mr-1 h-3 w-3" />
            Novo
          </Badge>
        )}
        {product.imported && (
          <Badge variant="secondary" className="text-xs">
            <Plane className="mr-1 h-3 w-3" />
            Importado
          </Badge>
        )}
      </div>

      {isOutOfStock && (
        <Badge
          variant="destructive"
          className="absolute top-1 right-1 z-10 whitespace-nowrap px-1 py-0 text-[9px] sm:top-2 sm:right-2 sm:text-[10px]"
        >
          SEM ESTOQUE
        </Badge>
      )}
    </div>
  );

  return <Link href={detailsHref}>{gridImageContent}</Link>;
}
