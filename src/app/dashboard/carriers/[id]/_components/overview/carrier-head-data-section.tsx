import { Badge } from "@/components/ui/badge";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierImage } from "../../../_components/carrier-image";
import { resolveCarrierPersonTypeLabel } from "../carrier-detail-utils";

interface CarrierHeadDataSectionProps {
  carrier: UICarrier;
}

export function CarrierHeadDataSection({
  carrier,
}: CarrierHeadDataSectionProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <CarrierImage
        key={carrier.imagePath}
        name={carrier.name}
        imagePath={carrier.imagePath}
        viewMode="list"
      />
      <div className="min-w-0">
        <h1 className="break-words text-xl font-bold sm:text-2xl">
          {carrier.name}
        </h1>
        <div className="text-muted-foreground flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap text-sm">
          <span className="tabular-nums">ID: #{carrier.id}</span>
          <Badge variant={carrier.inactive ? "destructive" : "secondary"}>
            {carrier.inactive ? "Inativo" : "Ativo"}
          </Badge>
          <span aria-hidden="true">·</span>
          <span>{resolveCarrierPersonTypeLabel(carrier)}</span>
        </div>
      </div>
    </div>
  );
}
