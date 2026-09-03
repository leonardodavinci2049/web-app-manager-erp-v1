import { Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierDetailField } from "../carrier-detail-field";

interface CarrierInternetTabProps {
  carrier: UICarrier;
}

export function CarrierInternetTab({ carrier }: CarrierInternetTabProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="size-4" aria-hidden="true" />
          Internet
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CarrierDetailField label="Website" value={carrier.website} />
          <CarrierDetailField label="Facebook" value={carrier.facebook} />
          <CarrierDetailField label="Twitter" value={carrier.twitter} />
        </dl>
      </CardContent>
    </Card>
  );
}
