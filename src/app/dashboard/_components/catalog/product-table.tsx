import { Eye, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import type { ProductCategory } from "@/types/types";
import { formatCurrency } from "@/utils/common-utils";
import { CategoryTags } from "./category-tags";
import { buildProductDetailsHref } from "./lib/search-params";
import { InlineCategoryEditor } from "./product-card/inline-update/inline-category-editor";
import { InlineNameEditor } from "./product-card/inline-update/inline-name-editor";
import { InlinePriceEditor } from "./product-card/inline-update/inline-price-editor";
import { InlineStockEditor } from "./product-card/inline-update/inline-stock-editor";
import { ProductImageSection } from "./product-card/product-image-section";

interface ProductTableProps {
  products: UIProductManager[];
  catalogReturnTo: string;
}

function parseCategories(raw?: string): ProductCategory[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProductCategory[]) : [];
  } catch {
    return [];
  }
}

/**
 * Tabela de produtos para o modo lista em telas desktop (Server Component).
 * Mantem os mesmos dados e editores inline usados pelos cards do catalogo.
 */
export function ProductTable({ products, catalogReturnTo }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[40%] min-w-72">Produto</TableHead>
            <TableHead className="min-w-36">Marca e tipo</TableHead>
            <TableHead className="min-w-36">Estoque</TableHead>
            <TableHead className="min-w-28">Atacado</TableHead>
            <TableHead className="min-w-28">Varejo</TableHead>
            <TableHead className="min-w-52">Categorias</TableHead>
            <TableHead className="w-16 text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const retailPrice = Number(product.retailPrice) || 0;
            const wholesalePrice = Number(product.wholesalePrice) || 0;
            const corporatePrice = Number(product.corporatePrice) || 0;
            const discountPrice = Number(product.discount) || 0;
            const hasPromotion =
              product.promotion &&
              discountPrice > 0 &&
              discountPrice < retailPrice;
            const productDetailsHref = buildProductDetailsHref(
              product.id,
              catalogReturnTo,
            );

            return (
              <TableRow key={product.id}>
                <TableCell className="whitespace-normal">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0">
                      <ProductImageSection
                        product={product}
                        viewMode="list"
                        productDetailsHref={productDetailsHref}
                        hasPromotion={hasPromotion}
                        eager={index === 0}
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <InlineNameEditor
                        productId={product.id}
                        productName={product.name}
                        productDetailsHref={productDetailsHref}
                      />
                      <p className="text-muted-foreground text-xs">
                        SKU:{" "}
                        <span className="text-foreground">{product.sku}</span>
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="space-y-1 text-xs">
                    <p>{product.brand || "—"}</p>
                    <p className="text-muted-foreground">
                      {product.type || "—"}
                    </p>
                    {product.warrantyDays > 0 && (
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Shield className="size-3" />
                        {product.warrantyDays} dias
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <InlineStockEditor
                    productId={product.id}
                    productName={product.name}
                    currentStock={product.storeStock}
                    className="text-xs font-medium"
                  />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <InlinePriceEditor
                    productId={product.id}
                    productName={product.name}
                    retailPrice={retailPrice}
                    wholesalePrice={wholesalePrice}
                    corporatePrice={corporatePrice}
                    visiblePrice="wholesale"
                    className="w-full"
                  />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <InlinePriceEditor
                    productId={product.id}
                    productName={product.name}
                    retailPrice={retailPrice}
                    wholesalePrice={wholesalePrice}
                    corporatePrice={corporatePrice}
                    visiblePrice="retail"
                    className="w-full"
                  />
                  {hasPromotion && (
                    <span className="text-muted-foreground text-xs line-through">
                      {formatCurrency(retailPrice)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="space-y-2">
                    <InlineCategoryEditor
                      productId={product.id}
                      productSku={String(product.sku)}
                      productName={product.name}
                    />
                    <CategoryTags
                      categories={parseCategories(product.categories)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="icon" variant="ghost">
                    <Link href={productDetailsHref}>
                      <Eye className="size-4" />
                      <span className="sr-only">
                        Ver detalhes de {product.name}
                      </span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
