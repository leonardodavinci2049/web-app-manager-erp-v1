"use client";

import { Crown, ImageOff, LoaderCircle, Plus } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { uploadPurchasingProductImageAction } from "../../_actions/purchasing-image-gallery-actions";
import {
  DEFAULT_PRODUCT_IMAGE_URL,
  PURCHASING_GALLERY_ACCEPT,
  PURCHASING_GALLERY_ACCEPTED_MIME_TYPES,
  PURCHASING_GALLERY_LIMIT,
  PURCHASING_GALLERY_MAX_FILE_SIZE,
} from "./image-gallery-constants";
import type { PurchasingGalleryImage } from "./image-gallery-types";

function isRemoteImage(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function PurchasingImageGallery({
  productId,
  productName,
  images,
  totalImages,
  loadError,
  onRefresh,
}: {
  productId: number;
  productName: string;
  images: PurchasingGalleryImage[];
  totalImages: number;
  loadError: string | null;
  onRefresh: () => void;
}) {
  const [selectedId, setSelectedId] = useState(
    images.find((image) => image.isPrimary)?.id ?? images[0]?.id,
  );
  const [uploading, setUploading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [liveMessage, setLiveMessage] = useState("");
  const selected = useMemo(
    () => images.find((image) => image.id === selectedId) ?? images[0],
    [images, selectedId],
  );
  const availableSlots = Math.max(0, PURCHASING_GALLERY_LIMIT - totalImages);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0 || uploading) return;

    const failures: string[] = [];
    const candidates = files.slice(0, availableSlots);
    for (const file of files.slice(availableSlots)) {
      failures.push(`${file.name}: limite da galeria atingido`);
    }

    setUploading(true);
    setLiveMessage(`Enviando ${candidates.length} imagem(ns).`);
    let uploadedCount = 0;
    let warningCount = 0;

    try {
      for (const file of candidates) {
        if (
          !PURCHASING_GALLERY_ACCEPTED_MIME_TYPES.includes(
            file.type as (typeof PURCHASING_GALLERY_ACCEPTED_MIME_TYPES)[number],
          )
        ) {
          failures.push(`${file.name}: formato não aceito`);
          continue;
        }
        if (file.size <= 0 || file.size > PURCHASING_GALLERY_MAX_FILE_SIZE) {
          failures.push(`${file.name}: imagem vazia ou acima de 2 MB`);
          continue;
        }

        const formData = new FormData();
        formData.set("productId", productId.toString());
        formData.set("file", file);
        const result = await uploadPurchasingProductImageAction(formData);
        if (!result.success) {
          failures.push(`${file.name}: ${result.error}`);
          continue;
        }
        uploadedCount += 1;
        toast.success(result.message);
        if (result.warning) {
          warningCount += 1;
          toast.warning(result.warning);
        }
      }

      if (failures.length > 0) {
        toast.error(
          `${failures.length} arquivo(s) não foram enviados. ${failures.join("; ")}`,
        );
      }
      setLiveMessage(
        `${uploadedCount} imagem(ns) enviada(s), ${failures.length} falha(s) e ${warningCount} aviso(s).`,
      );
      if (uploadedCount > 0) onRefresh();
    } catch {
      toast.error("Não foi possível concluir o envio das imagens.");
      setLiveMessage("O envio foi interrompido por um erro.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section
      className="w-full max-w-[500px] space-y-3"
      aria-label={`Galeria de imagens de ${productName}`}
    >
      {loadError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {loadError}
        </div>
      ) : null}

      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          {selected ? (
            <div className="relative aspect-square bg-muted">
              <Image
                src={
                  imageErrors.has(selected.id)
                    ? DEFAULT_PRODUCT_IMAGE_URL
                    : selected.urls.preview
                }
                alt={`${productName} — ${selected.originalName}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 500px"
                unoptimized={isRemoteImage(selected.urls.preview)}
                onError={() =>
                  setImageErrors((current) => new Set(current).add(selected.id))
                }
              />
              {selected.isPrimary ? (
                <Badge className="absolute left-3 top-3 gap-1 bg-amber-500 text-white">
                  <Crown className="size-3" aria-hidden="true" /> Principal
                </Badge>
              ) : null}
            </div>
          ) : (
            <div className="relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden bg-muted p-6 text-center text-muted-foreground">
              <Image
                src={DEFAULT_PRODUCT_IMAGE_URL}
                alt=""
                fill
                priority
                className="object-cover opacity-20"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              <ImageOff className="relative size-10" aria-hidden="true" />
              <p className="relative text-sm font-medium">Galeria vazia</p>
              <p className="relative text-xs">
                Adicione a primeira imagem do produto.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="relative aspect-square overflow-hidden rounded-lg border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Selecionar imagem ${index + 1} de ${images.length}`}
            aria-pressed={selected?.id === image.id}
            onClick={() => setSelectedId(image.id)}
          >
            <Image
              src={
                imageErrors.has(`${image.id}:thumb`)
                  ? DEFAULT_PRODUCT_IMAGE_URL
                  : image.urls.thumbnail
              }
              alt=""
              fill
              className="object-cover"
              sizes="125px"
              unoptimized={isRemoteImage(image.urls.thumbnail)}
              onError={() =>
                setImageErrors((current) =>
                  new Set(current).add(`${image.id}:thumb`),
                )
              }
            />
            <span
              className={`absolute inset-0 border-2 ${selected?.id === image.id ? "border-primary" : "border-transparent"}`}
            />
          </button>
        ))}
        {availableSlots > 0 ? (
          <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/40 text-center text-xs text-muted-foreground hover:bg-muted focus-within:ring-2 focus-within:ring-ring">
            {uploading ? (
              <LoaderCircle
                className="size-5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Plus className="size-5" aria-hidden="true" />
            )}
            <span>{uploading ? "Enviando" : "Adicionar"}</span>
            <input
              className="sr-only"
              type="file"
              accept={PURCHASING_GALLERY_ACCEPT}
              multiple
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        ) : null}
      </div>

      <p className="text-muted-foreground text-xs">
        {totalImages} de {PURCHASING_GALLERY_LIMIT} imagens. JPEG, PNG, GIF ou
        WebP, até 2 MB cada. Nesta página é permitido somente adicionar.
      </p>
      <p className="sr-only" aria-live="polite">
        {liveMessage}
      </p>
    </section>
  );
}
