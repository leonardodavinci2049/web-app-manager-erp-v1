"use client";

import { Check, DollarSign, Edit2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductPrice } from "@/app/actions/action-product-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InlinePriceEditorProps {
  productId: number;
  productName: string;
  retailPrice: number;
  wholesalePrice: number;
  corporatePrice: number;
  onPricesUpdated?: (
    retailPrice: number,
    wholesalePrice: number,
    corporatePrice: number,
  ) => void;
  className?: string;
}

export function InlinePriceEditor({
  productId,
  productName,
  retailPrice,
  wholesalePrice,
  corporatePrice,
  onPricesUpdated,
  className = "",
}: InlinePriceEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for each price field (stored as Brazilian format string with comma)
  const [tempRetailPrice, setTempRetailPrice] = useState(
    retailPrice.toString().replace(".", ","),
  );
  const [tempWholesalePrice, setTempWholesalePrice] = useState(
    wholesalePrice.toString().replace(".", ","),
  );
  const [tempCorporatePrice, setTempCorporatePrice] = useState(
    corporatePrice.toString().replace(".", ","),
  );

  // Validation constants
  const MIN_PRICE = 0.01;
  const MAX_PRICE = 2000000; // 2 milhões

  /**
   * Convert Brazilian format (comma) to API format (dot)
   * Example: "1.234,5678" -> 1234.5678
   */
  const brazilianToNumber = (value: string): number => {
    // Remove dots (thousand separators) and replace comma with dot
    const normalized = value.replace(/\./g, "").replace(",", ".");
    return Number.parseFloat(normalized);
  };

  /**
   * Format input value to Brazilian monetary format
   * Allows comma as decimal separator and up to 4 decimal places
   */
  const formatBrazilianInput = (value: string): string => {
    // Remove any character that is not a digit or comma
    let cleaned = value.replace(/[^\d,]/g, "");

    // Only allow one comma
    const commaCount = (cleaned.match(/,/g) || []).length;
    if (commaCount > 1) {
      const firstCommaIndex = cleaned.indexOf(",");
      cleaned =
        cleaned.substring(0, firstCommaIndex + 1) +
        cleaned.substring(firstCommaIndex + 1).replace(/,/g, "");
    }

    // Limit to 4 decimal places after comma
    if (cleaned.includes(",")) {
      const [integer, decimal] = cleaned.split(",");
      cleaned = decimal
        ? `${integer},${decimal.substring(0, 4)}`
        : `${integer},`;
    }

    return cleaned;
  };

  /**
   * Format currency for display
   */
  const formatCurrency = (value: number): string => {
    if (Number.isNaN(value)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleEdit = () => {
    setTempRetailPrice(retailPrice.toString().replace(".", ","));
    setTempWholesalePrice(wholesalePrice.toString().replace(".", ","));
    setTempCorporatePrice(corporatePrice.toString().replace(".", ","));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempRetailPrice(retailPrice.toString().replace(".", ","));
    setTempWholesalePrice(wholesalePrice.toString().replace(".", ","));
    setTempCorporatePrice(corporatePrice.toString().replace(".", ","));
    setIsEditing(false);
  };

  const validatePrices = (): { valid: boolean; error?: string } => {
    const retail = brazilianToNumber(tempRetailPrice);
    const wholesale = brazilianToNumber(tempWholesalePrice);
    const corporate = brazilianToNumber(tempCorporatePrice);

    // Check if all values are valid numbers
    if (
      Number.isNaN(retail) ||
      Number.isNaN(wholesale) ||
      Number.isNaN(corporate)
    ) {
      return {
        valid: false,
        error: "Todos os preços devem ser números válidos",
      };
    }

    // Check minimum value
    if (retail < MIN_PRICE || wholesale < MIN_PRICE || corporate < MIN_PRICE) {
      return {
        valid: false,
        error: `Todos os preços devem ser maiores ou iguais a ${formatCurrency(MIN_PRICE)}`,
      };
    }

    // Check maximum value
    if (retail > MAX_PRICE || wholesale > MAX_PRICE || corporate > MAX_PRICE) {
      return {
        valid: false,
        error: `Todos os preços devem ser menores que ${formatCurrency(MAX_PRICE)}`,
      };
    }

    return { valid: true };
  };

  const handleSave = async () => {
    // Validate prices
    const validation = validatePrices();
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Convert Brazilian format to API format (number with dot)
    const retail = brazilianToNumber(tempRetailPrice);
    const wholesale = brazilianToNumber(tempWholesalePrice);
    const corporate = brazilianToNumber(tempCorporatePrice);

    // Check if any price changed
    if (
      retail === retailPrice &&
      wholesale === wholesalePrice &&
      corporate === corporatePrice
    ) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      // Call Server Action with all three prices
      const result = await updateProductPrice(
        productId,
        wholesale,
        corporate,
        retail,
      );

      if (result.success) {
        toast.success(`Preços de "${productName}" atualizados com sucesso!`);
        setIsEditing(false);

        // Notify parent component about the update
        onPricesUpdated?.(retail, wholesale, corporate);
      } else {
        toast.error(result.error || "Erro ao atualizar preços");
      }
    } catch (error) {
      console.error("Error updating prices:", error);
      toast.error("Erro ao atualizar preços");
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
        {/* Header */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Editando Preços
          </span>
        </div>

        {/* Price Inputs */}
        <div className="grid grid-cols-1 gap-3">
          {/* Retail Price */}
          <div className="space-y-1">
            <Label htmlFor="retail-price" className="text-xs font-medium">
              Varejo
            </Label>
            <Input
              id="retail-price"
              type="text"
              value={tempRetailPrice}
              onChange={(e) =>
                setTempRetailPrice(formatBrazilianInput(e.target.value))
              }
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className="h-8 text-sm font-mono"
              placeholder="0,00"
            />
          </div>

          {/* Wholesale Price */}
          <div className="space-y-1">
            <Label htmlFor="wholesale-price" className="text-xs font-medium">
              Atacado
            </Label>
            <Input
              id="wholesale-price"
              type="text"
              value={tempWholesalePrice}
              onChange={(e) =>
                setTempWholesalePrice(formatBrazilianInput(e.target.value))
              }
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className="h-8 text-sm font-mono"
              placeholder="0,00"
            />
          </div>

          {/* Corporate Price */}
          <div className="space-y-1">
            <Label htmlFor="corporate-price" className="text-xs font-medium">
              Corporativo
            </Label>
            <Input
              id="corporate-price"
              type="text"
              value={tempCorporatePrice}
              onChange={(e) =>
                setTempCorporatePrice(formatBrazilianInput(e.target.value))
              }
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className="h-8 text-sm font-mono"
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Hint Message */}
        <p className="text-xs text-muted-foreground">
          ℹ️ Use vírgula para decimais (ex: 10,50). Pressione{" "}
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
      className={`text-left ${className}`}
      onClick={handleEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleEdit();
        }
      }}
      title="Clique para editar os preços"
    >
      <div className="space-y-2">
        {/* Header with icon */}
        <div className="flex items-center gap-2 group/price-editor">
          <DollarSign className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Preços
          </span>
          <Edit2 className="h-3 w-3 opacity-0 group-hover/price-editor:opacity-100 transition-opacity text-muted-foreground" />
        </div>

        {/* Price Display - Table Layout */}
        <div className="space-y-1 text-xs">
          <div className="grid grid-cols-3 gap-2">
            {/* Varejo */}
            <div>
              <div className="text-muted-foreground text-xs">Vare</div>
              <div className="font-medium text-orange-600 dark:text-orange-400">
                {formatCurrency(retailPrice)}
              </div>
            </div>
            {/* Atacado */}
            <div>
              <div className="text-muted-foreground text-xs">Atac</div>
              <div className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(wholesalePrice)}
              </div>
            </div>
            {/* Corporativo */}
            <div>
              <div className="text-muted-foreground text-xs">Corp</div>
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {formatCurrency(corporatePrice)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
