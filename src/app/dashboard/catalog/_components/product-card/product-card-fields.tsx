import { Shield } from "lucide-react";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";

interface ProductCardFieldsProps {
  product: UIProductManager;
  textSize?: "xs" | "sm";
  gap?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Bloco apresentacional (Server) com os metadados do produto
 * (SKU, marca e tipo). Reutilizado entre os layouts grid e list.
 */
export function ProductCardFields({
  product,
  textSize = "xs",
  gap = "gap-y-0.5",
  className,
  compact = false,
}: ProductCardFieldsProps) {
  const size = textSize === "sm" ? "text-sm" : "text-xs";

  if (compact) {
    return (
      <div className={`grid gap-y-0.5 ${size} ${className ?? ""}`}>
        <div className="grid grid-cols-2 items-center gap-x-3">
          <p className="min-w-0 truncate text-muted-foreground">
            SKU:{" "}
            <span className="font-medium text-foreground">{product.sku}</span>
          </p>
          <div className="flex min-w-0 items-center justify-between gap-2">
            <p className="min-w-0 truncate text-muted-foreground">
              Marca:{" "}
              <span className="text-foreground">{product.brand || "—"}</span>
            </p>
            {product.warrantyDays > 0 && (
              <div className="flex shrink-0 items-center gap-0.5 text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>{product.warrantyDays}d</span>
              </div>
            )}
          </div>
        </div>
        <p className="min-w-0 truncate text-muted-foreground">
          Tipo: <span className="text-foreground">{product.type || "—"}</span>
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${gap} ${size} ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground">
          SKU:{" "}
          <span className="font-medium text-foreground">{product.sku}</span>
        </p>
        {product.warrantyDays > 0 && (
          <div className="text-muted-foreground flex items-center gap-0.5">
            <Shield className="h-3 w-3" />
            <span>{product.warrantyDays}d</span>
          </div>
        )}
      </div>
      {product.brand && (
        <p className="text-muted-foreground">
          Marca: <span className="text-foreground">{product.brand}</span>
        </p>
      )}
      {product.type && (
        <p className="text-muted-foreground">
          Tipo: <span className="text-foreground">{product.type}</span>
        </p>
      )}
    </div>
  );
}
