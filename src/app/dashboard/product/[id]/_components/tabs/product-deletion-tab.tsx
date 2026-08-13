import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProductDeletionTab() {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive text-base">
          Zona de exclusão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm">
          A exclusão de produtos ainda não está disponível nesta tela.
        </p>
        <Button type="button" variant="destructive" disabled>
          Excluir produto — Pendente de API
        </Button>
      </CardContent>
    </Card>
  );
}
