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
    <div className="flex min-w-0 items-start gap-3">
      <SupplierImage
        name={supplier.name}
        imagePath={supplier.imagePath}
        viewMode="list"
      />
      <div className="min-w-0">
        <h1 className="break-words text-xl font-bold sm:text-2xl">
          {supplier.name}
        </h1>
        <div className="text-muted-foreground flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap text-sm">
          <span className="tabular-nums">ID: #{supplier.id}</span>
          <Badge variant={supplier.inactive ? "destructive" : "secondary"}>
            {supplier.inactive ? "Inativo" : "Ativo"}
          </Badge>
          <span aria-hidden="true">·</span>
          <span>{resolveSupplierPersonTypeLabel(supplier)}</span>
        </div>
      </div>
    </div>
  );
}
