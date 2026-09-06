import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
import { RegistryEntityImage } from "@/app/dashboard/_components/registry";
import { Badge } from "@/components/ui/badge";
import type { UIPurchasingProduct } from "@/services/api-main/purchasing/transformers/transformers";

const DEFAULT_PRODUCT_IMAGE = "/images/product/no-image.jpeg";

export function PurchasingIdentity({
  product,
}: {
  product: UIPurchasingProduct;
}) {
  return (
    <DetailRecordHeading
      mobileImage={
        <RegistryEntityImage
          name={product.name}
          imagePath={product.imagePath}
          defaultImage={DEFAULT_PRODUCT_IMAGE}
          entityLabel="do produto"
          viewMode="list"
          size="sm"
          uploadTrigger={<span className="sr-only">Produto sem imagem</span>}
        />
      }
      title={
        <div className="flex flex-wrap items-start gap-2">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {product.name}
          </h1>
          <Badge variant="outline">
            {product.criticalityLevel?.trim() || "Criticidade não informada"}
          </Badge>
        </div>
      }
      metadata={
        <>
          <span>SKU {product.sku}</span>
          <span aria-hidden="true">•</span>
          <span>ID {product.id}</span>
          {product.ref ? (
            <>
              <span aria-hidden="true">•</span>
              <span>Ref. {product.ref}</span>
            </>
          ) : null}
        </>
      }
    />
  );
}
