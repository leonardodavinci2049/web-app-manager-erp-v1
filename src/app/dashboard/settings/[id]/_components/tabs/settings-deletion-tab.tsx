import { Trash2 } from "lucide-react";
import { DetailDeletionCard } from "@/app/dashboard/_components/detail-page";
import { Button } from "@/components/ui/button";

export function SettingsDeletionTab() {
  return (
    <DetailDeletionCard
      titleIcon={<Trash2 className="size-4" aria-hidden="true" />}
    >
      <p className="text-muted-foreground text-sm">
        A exclusão de configurações ainda não está disponível. Os controles
        permanecem desabilitados até que o contrato de exclusão seja definido.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="destructive" disabled>
          <Trash2 className="size-4" aria-hidden="true" />
          Excluir configuração
        </Button>
        <Button type="button" variant="outline" disabled>
          Cancelar
        </Button>
      </div>
    </DetailDeletionCard>
  );
}
