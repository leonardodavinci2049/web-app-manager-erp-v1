import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
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
    <DetailRecordHeading
      mobileImage={
        <CarrierImage
          key={carrier.imagePath}
          name={carrier.name}
          imagePath={carrier.imagePath}
          viewMode="list"
        />
      }
      title={
        <h1 className="break-words text-xl font-bold sm:text-2xl">
          {carrier.name}
        </h1>
      }
      metadata={
        <>
          <span className="tabular-nums">ID: #{carrier.id}</span>
          <Badge variant={carrier.inactive ? "destructive" : "secondary"}>
            {carrier.inactive ? "Inativo" : "Ativo"}
          </Badge>
          <span aria-hidden="true">·</span>
          <span>{resolveCarrierPersonTypeLabel(carrier)}</span>
        </>
      }
    />
  );
}
