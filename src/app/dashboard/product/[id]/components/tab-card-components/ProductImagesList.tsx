"use client";

import {
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { updateProductImagePath } from "@/app/actions/action-product-updates";
import { getEntityGalleryAction } from "@/app/actions/action-test-assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import type { GalleryImage } from "@/types/api-assets";

interface ProductImagesListProps {
  product: UIProductManager;
  productId: number;
  initialDescription?: string;
}

// Normaliza URL removendo sufixos de tamanho (-original, -preview, -medium, -thumbnail)
const normalizeImageUrl = (url: string): string => {
  return url.replace(/-(original|preview|medium|thumbnail)\./gi, ".");
};

const ProductImagesList = ({ product, productId }: ProductImagesListProps) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingPath, setIsUpdatingPath] = useState(false);

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

  const pathImagem = product.imagePath;

  // Verifica se há divergência entre PATH_IMAGEM e a imagem principal da galeria
  const syncInfo = useMemo(() => {
    const primaryImage = galleryImages.find((img) => img.isPrimary);
    const primaryUrl = primaryImage?.urls.preview;

    if (!primaryUrl) {
      return { hasDivergence: false, primaryUrl: null, primaryImageId: null };
    }

    const normalizedPathImagem = pathImagem
      ? normalizeImageUrl(pathImagem)
      : null;
    const normalizedPrimaryUrl = normalizeImageUrl(primaryUrl);
    const hasDivergence = normalizedPrimaryUrl !== normalizedPathImagem;

    return {
      hasDivergence,
      primaryUrl,
      primaryImageId: primaryImage?.id || null,
    };
  }, [galleryImages, pathImagem]);

  // Handler para atualizar o PATH_IMAGEM com a URL da imagem principal
  const handleSyncPathImagem = useCallback(
    async (newImageUrl: string) => {
      setIsUpdatingPath(true);
      try {
        const result = await updateProductImagePath(productId, newImageUrl);

        if (result.success) {
          toast.success("Campo PATH_IMAGEM atualizado com sucesso!");
          // Força refresh da página para atualizar os dados do produto
          window.location.reload();
        } else {
          toast.error(result.error || "Erro ao atualizar PATH_IMAGEM");
        }
      } catch (_err) {
        toast.error("Erro ao conectar com o servidor");
      } finally {
        setIsUpdatingPath(false);
      }
    },
    [productId],
  );

  return (
    <div className="space-y-4">
      {/* Section 1: PATH_IMAGEM do Produto */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5" />
            Campo PATH_IMAGEM do Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Valor atual:
              </span>
              {pathImagem ? (
                <Badge variant="secondary" className="font-mono text-xs">
                  Preenchido
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Vazio
                </Badge>
              )}
            </div>

            {pathImagem ? (
              <div className="rounded-md bg-muted p-3">
                <code className="text-xs break-all text-foreground">
                  {pathImagem}
                </code>
                <div className="mt-2">
                  <a
                    href={pathImagem}
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
              <p className="text-sm text-muted-foreground italic">
                Nenhuma URL de imagem definida no campo PATH_IMAGEM
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: URLs da Galeria de Imagens */}
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

                    <div className="flex items-center justify-between">
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

                      {/* Botão para sincronizar PATH_IMAGEM - sempre visível para imagem principal */}
                      {image.isPrimary && image.urls.preview && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (image.urls.preview) {
                              handleSyncPathImagem(image.urls.preview);
                            }
                          }}
                          disabled={isUpdatingPath}
                          className="text-xs"
                        >
                          {isUpdatingPath ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Upload className="h-3 w-3 mr-1" />
                          )}
                          Atualizar PATH_IMAGEM
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Comparação */}
      {pathImagem && galleryImages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Verificação de Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const isInSync = !syncInfo.hasDivergence;

              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    {isInSync ? (
                      <Badge className="bg-green-500 text-white">
                        ✓ Sincronizado
                      </Badge>
                    ) : (
                      <Badge variant="destructive">✗ Dessincronizado</Badge>
                    )}
                  </div>

                  {!isInSync && (
                    <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 p-3 mt-2 space-y-2">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        O campo PATH_IMAGEM não corresponde à URL da imagem
                        principal na galeria.
                      </p>
                      <div className="text-xs space-y-1">
                        <div>
                          <strong>PATH_IMAGEM:</strong>{" "}
                          <code className="break-all">{pathImagem}</code>
                        </div>
                        <div>
                          <strong>Imagem Principal (preview):</strong>{" "}
                          <code className="break-all">
                            {syncInfo.primaryUrl || "N/A"}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductImagesList;
