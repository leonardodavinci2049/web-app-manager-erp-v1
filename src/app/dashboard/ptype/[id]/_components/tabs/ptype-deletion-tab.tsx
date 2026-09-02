import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PtypeDeletionTabProps {
  disabled: boolean;
  onDelete: () => void;
}

export function PtypeDeletionTab({
  disabled,
  onDelete,
}: PtypeDeletionTabProps) {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive text-base">
          Zona de exclusão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm">
          A API verificará vínculos existentes e informará quando a exclusão não
          for permitida.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          disabled={disabled}
        >
          <Trash2 className="size-4" />
          Excluir tipo de produto
        </Button>
      </CardContent>
    </Card>
  );
}
