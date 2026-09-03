import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierDetailField } from "../carrier-detail-field";
import { formatCarrierDetailDate } from "../carrier-detail-utils";

interface CarrierMiscellaneousTabProps {
  carrier: UICarrier;
}

export function CarrierMiscellaneousTab({
  carrier,
}: CarrierMiscellaneousTabProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4" aria-hidden="true" />
          Diversos
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <CarrierDetailField
            label="Data de cadastro"
            value={formatCarrierDetailDate(carrier.createdAt)}
          />
          <CarrierDetailField
            label="Data de atualização"
            value={formatCarrierDetailDate(carrier.updatedAt)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
