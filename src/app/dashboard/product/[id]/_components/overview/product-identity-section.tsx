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
    <div className="space-y-4">
      <div className="flex min-w-0 items-start gap-3">
        <RegistryEntityImage
          name={product.name}
          imagePath={product.imagePath}
          defaultImage="/default-images/no-product-image.png"
          entityLabel="do produto"
          viewMode="list"
        />
        <div className="min-w-0 flex-1">
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
        </div>
      </div>
    </div>
  );
}
