"use client";

import {
  CircleDollarSign,
  Eye,
  Package,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatEntryMoney,
  formatEntryNumber,
} from "../../../_components/lib/format";
import {
  type EntryItemDetailDto,
  findEntryItemAction,
} from "../../_actions/entry-item-actions";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";
import { EntryItemMainSection } from "./entry-item-main-section";
import { EntryItemNotesSection } from "./entry-item-notes-section";
import { EntryItemPricesSection } from "./entry-item-prices-section";
import { EntryItemTaxCodesSection } from "./entry-item-tax-codes-section";
import { EntryItemTaxRatesSection } from "./entry-item-tax-rates-section";
import type { EntryItemViewModel } from "./entry-items-tab";

type DetailStatus = "loading" | "error" | "notFound" | "success";

interface EntryItemDetailSheetProps {
  entryId: number;
  isStockClosed: boolean;
  item: EntryItemViewModel | null;
  onOpenChange: (open: boolean) => void;
}

function toMoney(value: string): string {
  return formatEntryMoney(value);
}

function toNumber(value: number): string {
  return formatEntryNumber(String(value));
}

export function EntryItemDetailSheet({
  entryId,
  isStockClosed,
  item,
  onOpenChange,
}: EntryItemDetailSheetProps) {
  const router = useRouter();
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [detail, setDetail] = useState<EntryItemDetailDto | null>(null);
  const [postSaveReloadFailed, setPostSaveReloadFailed] = useState(false);
  const detailRequestRef = useRef(0);
  const isOpen = item !== null;

  const loadDetail = useCallback(
    async (itemId: number): Promise<boolean> => {
      const requestId = detailRequestRef.current + 1;
      detailRequestRef.current = requestId;
      setStatus("loading");
      setDetail(null);
      setPostSaveReloadFailed(false);
      try {
        const result = await findEntryItemAction({ entryId, itemId });
        if (detailRequestRef.current !== requestId) return false;
        if (result.success && result.item) {
          setDetail(result.item);
          setStatus("success");
          return true;
        }
        setStatus(result.notFound ? "notFound" : "error");
        return false;
      } catch {
        if (detailRequestRef.current === requestId) setStatus("error");
        return false;
      }
    },
    [entryId],
  );

  const reloadAfterSave = useCallback(
    async (itemId: number) => {
      const loaded = await loadDetail(itemId);
      if (!loaded) {
        setPostSaveReloadFailed(true);
        toast.warning(
          "Alteração salva, mas não foi possível recarregar os dados atualizados do item.",
        );
      }
    },
    [loadDetail],
  );

  useEffect(() => {
    if (!isOpen || !item) return;

    void loadDetail(item.id);

    return () => {
      detailRequestRef.current += 1;
    };
  }, [isOpen, item, loadDetail]);

  const handleSaved = useCallback(() => {
    router.refresh();
    if (item) void reloadAfterSave(item.id);
  }, [item, reloadAfterSave, router]);

  const handleEntryClosed = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
        onOpenChange(false);
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b p-4 pr-12 sm:p-6 sm:pr-14">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Eye className="text-primary size-5" aria-hidden="true" />
            Detalhes do item
          </SheetTitle>
          <SheetDescription>
            {item ? (
              <>
                Item #{item.id} • Produto #{item.productId} — {item.productName}
              </>
            ) : (
              "Consulta do item da entrada"
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {status === "loading" && (
            <div className="space-y-4" aria-busy="true">
              {[1, 2, 3].map((key) => (
                <div key={key} className="space-y-3 rounded-lg border p-4">
                  <Skeleton className="h-5 w-40" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
              <span className="sr-only">Carregando detalhes do item</span>
            </div>
          )}

          {status === "notFound" && (
            <div
              role="alert"
              className="border-destructive/40 bg-destructive/5 space-y-1 rounded-lg border p-4"
            >
              <p className="font-medium">Item não encontrado nesta entrada.</p>
              <p className="text-muted-foreground text-sm">
                Ele pode ter sido excluído. Feche o painel e atualize a lista.
              </p>
            </div>
          )}

          {status === "error" && (
            <div
              role="alert"
              className="border-destructive/40 bg-destructive/5 space-y-3 rounded-lg border p-4"
            >
              <div className="flex items-center gap-2">
                <TriangleAlert
                  className="text-destructive size-5"
                  aria-hidden="true"
                />
                {postSaveReloadFailed ? (
                  <p className="font-medium">
                    Alteração salva, mas a recarga dos dados falhou.
                  </p>
                ) : (
                  <p className="font-medium">
                    Não foi possível carregar o item.
                  </p>
                )}
              </div>
              {postSaveReloadFailed ? (
                <p className="text-muted-foreground text-sm">
                  A gravação foi concluída; não foi possível recarregar os dados
                  atualizados do item.
                </p>
              ) : null}
              <ButtonRetry onRetry={() => item && void loadDetail(item.id)} />
            </div>
          )}

          {status === "success" && detail && (
            <div className="space-y-4">
              <EntrySectionCard
                icon={
                  <Package className="text-primary size-4" aria-hidden="true" />
                }
                title="Produto"
              >
                <dl className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  <EntryDetailField
                    label="ID do produto"
                    value={detail.productId}
                  />
                  <EntryDetailField
                    label="Produto"
                    value={detail.productName}
                  />
                  <EntryDetailField
                    label="Fornecedor"
                    value={detail.supplier}
                  />
                  <EntryDetailField
                    label="Transportadora"
                    value={detail.carrier}
                  />
                  <EntryDetailField
                    label="Referência do fornecedor"
                    value={detail.supplierReference}
                  />
                  <EntryDetailField
                    label="Estoque loja"
                    value={detail.storeStock}
                  />
                </dl>
              </EntrySectionCard>

              <EntryItemMainSection
                entryId={entryId}
                isStockClosed={isStockClosed}
                detail={detail}
                onSaved={handleSaved}
                onEntryClosed={handleEntryClosed}
              />

              <EntrySectionCard
                icon={
                  <CircleDollarSign
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                }
                title="Dólar"
              >
                <dl className="grid gap-x-4 gap-y-4 sm:grid-cols-3">
                  <EntryDetailField
                    label="Câmbio"
                    value={toNumber(detail.exchangeRate)}
                  />
                  <EntryDetailField
                    label="Valor unitário (US$)"
                    value={toMoney(String(detail.unitValueDollar))}
                  />
                  <EntryDetailField
                    label="Frete (US$)"
                    value={toMoney(String(detail.freightValueDollar))}
                  />
                </dl>
              </EntrySectionCard>

              <EntryItemPricesSection
                entryId={entryId}
                isStockClosed={isStockClosed}
                detail={detail}
                onSaved={handleSaved}
                onEntryClosed={handleEntryClosed}
              />

              <EntryItemTaxCodesSection
                entryId={entryId}
                isStockClosed={isStockClosed}
                detail={detail}
                onSaved={handleSaved}
                onEntryClosed={handleEntryClosed}
              />

              <EntryItemTaxRatesSection
                entryId={entryId}
                isStockClosed={isStockClosed}
                detail={detail}
                onSaved={handleSaved}
                onEntryClosed={handleEntryClosed}
              />

              <EntryItemNotesSection
                entryId={entryId}
                isStockClosed={isStockClosed}
                detail={detail}
                onSaved={handleSaved}
                onEntryClosed={handleEntryClosed}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ButtonRetry({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      type="button"
      className="text-primary inline-flex items-center gap-1.5 text-sm font-medium"
      onClick={onRetry}
    >
      <RotateCcw className="size-4" aria-hidden="true" />
      Tentar novamente
    </button>
  );
}
