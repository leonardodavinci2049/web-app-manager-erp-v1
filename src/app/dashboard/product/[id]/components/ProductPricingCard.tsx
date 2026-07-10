"use client";

import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductPrice } from "@/app/actions/action-product-updates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductPricingCardProps {
  productId: number;
  retailPrice: string | null;
  wholesalePrice: string | null;
  corporatePrice: string | null;
  retailPriceRaw: number;
  wholesalePriceRaw: number;
  corporatePriceRaw: number;
}

export function ProductPricingCard({
  productId,
  retailPrice,
  wholesalePrice,
  corporatePrice,
  retailPriceRaw,
  wholesalePriceRaw,
  corporatePriceRaw,
}: ProductPricingCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for each price field (stored as Brazilian format string with comma)
  const [tempRetailPrice, setTempRetailPrice] = useState(
    retailPriceRaw.toString().replace(".", ","),
  );
  const [tempWholesalePrice, setTempWholesalePrice] = useState(
    wholesalePriceRaw.toString().replace(".", ","),
  );
  const [tempCorporatePrice, setTempCorporatePrice] = useState(
    corporatePriceRaw.toString().replace(".", ","),
  );

  // Validation constants
  const MIN_PRICE = 0.1;

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

  // Don't render if no prices are available
  if (!retailPrice && !wholesalePrice && !corporatePrice) {
    return null;
  }

  const handleEdit = () => {
    setTempRetailPrice(retailPriceRaw.toString().replace(".", ","));
    setTempWholesalePrice(wholesalePriceRaw.toString().replace(".", ","));
    setTempCorporatePrice(corporatePriceRaw.toString().replace(".", ","));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempRetailPrice(retailPriceRaw.toString().replace(".", ","));
    setTempWholesalePrice(wholesalePriceRaw.toString().replace(".", ","));
    setTempCorporatePrice(corporatePriceRaw.toString().replace(".", ","));
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
        error: `Todos os preços devem ser maiores ou iguais a R$ ${MIN_PRICE.toFixed(2).replace(".", ",")}`,
      };
    }

    // Check if all values are greater than zero
    if (retail <= 0 || wholesale <= 0 || corporate <= 0) {
      return {
        valid: false,
        error: "Todos os preços devem ser maiores que zero",
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
      retail === retailPriceRaw &&
      wholesale === wholesalePriceRaw &&
      corporate === corporatePriceRaw
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
        toast.success("Preços atualizados com sucesso!");
        setIsEditing(false);
        // Reload page to reflect changes
        window.location.reload();
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

  const formatCurrency = (value: string): string => {
    const num = Number.parseFloat(value);
    if (Number.isNaN(num)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Preços de Venda</CardTitle>
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
            {/* Wholesale Price */}
            <div className="space-y-2">
              <Label
                htmlFor="wholesale-price"
                className="text-sm font-medium text-green-600 dark:text-green-400"
              >
                Preço Atacado
              </Label>
              <Input
                id="wholesale-price"
                type="text"
                value={tempWholesalePrice}
                onChange={(e) =>
                  setTempWholesalePrice(formatBrazilianInput(e.target.value))
                }
                disabled={isSaving}
                className="font-mono"
                placeholder="0,00"
              />
              <p className="text-xs text-green-600 dark:text-green-400">
                Valor formatado: {formatCurrency(tempWholesalePrice)}
              </p>
            </div>

            {/* Corporate Price */}
            <div className="space-y-2">
              <Label
                htmlFor="corporate-price"
                className="text-sm font-medium text-purple-600 dark:text-purple-400"
              >
                Preço Corporativo
              </Label>
              <Input
                id="corporate-price"
                type="text"
                value={tempCorporatePrice}
                onChange={(e) =>
                  setTempCorporatePrice(formatBrazilianInput(e.target.value))
                }
                disabled={isSaving}
                className="font-mono"
                placeholder="0,00"
              />
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Valor formatado: {formatCurrency(tempCorporatePrice)}
              </p>
            </div>

            {/* Retail Price */}
            <div className="space-y-2">
              <Label
                htmlFor="retail-price"
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                Preço Varejo
              </Label>
              <Input
                id="retail-price"
                type="text"
                value={tempRetailPrice}
                onChange={(e) =>
                  setTempRetailPrice(formatBrazilianInput(e.target.value))
                }
                disabled={isSaving}
                className="font-mono"
                placeholder="0,00"
              />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Valor formatado: {formatCurrency(tempRetailPrice)}
              </p>
            </div>

            {/* Validation message */}
            <p className="text-xs text-muted-foreground border-t pt-3">
              ⚠️ Todos os três preços devem ser maiores que R${" "}
              {MIN_PRICE.toFixed(2).replace(".", ",")} | Use vírgula para
              separar decimais (ex: 10,50 ou 99,9999)
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
              {wholesalePrice && (
                <>
                  <span className="text-muted-foreground font-medium">
                    Preço Atacado:
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {wholesalePrice}
                  </span>
                </>
              )}
              {corporatePrice && (
                <>
                  <span className="text-muted-foreground font-medium">
                    Preço Corporativo:
                  </span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {corporatePrice}
                  </span>
                </>
              )}
              {retailPrice && (
                <>
                  <span className="text-muted-foreground font-medium">
                    Preço Varejo:
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {retailPrice}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
