"use client";

import { ExternalLink, Image as ImageIcon, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getEntityGalleryAction } from "@/app/actions/action-test-assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GalleryImage } from "@/types/api-assets";

interface ProductImagesListProps {
  productId: number;
}

const ProductImagesList = ({ productId }: ProductImagesListProps) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch gallery images
  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getEntityGalleryAction({
        entityType: "PRODUCT",
        entityId: productId.toString(),
      });

      if (!response.success) {
        setError(response.error || "Erro ao carregar galeria");
        setGalleryImages([]);
      } else {
        setGalleryImages(response.data?.images || []);
      }
    } catch (_err) {
      setError("Erro ao conectar com a API de assets");
      setGalleryImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5" />
              Galeria de Imagens (Assets API)
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGallery}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Carregando galeria...
              </span>
            </div>
          ) : error ? (
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
                    className="rounded-md border p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        {image.isPrimary && (
                          <Badge className="bg-amber-500 text-white text-xs">
                            Principal
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Ordem: {image.displayOrder}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        ID: {image.id.slice(0, 8)}...
                      </span>
                    </div>

                    <div className="space-y-1">
                      {image.urls.preview && (
                        <div className="flex items-start gap-2">
                          <code className="text-xs break-all text-muted-foreground flex-1">
                            {image.urls.preview}
                          </code>
                        </div>
                      )}
                    </div>

                    <div>
                      {image.urls.preview && (
                        <a
                          href={image.urls.preview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Abrir preview em nova aba
                        </a>
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
};

export default ProductImagesList;
