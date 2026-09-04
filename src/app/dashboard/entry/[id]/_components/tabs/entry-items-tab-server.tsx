import { Skeleton } from "@/components/ui/skeleton";
import { isApiSuccess } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import type { AuthContext } from "@/server/auth-context";
import {
  type EntryItemEntryListItem,
  entryItemServiceApi,
} from "@/services/api-main/entry-item";
import { EntryItemsTab, type EntryItemViewModel } from "./entry-items-tab";

const logger = createLogger("EntryItemsTabServer");

interface EntryItemsTabServerProps {
  entryId: number;
  apiContext: AuthContext["apiContext"];
}

function toEntryItemViewModel(
  item: EntryItemEntryListItem,
): EntryItemViewModel {
  return {
    id: item.ID_MOVIMENTO,
    productId: item.ID_PRODUTO,
    productName: item.PRODUTO,
    brand: item.MARCA_NOME,
    model: item.MODELO,
    productReference: item.REF_PRODUTO,
    productType: item.TIPO_PRODUTO,
    imagePath: item.PATH_IMAGEM,
    purchasedQuantity: item.QT_COMPRADA,
    receivedQuantity: item.QT_RECEBIDA,
    unitValue: item.VL_UNIT_REAL,
    freightValue: item.VL_FRETE_REAL,
    invoiceValue: item.VL_NOTA,
    entryDate: item.DT_ENTRADA,
  };
}

export async function EntryItemsTabServer({
  entryId,
  apiContext,
}: EntryItemsTabServerProps) {
  try {
    const response = await entryItemServiceApi.findEntryItemsByEntryId({
      ...apiContext,
      pe_entry_id: entryId,
      pe_limit: 1000,
    });

    if (!isApiSuccess(response.statusCode)) {
      throw new Error(response.message || "Entry items API returned an error");
    }

    const items = entryItemServiceApi
      .extractEntryItemsByEntryId(response)
      .filter((item) => item.ID_ENTRADA === entryId)
      .map(toEntryItemViewModel);

    return <EntryItemsTab items={items} />;
  } catch (error) {
    logger.error(`Erro ao carregar itens da entrada ${entryId}`, error);
    return <EntryItemsTab items={[]} hasLoadError />;
  }
}

export function EntryItemsTabSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border p-4 sm:p-6" aria-busy="true">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="space-y-3">
        {["first", "second", "third"].map((key) => (
          <Skeleton key={key} className="h-24 w-full" />
        ))}
      </div>
      <span className="sr-only">Carregando itens da entrada</span>
    </div>
  );
}
