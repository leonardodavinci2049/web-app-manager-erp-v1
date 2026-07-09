"use client";

import { Check, DollarSign, Edit2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductPrice } from "@/app/actions/action-product-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/common-utils";

interface InlinePriceEditorProps {
  productId: number;
  productName: string;
  retailPrice: number;
  wholesalePrice: number;
  corporatePrice: number;
  className?: string;
}

export function InlinePriceEditor({
  productId,
  productName,
  retailPrice,
  wholesalePrice,
  corporatePrice,
  className = "",
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
          <DollarSign className="h-4 w-4 shrink-0 text-muted-foreground" />
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
      <div className="space-y-0.5">
        <div className="group/price-editor flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground text-xs font-medium">
            Preços
          </span>
          <Edit2 className="group-hover/price-editor:opacity-100 h-3 w-3 text-muted-foreground opacity-0 transition-opacity" />
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <div>
            <div className="text-muted-foreground text-[10px] leading-tight">
              Vare
            </div>
            <div className="font-medium text-orange-600 dark:text-orange-400">
              {formatCurrency(displayRetail)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] leading-tight">
              Atac
            </div>
            <div className="font-medium text-green-600 dark:text-green-400">
              {formatCurrency(displayWholesale)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] leading-tight">
              Corp
            </div>
            <div className="font-medium text-blue-600 dark:text-blue-400">
              {formatCurrency(displayCorporate)}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
