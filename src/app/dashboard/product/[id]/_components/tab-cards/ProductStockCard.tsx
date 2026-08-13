"use client";

import { Check, Edit2, Package, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductStock } from "@/app/actions/action-product-updates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductStockCardProps {
  productId: number;
  stockLevel: number;
  isOutOfStock: boolean;
  isLowStock: boolean;
  stockStatus: {
    label: string;
    variant: "default" | "destructive" | "secondary";
  };
}

export function ProductStockCard({
  productId,
  stockLevel,
  isOutOfStock,
  isLowStock,
  stockStatus,
}: ProductStockCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempStock, setTempStock] = useState(stockLevel.toString());

  // Validation constants
  const MIN_STOCK = 0;
  const MAX_STOCK = 1000000;

  const handleEdit = () => {
    setTempStock(stockLevel.toString());
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempStock(stockLevel.toString());
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
    if (stock === stockLevel) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      // Call Server Action - minStock default is 0
      const result = await updateProductStock(productId, stock, 0);

      if (result.success) {
        toast.success("Estoque atualizado com sucesso!");
        setIsEditing(false);
        // Reload page to reflect changes
        window.location.reload();
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

  // Calculate dynamic status based on current temp value during editing
  const getDynamicStatus = () => {
    if (isEditing) {
      const stock = Number.parseInt(tempStock, 10);
      if (Number.isNaN(stock)) return stockStatus;

      const tempIsOutOfStock = stock === 0;
      const tempIsLowStock = stock > 0 && stock <= 5;

      if (tempIsOutOfStock) {
        return {
          label: "Sem Estoque",
          variant: "destructive" as const,
        };
      }
      if (tempIsLowStock) {
        return {
          label: "Estoque Baixo",
          variant: "secondary" as const,
        };
      }
      return {
        label: "Em Estoque",
        variant: "default" as const,
      };
    }
    return stockStatus;
  };

  const dynamicStatus = getDynamicStatus();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Estoque
        </CardTitle>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 gap-2"
          >
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {/* Stock Input */}
            <div className="space-y-2">
              <Label htmlFor="stock-level" className="text-sm font-medium">
                Quantidade Disponível
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="stock-level"
                  type="number"
                  step="1"
                  min={MIN_STOCK}
                  max={MAX_STOCK}
                  value={tempStock}
                  onChange={(e) => setTempStock(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  className="font-mono"
                  placeholder="0"
                  autoFocus
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  unidades
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tipo: Unidade • Aceita de {MIN_STOCK} até{" "}
                {MAX_STOCK.toLocaleString("pt-BR")} unidades
              </p>
            </div>

            {/* Preview Status */}
            <div className="space-y-2 border-t pt-3">
              <Label className="text-sm font-medium">Preview do Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant={dynamicStatus.variant}>
                  {dynamicStatus.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {Number.parseInt(tempStock, 10) || 0}{" "}
                  {Number.parseInt(tempStock, 10) === 1
                    ? "unidade"
                    : "unidades"}
                </span>
              </div>
            </div>

            {/* Validation message */}
            <p className="text-xs text-muted-foreground border-t pt-3">
              ℹ️ Pressione{" "}
              <kbd className="px-1 py-0.5 rounded bg-muted">Enter</kbd> para
              salvar ou <kbd className="px-1 py-0.5 rounded bg-muted">Esc</kbd>{" "}
              para cancelar
            </p>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
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
        ) : (
          <div className="space-y-2">
            {/* Table-like layout aligned to left */}
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <span className="text-muted-foreground font-medium">
                Disponível:
              </span>
              <span
                className={`text-lg font-bold ${
                  isOutOfStock
                    ? "text-destructive"
                    : isLowStock
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              >
                {stockLevel} {stockLevel === 1 ? "unidade" : "unidades"}
              </span>

              <span className="text-muted-foreground font-medium">Status:</span>
              <span className="text-sm">
                <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
              </span>
            </div>

            {/* Additional stock info */}
            {isOutOfStock && (
              <div className="mt-2 p-2 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive">
                  Produto sem estoque disponível
                </p>
              </div>
            )}

            {isLowStock && !isOutOfStock && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-600">
                  Estoque baixo - apenas {stockLevel} unidades restantes
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
