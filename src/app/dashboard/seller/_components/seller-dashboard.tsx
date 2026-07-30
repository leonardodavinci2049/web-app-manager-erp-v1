import type { UISellerListItem } from "@/services/api-main/seller";
import { SellerCollection } from "./seller-collection";
import { SellerToolbar } from "./seller-toolbar";
import type { SellerSearchParams } from "./types/seller-dashboard-types";

interface SellerDashboardProps {
  items: UISellerListItem[];
  total: number;
  searchState: SellerSearchParams;
  hasLoadError: boolean;
}

export function SellerDashboard({
  items,
  total,
  searchState,
  hasLoadError,
}: SellerDashboardProps) {
  const grid = (
    <SellerCollection
      items={items}
      total={total}
      searchState={searchState}
      viewMode="grid"
      hasLoadError={hasLoadError}
    />
  );
  const list = (
    <SellerCollection
      items={items}
      total={total}
      searchState={searchState}
      viewMode="list"
      hasLoadError={hasLoadError}
    />
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Vendedores</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Consulte vendedores, contatos, documentos e informações da conta.
        </p>
      </div>
      <SellerToolbar searchState={searchState} grid={grid} list={list} />
    </div>
  );
}
