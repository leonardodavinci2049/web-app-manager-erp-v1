import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import { ChangeProductBrandDialog } from "../ChangeProductBrandDialog";
import { ChangeProductTypeDialog } from "../ChangeProductTypeDialog";
import { ProductFlagsCard } from "./ProductFlagsCard";

interface ProductTechnicalDataCardProps {
  product: UIProductManager;
  productId: number;
  onDataChange?: () => void;
}

export function ProductTechnicalDataCard({
  product,
  productId,
  onDataChange,
}: ProductTechnicalDataCardProps) {
  return (
    <div className="space-y-4">
      {/* Card 2 - Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          {product.typeId && product.typeId > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">
                      ID
                    </th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">
                      Nome do Tipo
                    </th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-2 text-sm">{product.typeId}</td>
                    <td className="py-2 px-2 text-sm">{product.type}</td>
                    <td className="py-2 px-2">
                      <ChangeProductTypeDialog
                        productId={productId}
                        currentTypeId={product.typeId}
                        currentTypeName={product.type}
                        onSuccess={onDataChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground italic text-sm">
              Nenhum tipo definido
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card 3 - Marca */}
      <Card>
        <CardHeader>
          <CardTitle>Marca</CardTitle>
        </CardHeader>
        <CardContent>
          {product.brandId && product.brandId > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">
                      ID
                    </th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">
                      Nome da Marca
                    </th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-2 text-sm">{product.brandId}</td>
                    <td className="py-2 px-2 text-sm">{product.brand}</td>
                    <td className="py-2 px-2">
                      <ChangeProductBrandDialog
                        productId={productId}
                        currentBrandId={product.brandId}
                        currentBrandName={product.brand}
                        onSuccess={onDataChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground italic text-sm">
              Nenhuma marca definida
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card 4 - Fornecedor */}
      <Card>
        <CardHeader>
          <CardTitle>Fornecedor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground italic text-sm">
            Nenhum fornecedor definido
          </p>
        </CardContent>
      </Card>

      {/* Card 1 - Flags */}
      <ProductFlagsCard
        productId={productId}
        controleFisico={0}
        controlarEstoque={0}
        consignado={0}
        destaque={product.featured ? 1 : 0}
        promocao={product.promotion ? 1 : 0}
        servico={product.isService ? 1 : 0}
        websiteOff={0}
        inativo={0}
        importado={product.imported ? 1 : 0}
      />
    </div>
  );
}
