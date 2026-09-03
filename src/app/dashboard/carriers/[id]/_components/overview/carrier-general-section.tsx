import { Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierDetailField } from "../carrier-detail-field";

interface CarrierGeneralSectionProps {
  carrier: UICarrier;
}

export function CarrierGeneralSection({ carrier }: CarrierGeneralSectionProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Phone className="size-4" aria-hidden="true" />
          Geral
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CarrierDetailField label="Nome" value={carrier.name} />
          </div>
          <CarrierDetailField label="Telefone" value={carrier.phone} />
          <CarrierDetailField label="WhatsApp" value={carrier.whatsapp} />
          <CarrierDetailField label="Contato" value={carrier.contact} />
          <div className="sm:col-span-2">
            <CarrierDetailField label="E-mail" value={carrier.email} />
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
