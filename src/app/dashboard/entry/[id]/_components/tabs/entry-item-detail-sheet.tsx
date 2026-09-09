"use client";

import {
  CircleDollarSign,
  ClipboardList,
  Eye,
  FileText,
  Package,
  Percent,
  RotateCcw,
  StickyNote,
  Tags,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import type { EntryItemViewModel } from "./entry-items-tab";

type DetailStatus = "loading" | "error" | "notFound" | "success";

interface EntryItemDetailSheetProps {
  entryId: number;
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
  item,
  onOpenChange,
}: EntryItemDetailSheetProps) {
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [detail, setDetail] = useState<EntryItemDetailDto | null>(null);
  const detailRequestRef = useRef(0);
  const isOpen = item !== null;

  const loadDetail = useCallback(
    async (itemId: number) => {
      const requestId = detailRequestRef.current + 1;
      detailRequestRef.current = requestId;
      setStatus("loading");
      setDetail(null);
      try {
        const result = await findEntryItemAction({ entryId, itemId });
        if (detailRequestRef.current !== requestId) return;
        if (result.success && result.item) {
          setDetail(result.item);
          setStatus("success");
          return;
        }
        setStatus(result.notFound ? "notFound" : "error");
      } catch {
        if (detailRequestRef.current === requestId) setStatus("error");
      }
    },
    [entryId],
  );

  useEffect(() => {
    if (!isOpen || !item) return;

    void loadDetail(item.id);

    return () => {
      detailRequestRef.current += 1;
    };
  }, [isOpen, item, loadDetail]);

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
                <p className="font-medium">Não foi possível carregar o item.</p>
              </div>
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

              <EntrySectionCard
                icon={
                  <ClipboardList
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                }
                title="Informações do item"
              >
                <dl className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  <EntryDetailField
                    label="Quantidade comprada"
                    value={toNumber(detail.purchasedQuantity)}
                  />
                  <EntryDetailField
                    label="Quantidade recebida"
                    value={toNumber(detail.receivedQuantity)}
                  />
                  <EntryDetailField
                    label="Valor unitário"
                    value={toMoney(detail.unitValue)}
                  />
                  <EntryDetailField
                    label="Frete"
                    value={toMoney(detail.freightValue)}
                  />
                  <EntryDetailField
                    label="Valor da nota"
                    value={toMoney(detail.invoiceValue)}
                  />
                </dl>
              </EntrySectionCard>

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

              <EntrySectionCard
                icon={
                  <Tags className="text-primary size-4" aria-hidden="true" />
                }
                title="Preços de venda"
              >
                <dl className="grid gap-x-4 gap-y-4 sm:grid-cols-3">
                  <EntryDetailField
                    label="Atacado"
                    value={toMoney(detail.wholesalePrice)}
                  />
                  <EntryDetailField
                    label="Varejo"
                    value={toMoney(detail.retailPrice)}
                  />
                  <EntryDetailField
                    label="Corporativo"
                    value={toMoney(detail.corporatePrice)}
                  />
                </dl>
              </EntrySectionCard>

              <EntrySectionCard
                icon={
                  <FileText
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                }
                title="Códigos fiscais"
              >
                <dl className="grid gap-x-4 gap-y-4 sm:grid-cols-3">
                  <EntryDetailField label="CFOP" value={detail.cfop} />
                  <EntryDetailField label="NCM" value={detail.ncm} />
                  <EntryDetailField label="CST" value={detail.cst} />
                </dl>
              </EntrySectionCard>

              <EntrySectionCard
                icon={
                  <Percent className="text-primary size-4" aria-hidden="true" />
                }
                title="Impostos"
              >
                <dl className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  <EntryDetailField
                    label="Base / valor ICMS"
                    value={`${toMoney(detail.baseIcms)} / ${toMoney(detail.valueIcms)}`}
                  />
                  <EntryDetailField
                    label="Base / valor IPI"
                    value={`${toMoney(detail.baseIpi)} / ${toMoney(detail.valueIpi)}`}
                  />
                  <EntryDetailField
                    label="Base / valor IBS"
                    value={`${toMoney(detail.baseIbs)} / ${toMoney(detail.valueIbs)}`}
                  />
                  <EntryDetailField
                    label="Base / valor CBS"
                    value={`${toMoney(detail.baseCbs)} / ${toMoney(detail.valueCbs)}`}
                  />
                  <EntryDetailField
                    label="Base / valor ST"
                    value={`${toMoney(detail.baseSt)} / ${toMoney(detail.valueSt)}`}
                  />
                </dl>
              </EntrySectionCard>

              <EntrySectionCard
                icon={
                  <StickyNote
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                }
                title="Anotações"
              >
                <dl>
                  <EntryDetailField label="Anotações" value={detail.notes} />
                </dl>
              </EntrySectionCard>
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
