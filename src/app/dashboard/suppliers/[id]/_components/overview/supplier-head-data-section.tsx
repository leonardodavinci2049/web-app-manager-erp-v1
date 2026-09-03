import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
import { Badge } from "@/components/ui/badge";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierImage } from "../../../_components/supplier-image";
import { resolveSupplierPersonTypeLabel } from "../supplier-detail-utils";

interface SupplierHeadDataSectionProps {
  supplier: UISupplier;
}

export function SupplierHeadDataSection({
  supplier,
}: SupplierHeadDataSectionProps) {
  return (
    <DetailRecordHeading
      image={
        <SupplierImage
          name={supplier.name}
          imagePath={supplier.imagePath}
          viewMode="list"
        />
      }
      title={
        <h1 className="break-words text-xl font-bold sm:text-2xl">
          {supplier.name}
        </h1>
      }
      metadata={
        <>
          <span className="tabular-nums">ID: #{supplier.id}</span>
          <Badge variant={supplier.inactive ? "destructive" : "secondary"}>
            {supplier.inactive ? "Inativo" : "Ativo"}
          </Badge>
          <span aria-hidden="true">·</span>
          <span>{resolveSupplierPersonTypeLabel(supplier)}</span>
        </>
      }
    />
  );
}
