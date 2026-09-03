import { LockKeyhole, Trash2 } from "lucide-react";
import { DetailDeletionCard } from "@/app/dashboard/_components/detail-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProductDeletionTab() {
  return (
    <DetailDeletionCard
      titleIcon={<LockKeyhole className="size-4" />}
      badge={<Badge variant="secondary">Pendente de API</Badge>}
    >
      <p className="text-muted-foreground text-sm">
        A API atual não oferece um contrato seguro para excluir produtos.
      </p>
      <Button type="button" variant="destructive" disabled>
        <Trash2 className="size-4" />
        Excluir produto — Pendente de API
      </Button>
    </DetailDeletionCard>
  );
}
