import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
import { RegistryEntityImage } from "@/components/registry";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import { ProductNameEditor } from "./product-name-editor";

interface ProductIdentitySectionProps {
  product: UIProductManager;
}

export function ProductIdentitySection({
  product,
}: ProductIdentitySectionProps) {
  return (
    <DetailRecordHeading
      image={
        <RegistryEntityImage
          name={product.name}
          imagePath={product.imagePath}
          defaultImage="/default-images/no-product-image.png"
          entityLabel="do produto"
          viewMode="list"
        />
      }
      title={
        <ProductNameEditor
          productId={product.id}
          initialName={product.name}
          metadata={
            <>
              <span className="tabular-nums">ID: #{product.id}</span>
              {product.sku ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>SKU: {product.sku}</span>
                </>
              ) : null}
              {product.model ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Modelo: {product.model}</span>
                </>
              ) : null}
            </>
          }
        />
      }
    />
  );
}
