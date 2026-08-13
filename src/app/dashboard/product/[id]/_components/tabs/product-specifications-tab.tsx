import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import { ProductCharacteristicsCard } from "./product-characteristics-card";
import { ProductGeneralDataCard } from "./product-general-data-card";
import { ProductTaxInformationCard } from "./product-tax-information-card";

interface ProductSpecificationsTabProps {
  product: UIProductManager;
}

export function ProductSpecificationsTab({
  product,
}: ProductSpecificationsTabProps) {
  return (
    <div className="space-y-4">
      <ProductGeneralDataCard
        productId={product.id}
        productName={product.name}
        descriptionTab={product.shortDescription || ""}
        label={product.label || ""}
        reference={product.ref || ""}
        model={product.model || ""}
      />

      <ProductCharacteristicsCard
        productId={product.id}
        warrantyDays={product.warrantyDays}
        weightGr={product.weightGr ?? 0}
        lengthMm={product.lengthMm ?? 0}
        widthMm={product.widthMm ?? 0}
        heightMm={product.heightMm ?? 0}
        diameterMm={product.diameterMm ?? 0}
      />

      <ProductTaxInformationCard
        productId={product.id}
        cfop={product.cfop}
        cst={product.cst}
        ean={product.ean}
        ncm={product.ncm}
        nbm={product.nbm}
        ppb={product.ppb}
        temp={product.temp}
      />
    </div>
  );
}
