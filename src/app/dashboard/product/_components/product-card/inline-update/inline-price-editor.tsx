"use client";

import {
  Building2,
  Check,
  Edit2,
  PackageCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductPrice } from "@/app/actions/action-product-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPriceValue } from "@/utils/common-utils";

interface InlinePriceEditorProps {
  productId: number;
  productName: string;
  retailPrice: number;
  wholesalePrice: number;
  corporatePrice: number;
  visiblePrice?: "all" | "wholesale" | "retail";
  className?: string;
  showCurrencySymbol?: boolean;
  showPriceIcons?: boolean;
  valueClassName?: string;
}

export function InlinePriceEditor({
  productId,
  productName,
  retailPrice,
  wholesalePrice,
  corporatePrice,
  visiblePrice = "all",
  className = "",
  showCurrencySymbol = true,
  showPriceIcons = true,
  valueClassName = "",
}: InlinePriceEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [displayRetail, setDisplayRetail] = useState(retailPrice);
  const [displayWholesale, setDisplayWholesale] = useState(wholesalePrice);
  const [displayCorporate, setDisplayCorporate] = useState(corporatePrice);

  const [tempRetailPrice, setTempRetailPrice] = useState(
    retailPrice.toString().replace(".", ","),
  );
  const [tempWholesalePrice, setTempWholesalePrice] = useState(
    wholesalePrice.toString().replace(".", ","),
  );
  const [tempCorporatePrice, setTempCorporatePrice] = useState(
    corporatePrice.toString().replace(".", ","),
  );
  const formatDisplayPrice = showCurrencySymbol
    ? formatCurrency
    : formatPriceValue;

  const MIN_PRICE = 0.01;
  const MAX_PRICE = 2000000;

  const brazilianToNumber = (value: string): number => {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    return Number.parseFloat(normalized);
  };

  const formatBrazilianInput = (value: string): string => {
    let cleaned = value.replace(/[^\d,]/g, "");

    const commaCount = (cleaned.match(/,/g) || []).length;
    if (commaCount > 1) {
      const firstCommaIndex = cleaned.indexOf(",");
      cleaned =
        cleaned.substring(0, firstCommaIndex + 1) +
        cleaned.substring(firstCommaIndex + 1).replace(/,/g, "");
    }

    if (cleaned.includes(",")) {
      const [integer, decimal] = cleaned.split(",");
      cleaned = decimal
        ? `${integer},${decimal.substring(0, 4)}`
        : `${integer},`;
    }

    return cleaned;
  };

  const handleEdit = () => {
    setTempRetailPrice(displayRetail.toString().replace(".", ","));
    setTempWholesalePrice(displayWholesale.toString().replace(".", ","));
    setTempCorporatePrice(displayCorporate.toString().replace(".", ","));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempRetailPrice(displayRetail.toString().replace(".", ","));
    setTempWholesalePrice(displayWholesale.toString().replace(".", ","));
    setTempCorporatePrice(displayCorporate.toString().replace(".", ","));
    setIsEditing(false);
  };

  const validatePrices = (): { valid: boolean; error?: string } => {
    const retail = brazilianToNumber(tempRetailPrice);
    const wholesale = brazilianToNumber(tempWholesalePrice);
    const corporate = brazilianToNumber(tempCorporatePrice);

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

    if (retail < MIN_PRICE || wholesale < MIN_PRICE || corporate < MIN_PRICE) {
      return {
        valid: false,
        error: `Todos os preços devem ser maiores ou iguais a ${formatCurrency(MIN_PRICE)}`,
      };
    }

    if (retail > MAX_PRICE || wholesale > MAX_PRICE || corporate > MAX_PRICE) {
      return {
        valid: false,
        error: `Todos os preços devem ser menores que ${formatCurrency(MAX_PRICE)}`,
      };
    }

    return { valid: true };
  };

  const handleSave = async () => {
    const validation = validatePrices();
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const retail = brazilianToNumber(tempRetailPrice);
    const wholesale = brazilianToNumber(tempWholesalePrice);
    const corporate = brazilianToNumber(tempCorporatePrice);

    if (
      retail === displayRetail &&
      wholesale === displayWholesale &&
      corporate === displayCorporate
    ) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      const result = await updateProductPrice(
        productId,
        wholesale,
        corporate,
        retail,
      );

      if (result.success) {
        toast.success(`Preços de "${productName}" atualizados com sucesso!`);
        setIsEditing(false);
        setDisplayRetail(retail);
        setDisplayWholesale(wholesale);
        setDisplayCorporate(corporate);
        router.refresh();
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
          <span className="text-muted-foreground text-sm font-medium">
            Editando Preços
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
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

        <p className="text-muted-foreground text-xs">
          ℹ️ Use vírgula para decimais (ex: 10,50). Pressione{" "}
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
      className={`group/price-editor relative text-left ${className}`}
      onClick={handleEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleEdit();
        }
      }}
      title="Clique para editar os preços"
    >
      <div>
        <Edit2 className="absolute top-0 right-0 h-3 w-3 text-muted-foreground transition-opacity md:opacity-0 md:group-hover/price-editor:opacity-100 md:group-focus-visible/price-editor:opacity-100" />

        <div
          className={`grid gap-2 text-sm ${visiblePrice === "all" ? "grid-cols-2" : "grid-cols-1"}`}
        >
          <div
            className={`${visiblePrice === "retail" ? "hidden" : "flex"} items-center gap-1`}
          >
            {showPriceIcons && (
              <PackageCheck className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
            )}
            <div
              className={`font-semibold text-green-600 dark:text-green-400 ${valueClassName}`}
              title="Preço de atacado"
            >
              {formatDisplayPrice(displayWholesale)}
            </div>
          </div>

          <div className="hidden items-center gap-1">
            {showPriceIcons && (
              <Building2 className="h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
            )}
            <div
              className={`font-semibold text-purple-600 dark:text-purple-400 ${valueClassName}`}
              title="Preço corporativo"
            >
              {formatDisplayPrice(displayCorporate)}
            </div>
          </div>

          <div
            className={`${visiblePrice === "wholesale" ? "hidden" : "flex"} items-center gap-1`}
          >
            {showPriceIcons && (
              <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
            )}
            <div
              className={`font-semibold text-blue-600 dark:text-blue-400 ${valueClassName}`}
              title="Preço de varejo"
            >
              {formatDisplayPrice(displayRetail)}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
