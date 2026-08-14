import { PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SellerSoldProductsTab() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <PackageOpen
        className="text-muted-foreground mx-auto size-8"
        aria-hidden="true"
      />
      <p className="mt-3 font-medium">Produtos vendidos indisponíveis</p>
      <p className="text-muted-foreground mx-auto mt-1 max-w-xl text-sm">
        A consulta de produtos vendidos exige um contrato específico com filtro
        por vendedor, que ainda será criado. Para não exibir vendas de outros
        vendedores, nenhuma consulta é realizada nesta subguia.
      </p>
      <Badge variant="secondary" className="mt-3">
        Filtro por vendedor pendente de API
      </Badge>
    </div>
  );
}
