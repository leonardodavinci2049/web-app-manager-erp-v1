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
  gap = "gap-3",
  className,
}: ProductCardFieldsProps) {
  const size = textSize === "sm" ? "text-sm" : "text-xs";

  return (
    <div
      className={`flex flex-wrap items-center ${gap} ${size} ${className ?? ""}`}
    >
      <p className="text-muted-foreground">SKU: {product.sku}</p>
      {product.brand && (
        <p className="text-muted-foreground">Marca: {product.brand}</p>
      )}
      {product.type && (
        <p className="text-muted-foreground">Tipo: {product.type}</p>
      )}
    </div>
  );
}
