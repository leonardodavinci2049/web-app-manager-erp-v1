"use client";

import { Loader2, Package, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { uploadProductImageAction } from "@/app/actions/action-product-images";
import { Badge } from "@/components/ui/badge";

interface ProductImageUploadProps {
  productId: string;
  productName: string;
  viewMode: "grid" | "list";
  compact?: boolean;
  isOutOfStock?: boolean;
  onUploadSuccess?: () => void | Promise<void>;
}

export function ProductImageUpload({
  productId,
  productName,
  viewMode,
  compact = false,
  isOutOfStock = false,
  onUploadSuccess,
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione apenas arquivos de imagem");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Limite: 10MB");
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("productId", productId);
        formData.append("description", `${productName} - Imagem principal`);
        formData.append("altText", `Imagem do produto ${productName}`);

        const result = await uploadProductImageAction(formData);

        if (result.success) {
          toast.success("Imagem enviada com sucesso!");
          await onUploadSuccess?.();
        } else {
          toast.error(result.error || "Erro ao enviar imagem");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Erro ao enviar imagem");
      } finally {
        setIsUploading(false);
      }
    },
    [productId, productName, onUploadSuccess],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleImageUpload(e.dataTransfer.files);
    },
    [handleImageUpload],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleImageUpload(e.target.files);
      e.target.value = "";
    },
    [handleImageUpload],
  );

  if (viewMode === "grid") {
    return (
      <button
        type="button"
        className={`
          relative aspect-[3/2] rounded-md overflow-hidden cursor-pointer transition-all duration-200
          border-2 border-dashed border-muted-foreground/30 hover:border-primary/50
          bg-muted/50 hover:bg-muted/80 w-full
          ${isDragOver ? "border-primary bg-primary/10" : ""}
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isUploading}
        onClick={() =>
          document.getElementById(`file-input-${productId}`)?.click()
        }
      >
        <input
          id={`file-input-${productId}`}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          disabled={isUploading}
          aria-label="Enviar imagem do produto"
        />

        {isOutOfStock && (
          <Badge
            variant="destructive"
            className="pointer-events-none absolute top-1 right-1 z-10 whitespace-nowrap px-1 py-0 text-[9px] sm:top-2 sm:right-2 sm:text-[10px]"
          >
            SEM ESTOQUE
          </Badge>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-muted-foreground text-xs font-medium">
                Enviando...
              </span>
            </>
          ) : isDragOver ? (
            <>
              <Package className="h-8 w-8 text-primary" />
              <span className="text-primary text-xs font-medium">
                Soltar aqui
              </span>
            </>
          ) : (
            <>
              <Upload className="group-hover:text-primary h-8 w-8 text-muted-foreground transition-colors" />
              <span className="text-muted-foreground text-xs font-medium">
                Adicionar Imagem
              </span>
              <span className="text-muted-foreground/70 text-xs">
                Clique ou arraste
              </span>
            </>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`
        relative flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-all duration-200
        border-2 border-dashed border-muted-foreground/30 hover:border-primary/50
        bg-muted/50 hover:bg-muted/80
        ${compact ? "h-14 w-14 sm:h-16 sm:w-16" : "h-16 w-16 sm:h-20 sm:w-20"}
        ${isDragOver ? "border-primary bg-primary/10" : ""}
        ${isUploading ? "pointer-events-none opacity-60" : ""}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      disabled={isUploading}
      onClick={() =>
        document.getElementById(`file-input-list-${productId}`)?.click()
      }
    >
      <input
        id={`file-input-list-${productId}`}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        disabled={isUploading}
        aria-label="Enviar imagem do produto"
      />

      {isOutOfStock && (
        <Badge
          variant="destructive"
          className={`pointer-events-none absolute z-10 whitespace-nowrap py-0 ${
            compact
              ? "top-0.5 right-0.5 px-0.5 text-[7px] sm:text-[8px]"
              : "top-1 right-1 px-1 text-[9px]"
          }`}
        >
          SEM ESTOQUE
        </Badge>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground text-xs font-medium">
              Enviando...
            </span>
          </>
        ) : isDragOver ? (
          <>
            <Package className="h-5 w-5 text-primary" />
            <span className="text-primary text-xs font-medium">
              Soltar aqui
            </span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
            <span className="text-muted-foreground text-center text-xs font-medium leading-tight">
              Adicionar Imagem
            </span>
          </>
        )}
      </div>
    </button>
  );
}
