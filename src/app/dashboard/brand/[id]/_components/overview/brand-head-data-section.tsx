import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
import { Badge } from "@/components/ui/badge";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { BrandImage } from "../../../_components/brand-list/brand-image";

interface BrandHeadDataSectionProps {
  brand: Pick<UIBrand, "id" | "name" | "imagePath" | "inactive">;
}

export function BrandHeadDataSection({ brand }: BrandHeadDataSectionProps) {
  return (
    <DetailRecordHeading
      mobileImage={
        <BrandImage
          name={brand.name}
          imagePath={brand.imagePath}
          viewMode="list"
        />
      }
      title={
        <h1 className="break-words text-xl font-bold sm:text-2xl">
          {brand.name}
        </h1>
      }
      metadata={
        <>
          <Badge variant={brand.inactive ? "secondary" : "outline"}>
            {brand.inactive ? "Inativa" : "Ativa"}
          </Badge>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">Marca ID {brand.id}</span>
        </>
      }
    />
  );
}
