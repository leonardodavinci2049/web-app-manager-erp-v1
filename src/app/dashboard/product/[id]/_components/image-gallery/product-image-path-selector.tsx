"use client";

import { ExternalLink, Image as ImageIcon, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateProductImagePathFromPrimaryAction } from "../../_actions/product-image-gallery-actions";
import { DEFAULT_PRODUCT_IMAGE_URL } from "../../_components/image-gallery/image-gallery-constants";
import type { ProductGalleryImage } from "../../_components/image-gallery/image-gallery-types";

interface ProductImagePathSelectorProps {
  productId: number;
  initialProductImagePath: string;
  initialGalleryImages: ProductGalleryImage[];
  initialGalleryError: string | null;
}

export function ProductImagePathSelector({
  productId,
  initialProductImagePath,
  initialGalleryImages,
  initialGalleryError,
}: ProductImagePathSelectorProps) {
  const router = useRouter();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [galleryImages, setGalleryImages] =
    useState<ProductGalleryImage[]>(initialGalleryImages);
  const [error, setError] = useState<string | null>(initialGalleryError);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [hasProductImageError, setHasProductImageError] = useState(false);
  const productImagePath = initialProductImagePath;
  const primaryImage = useMemo(
    () => galleryImages.find((image) => image.isPrimary),
    [galleryImages],
  );

  useEffect(() => {
    setGalleryImages(initialGalleryImages);
    setError(initialGalleryError);
  }, [initialGalleryError, initialGalleryImages]);

  const updateImagePath = () => {
    startUpdateTransition(async () => {
      const result = await updateProductImagePathFromPrimaryAction(productId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      setHasProductImageError(false);
      setImageErrors(new Set());
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5" />
              Imagem cadastrada no produto
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={updateImagePath}
              disabled={isUpdating || !primaryImage}
            >
              <RefreshCw
                className={`mr-1 h-4 w-4 ${isUpdating ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {productImagePath ? (
            <div className="flex items-start gap-3 rounded-md border p-3">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted sm:size-32">
                <Image
                  src={
                    hasProductImageError
                      ? DEFAULT_PRODUCT_IMAGE_URL
                      : productImagePath
                  }
                  alt="Imagem cadastrada no produto"
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 128px, 96px"
                  onError={() => setHasProductImageError(true)}
                  unoptimized={!hasProductImageError}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  PATH_IMAGEM
                </Badge>
                <code className="block break-all text-xs text-muted-foreground">
                  {productImagePath}
                </code>
                <a
                  href={productImagePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Abrir imagem em nova aba
                </a>
              </div>
            </div>
          ) : (
            <p className="py-4 text-sm italic text-muted-foreground">
              Nenhuma URL cadastrada no campo PATH_IMAGEM.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5" />
            Galeria de Imagens (Assets API)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : galleryImages.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">
              Nenhuma imagem na galeria do Assets API para este produto
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Total de imagens:
                </span>
                <Badge variant="secondary">{galleryImages.length}</Badge>
              </div>

              <Separator />

              <div className="space-y-4 mt-3">
                {galleryImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex items-start gap-3 rounded-md border p-3"
                  >
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted sm:size-32">
                      <Image
                        src={
                          imageErrors.has(image.id)
                            ? DEFAULT_PRODUCT_IMAGE_URL
                            : (image.urls.medium ??
                              image.urls.preview ??
                              image.urls.original)
                        }
                        alt={image.originalName || `Imagem ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(min-width: 640px) 128px, 96px"
                        onError={() =>
                          setImageErrors((previousErrors) =>
                            new Set(previousErrors).add(image.id),
                          )
                        }
                        unoptimized={!imageErrors.has(image.id)}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          {image.isPrimary && (
                            <Badge className="bg-amber-500 text-xs text-white">
                              Principal
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Ordem: {image.displayOrder}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          ID: {image.id.slice(0, 8)}...
                        </span>
                      </div>

                      <code className="block break-all text-xs text-muted-foreground">
                        {image.urls.preview ?? image.urls.original}
                      </code>

                      <a
                        href={image.urls.preview ?? image.urls.original}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Abrir preview em nova aba
                      </a>

                      {productImagePath.trim() ===
                        image.urls.original.trim() && (
                        <Badge variant="secondary">Em PATH_IMAGEM</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
