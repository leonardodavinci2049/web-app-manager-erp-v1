import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import type { UIPurchasingProduct } from "@/services/api-main/purchasing/transformers/transformers";
import { PurchasingResults } from "./purchasing-results";
import { PurchasingToolbar } from "./purchasing-toolbar";
import type {
  PurchasingCategoryOption,
  PurchasingSupplierOption,
} from "./types/purchasing-dashboard-types";

interface PurchasingDashboardProps {
  products: UIPurchasingProduct[];
  total: number;
  page: number;
  pageSize: number;
  returnTo: string;
  hasLoadError: boolean;
  hasActiveQuery: boolean;
  brands: UIBrand[];
  categories: PurchasingCategoryOption[];
  ptypes: UIPtype[];
  supplierOptions: PurchasingSupplierOption[];
}

export function PurchasingDashboard({
  products,
  total,
  page,
  pageSize,
  returnTo,
  hasLoadError,
  hasActiveQuery,
  brands,
  categories,
  ptypes,
  supplierOptions,
}: PurchasingDashboardProps) {
  const commonProps = {
    products,
    total,
    page,
    pageSize,
    returnTo,
    hasLoadError,
    hasActiveQuery,
  };

  return (
    <PurchasingToolbar
      brands={brands}
      categories={categories}
      ptypes={ptypes}
      supplierOptions={supplierOptions}
      grid={<PurchasingResults {...commonProps} viewMode="grid" />}
      list={<PurchasingResults {...commonProps} viewMode="list" />}
    />
  );
}
