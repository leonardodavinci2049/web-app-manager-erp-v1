"use client";

import { Check, Edit2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductStock } from "@/app/actions/action-product-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InlineStockEditorProps {
  productId: number;
  productName: string;
  currentStock: number;
  className?: string;
}

export function InlineStockEditor({
  productId,
  productName,
  currentStock,
  className = "",
}: InlineStockEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempStock, setTempStock] = useState(currentStock.toString());
  const [displayStock, setDisplayStock] = useState(currentStock);

  const MIN_STOCK = 0;
  const MAX_STOCK = 1000000;

  const handleEdit = () => {
    setTempStock(displayStock.toString());
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempStock(displayStock.toString());
    setIsEditing(false);
  };

  const validateStock = (): { valid: boolean; error?: string } => {
    const stock = Number.parseInt(tempStock, 10);

    if (
      Number.isNaN(stock) ||
      !Number.isInteger(Number.parseFloat(tempStock))
    ) {
      return {
        valid: false,
        error: "Estoque deve ser um número inteiro válido",
      };
    }

    if (stock < MIN_STOCK) {
      return { valid: false, error: "Estoque não pode ser negativo" };
    }

    if (stock > MAX_STOCK) {
      return {
        valid: false,
        error: `Estoque não pode ser maior que ${MAX_STOCK.toLocaleString("pt-BR")} unidades`,
      };
    }

    return { valid: true };
  };

  const handleSave = async () => {
    const validation = validateStock();
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const stock = Number.parseInt(tempStock, 10);

    if (stock === displayStock) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      const result = await updateProductStock(productId, stock, 0);

      if (result.success) {
        toast.success(`Estoque de "${productName}" atualizado com sucesso!`);
        setIsEditing(false);
        setDisplayStock(stock);
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao atualizar estoque");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Erro ao atualizar estoque");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSaving) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="1"
              min={MIN_STOCK}
              max={MAX_STOCK}
              value={tempStock}
              onChange={(e) => setTempStock(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className="h-8 w-24 text-sm font-mono"
              placeholder="0"
              autoFocus
            />
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              unidades
            </span>
          </div>
        </div>

        <p className="text-muted-foreground text-xs">
          Pressione{" "}
          <kbd className="rounded bg-muted px-1 py-0.5 text-xs">Enter</kbd> para
          salvar ou{" "}
          <kbd className="rounded bg-muted px-1 py-0.5 text-xs">Esc</kbd> para
          cancelar
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`group/stock-editor flex cursor-pointer items-center gap-2 text-left ${className}`}
      onClick={handleEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleEdit();
        }
      }}
      title="Clique para editar o estoque"
    >
      <span
        className={`font-medium ${
          displayStock === 0
            ? "text-red-600 dark:text-red-400"
            : "text-muted-foreground"
        }`}
      >
        Estoque: {displayStock}
      </span>
      <Edit2 className="group-hover/stock-editor:opacity-100 h-3 w-3 text-muted-foreground opacity-0 transition-opacity" />
    </button>
  );
}
