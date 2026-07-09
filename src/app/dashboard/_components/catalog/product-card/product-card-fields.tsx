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
  gap = "gap-x-2 gap-y-0.5",
  className,
}: ProductCardFieldsProps) {
  const size = textSize === "sm" ? "text-sm" : "text-xs";

  return (
    <div
      className={`flex flex-wrap items-center ${gap} ${size} ${className ?? ""}`}
    >
      <p className="text-muted-foreground">
        SKU: <span className="font-medium text-foreground">{product.sku}</span>
      </p>
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
