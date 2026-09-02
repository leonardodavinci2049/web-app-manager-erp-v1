import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandDeleteDialog } from "../brand-delete-dialog";

interface BrandDeletionTabProps {
  brandId: number;
  brandName: string;
  productTotal: number;
  hasProductsError: boolean;
  onSuccess: () => void;
}

export function BrandDeletionTab({
  brandId,
  brandName,
  productTotal,
  hasProductsError,
  onSuccess,
}: BrandDeletionTabProps) {
  const isDeleteBlocked = productTotal > 0 || hasProductsError;

  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive text-base">
          Zona de exclusão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isDeleteBlocked && (
          <p className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {hasProductsError
                ? "A exclusão está indisponível enquanto os vínculos da marca não puderem ser verificados."
                : `Esta marca possui ${productTotal} ${productTotal === 1 ? "produto relacionado" : "produtos relacionados"}. Remova ou troque a marca desses produtos antes de excluir.`}
            </span>
          </p>
        )}
        <BrandDeleteDialog
          brandId={brandId}
          brandName={brandName}
          blocked={isDeleteBlocked}
          blockedReason={
            isDeleteBlocked
              ? "Exclusão bloqueada enquanto houver vínculos ou a verificação estiver indisponível."
              : undefined
          }
          onSuccess={onSuccess}
        />
      </CardContent>
    </Card>
  );
}
