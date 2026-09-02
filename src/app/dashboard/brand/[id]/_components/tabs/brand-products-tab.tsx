import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BrandProductDto } from "../../../_components/types/brand-dashboard-types";
import { BrandProductsList } from "../brand-products-list";

interface BrandProductsTabProps {
  brandId: number;
  products: BrandProductDto[];
  productTotal: number;
  productPage: number;
  productPageSize: number;
  productReturnTo: string;
  hasProductsError: boolean;
}

export function BrandProductsTab({
  brandId,
  products,
  productTotal,
  productPage,
  productPageSize,
  productReturnTo,
  hasProductsError,
}: BrandProductsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos relacionados</CardTitle>
      </CardHeader>
      <CardContent>
        {hasProductsError ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">
              Não foi possível carregar os produtos relacionados.
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Os demais dados da marca permanecem disponíveis.
            </p>
          </div>
        ) : (
          <BrandProductsList
            brandId={brandId}
            products={products}
            productTotal={productTotal}
            productPage={productPage}
            pageSize={productPageSize}
            brandReturnTo={productReturnTo}
          />
        )}
      </CardContent>
    </Card>
  );
}
