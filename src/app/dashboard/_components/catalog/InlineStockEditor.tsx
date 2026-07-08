"use client";

import { Check, Edit2, Package, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductStock } from "@/app/actions/action-product-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InlineStockEditorProps {
  productId: number;
  productName: string;
  currentStock: number;
  onStockUpdated?: (newStock: number) => void;
  className?: string;
}

export function InlineStockEditor({
  productId,
  productName,
  currentStock,
  onStockUpdated,
  className = "",
}: InlineStockEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempStock, setTempStock] = useState(currentStock.toString());

  // Validation constants
  const MIN_STOCK = 0;
  const MAX_STOCK = 1000000;

  const handleEdit = () => {
    setTempStock(currentStock.toString());
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempStock(currentStock.toString());
    setIsEditing(false);
  };

  const validateStock = (): { valid: boolean; error?: string } => {
    const stock = Number.parseInt(tempStock, 10);

    // Check if value is a valid integer
    if (
      Number.isNaN(stock) ||
      !Number.isInteger(Number.parseFloat(tempStock))
    ) {
      return {
        valid: false,
        error: "Estoque deve ser um número inteiro válido",
      };
    }

    // Check if value is negative
    if (stock < MIN_STOCK) {
      return {
        valid: false,
        error: "Estoque não pode ser negativo",
      };
    }

    // Check maximum value
    if (stock > MAX_STOCK) {
      return {
        valid: false,
        error: `Estoque não pode ser maior que ${MAX_STOCK.toLocaleString("pt-BR")} unidades`,
      };
    }

    return { valid: true };
  };

  const handleSave = async () => {
    // Validate stock
    const validation = validateStock();
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const stock = Number.parseInt(tempStock, 10);

    // Check if value changed
    if (stock === currentStock) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      // Call Server Action - minStock default is 0
      const result = await updateProductStock(productId, stock, 0);

      if (result.success) {
        toast.success(`Estoque de "${productName}" atualizado com sucesso!`);
        setIsEditing(false);

        // Notify parent component about the update
        onStockUpdated?.(stock);
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
    // Save with Enter
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
        {/* Input Section */}
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
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
              className="w-24 h-8 text-sm font-mono"
              placeholder="0"
              autoFocus
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              unidades
            </span>
          </div>
        </div>

        {/* Hint Message */}
        <p className="text-xs text-muted-foreground">
          Pressione{" "}
          <kbd className="px-1 py-0.5 rounded bg-muted text-xs">Enter</kbd> para
          salvar ou{" "}
          <kbd className="px-1 py-0.5 rounded bg-muted text-xs">Esc</kbd> para
          cancelar
        </p>

        {/* Action Buttons */}
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
      className={`flex items-center gap-2 group/stock-editor cursor-pointer text-left ${className}`}
      onClick={handleEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleEdit();
        }
      }}
      title="Clique para editar o estoque"
    >
      <Package className="h-4 w-4 shrink-0" />
      <span
        className={`font-medium ${
          currentStock === 0
            ? "text-red-600 dark:text-red-400"
            : "text-muted-foreground"
        }`}
      >
        Estoque: {currentStock}
      </span>
      <Edit2 className="h-3 w-3 opacity-0 group-hover/stock-editor:opacity-100 transition-opacity text-muted-foreground" />
    </button>
  );
}
