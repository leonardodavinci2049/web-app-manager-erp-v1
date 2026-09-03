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
import { updateCustomerImagePathFromPrimaryAction } from "../../_actions/customer-image-gallery-actions";
import { DEFAULT_CUSTOMER_IMAGE_URL } from "./image-gallery-constants";
import type { CustomerGalleryImage } from "./image-gallery-types";

interface CustomerImagesListProps {
  customerId: number;
  initialCustomerImagePath: string;
  initialGalleryImages: CustomerGalleryImage[];
}

export function CustomerImagesList({
  customerId,
  initialCustomerImagePath,
  initialGalleryImages,
}: CustomerImagesListProps) {
  const router = useRouter();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [galleryImages, setGalleryImages] =
    useState<CustomerGalleryImage[]>(initialGalleryImages);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [hasCustomerImageError, setHasCustomerImageError] = useState(false);
  const customerImagePath = initialCustomerImagePath;
  const primaryImage = useMemo(
    () => galleryImages.find((image) => image.isPrimary),
    [galleryImages],
  );

  useEffect(() => {
    setGalleryImages(initialGalleryImages);
  }, [initialGalleryImages]);

  const updateImagePath = () => {
    startUpdateTransition(async () => {
      const result = await updateCustomerImagePathFromPrimaryAction(customerId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      setHasCustomerImageError(false);
      setImageErrors(new Set());
      router.refresh();
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
        <CardHeader className="px-4 pb-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5" />
              Imagem cadastrada no cliente
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
        <CardContent className="px-4 sm:px-6">
          {customerImagePath ? (
            <div className="flex items-start gap-3 rounded-md border p-3">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted sm:size-32">
                <Image
                  src={
                    hasCustomerImageError
                      ? DEFAULT_CUSTOMER_IMAGE_URL
                      : customerImagePath
                  }
                  alt="Imagem cadastrada no cliente"
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 128px, 96px"
                  onError={() => setHasCustomerImageError(true)}
                  unoptimized={!hasCustomerImageError}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  PATH_IMAGEM
                </Badge>
                <code className="block break-all text-xs text-muted-foreground">
                  {customerImagePath}
                </code>
                <a
                  href={customerImagePath}
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

      <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
        <CardHeader className="px-4 pb-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5" />
            Galeria de Imagens (Assets API)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {galleryImages.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">
              Nenhuma imagem na galeria do Assets API para este cliente
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
                            ? DEFAULT_CUSTOMER_IMAGE_URL
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

                      {customerImagePath.trim() ===
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
