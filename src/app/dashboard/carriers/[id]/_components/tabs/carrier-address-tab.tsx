import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierDetailField } from "../carrier-detail-field";

interface CarrierAddressTabProps {
  carrier: UICarrier;
}

export function CarrierAddressTab({ carrier }: CarrierAddressTabProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-4" aria-hidden="true" />
          Endereço
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CarrierDetailField label="CEP" value={carrier.zipCode} />
          <CarrierDetailField label="Endereço" value={carrier.address} />
          <CarrierDetailField label="Número" value={carrier.addressNumber} />
          <CarrierDetailField label="Complemento" value={carrier.complement} />
          <CarrierDetailField label="Bairro" value={carrier.neighborhood} />
          <CarrierDetailField label="Cidade" value={carrier.city} />
          <CarrierDetailField label="UF" value={carrier.state} />
          <CarrierDetailField label="País" value={carrier.country} />
          <CarrierDetailField
            label="Código do município"
            value={carrier.cityCode}
          />
          <CarrierDetailField label="Código da UF" value={carrier.stateCode} />
        </dl>
      </CardContent>
    </Card>
  );
}
