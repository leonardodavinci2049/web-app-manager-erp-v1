import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierDetailField } from "../carrier-detail-field";

interface CarrierNotesTabProps {
  carrier: UICarrier;
}

export function CarrierNotesTab({ carrier }: CarrierNotesTabProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-base">Anotações</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl>
          <CarrierDetailField label="Anotações" value={carrier.notes} />
        </dl>
      </CardContent>
    </Card>
  );
}
