"use client";

import { PackageSearch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BrandPagination } from "../../_components/brand-list/brand-pagination";
import { buildProductDetailsHref } from "../../_components/lib/search-params";
import type { BrandProductDto } from "../../_components/types/brand-dashboard-types";

interface BrandProductsListProps {
  brandId: number;
  products: BrandProductDto[];
  productTotal: number;
  productPage: number;
  pageSize: number;
  brandReturnTo: string;
}

function ProductThumb({
  name,
  imagePath,
}: {
  name: string;
  imagePath?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const hasRealImage =
    imagePath &&
    imagePath.trim() !== "" &&
    imagePath !== "/images/product/no-image.jpeg";

  if (!hasRealImage || hasError) {
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
    return (
      <div
        className="bg-muted text-muted-foreground relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded text-xs font-semibold"
        aria-hidden="true"
      >
        {initials || "—"}
      </div>
    );
  }

  return (
    <div className="relative size-10 shrink-0 overflow-hidden rounded">
      <Image
        src={imagePath ?? ""}
        alt={`Imagem do produto ${name}`}
        fill
        className="object-cover"
        sizes="40px"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

/**
 * Lista de produtos relacionados a marca (Client). Somente leitura: cada item
 * abre o detalhe do produto preservando uma URL de retorno para a central de
 * marcas. Paginacao tradicional via `productPage`.
 */
export function BrandProductsList({
  brandId,
  products,
  productTotal,
  productPage,
  pageSize,
  brandReturnTo,
}: BrandProductsListProps) {
  if (productTotal === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
        <PackageSearch className="text-muted-foreground h-8 w-8" />
        <p className="text-sm font-medium">Nenhum produto vinculado</p>
        <p className="text-muted-foreground text-xs">
          Esta marca ainda não possui produtos relacionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Produtos relacionados</h4>
        <span className="text-muted-foreground text-xs tabular-nums">
          {productTotal} {productTotal === 1 ? "produto" : "produtos"}
        </span>
      </div>

      <ul className="space-y-1.5">
        {products.map((product) => (
          <li key={`${brandId}-${product.id}`}>
            <Link
              href={buildProductDetailsHref(product.id, brandReturnTo)}
              className="hover:bg-accent flex items-center gap-3 rounded-md border p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ProductThumb name={product.name} imagePath={product.imagePath} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {product.name}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  SKU: {product.sku}
                  {product.ref ? ` · Ref: ${product.ref}` : ""}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <BrandPagination
        currentPage={productPage}
        total={productTotal}
        pageSize={pageSize}
        paramName="productPage"
      />
    </div>
  );
}
