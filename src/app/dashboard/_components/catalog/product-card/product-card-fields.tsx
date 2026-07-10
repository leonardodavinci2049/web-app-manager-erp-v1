import { Shield } from "lucide-react";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";

interface ProductCardFieldsProps {
  product: UIProductPdv;
  textSize?: "xs" | "sm";
  gap?: string;
  className?: string;
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
}: ProductCardFieldsProps) {
  const size = textSize === "sm" ? "text-sm" : "text-xs";

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
