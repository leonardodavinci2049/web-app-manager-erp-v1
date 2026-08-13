import { LockKeyhole, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CustomerDeletionTab() {
  return (
    <Card className="gap-4 border-destructive/40 bg-destructive/5 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="flex-row items-center justify-between px-4 sm:px-6">
        <CardTitle className="text-destructive flex items-center gap-2 text-base">
          <LockKeyhole className="size-4" />
          Zona de exclusão
        </CardTitle>
        <Badge variant="secondary">Pendente de API</Badge>
      </CardHeader>
      <CardContent className="space-y-3 px-4 sm:px-6">
        <p className="text-muted-foreground text-sm">
          A API atual não oferece um contrato seguro para excluir clientes.
        </p>
        <Button type="button" variant="destructive" disabled>
          <Trash2 className="size-4" />
          Excluir — Pendente de API
        </Button>
      </CardContent>
    </Card>
  );
}
