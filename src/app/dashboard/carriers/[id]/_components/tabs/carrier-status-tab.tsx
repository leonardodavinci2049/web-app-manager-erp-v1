import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierDetailField } from "../carrier-detail-field";

interface CarrierStatusTabProps {
  carrier: UICarrier;
}

export function CarrierStatusTab({ carrier }: CarrierStatusTabProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="flex-row items-center justify-between px-4 sm:px-6">
        <CardTitle className="text-base">Status</CardTitle>
        <Badge variant={carrier.inactive ? "destructive" : "secondary"}>
          {carrier.inactive ? "Inativo" : "Ativo"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <CarrierDetailField
            label="Fretador"
            value={
              carrier.freightForwarder === undefined
                ? undefined
                : carrier.freightForwarder
                  ? "Sim"
                  : "Não"
            }
          />
          <CarrierDetailField
            label="Status do cadastro"
            value={carrier.inactive ? "Inativo" : "Ativo"}
          />
        </dl>
        <p className="text-muted-foreground text-xs">
          A listagem aceita filtro de status, mas o endpoint de atualização não
          permite ativar ou inativar transportadoras.
        </p>
        <Button type="button" variant="outline" disabled>
          Alterar status — Pendente de API
        </Button>
      </CardContent>
    </Card>
  );
}
