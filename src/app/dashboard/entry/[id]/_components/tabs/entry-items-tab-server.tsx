import { Skeleton } from "@/components/ui/skeleton";
import { isApiSuccess } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import type { AuthContext } from "@/server/auth-context";
import { getBrands } from "@/services/api-main/brand/brand-service-api";
import {
  type EntryItemEntryListItem,
  entryItemServiceApi,
} from "@/services/api-main/entry-item";
import { getPtypes } from "@/services/api-main/ptype/ptype-service-api";
import { getTaxonomyMenuManager } from "@/services/api-main/taxonomy-base/taxonomy-base-service-api";
import type { EntryItemProductFormOptions } from "./entry-item-product-create-sheet";
import { EntryItemsTab, type EntryItemViewModel } from "./entry-items-tab";

const logger = createLogger("EntryItemsTabServer");
const CATEGORY_MENU_LIMIT = 10_000;
const OPTIONS_LIMIT = 100;

interface EntryItemsTabServerProps {
  entryId: number;
  isStockClosed: boolean;
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
    invoiceValue: String(item.VL_NOTA),
    entryDate: item.DT_ENTRADA,
  };
}

async function loadProductFormOptions(
  apiContext: AuthContext["apiContext"],
): Promise<EntryItemProductFormOptions> {
  const [brands, ptypes, taxonomy] = await Promise.all([
    getBrands({ limit: OPTIONS_LIMIT, ...apiContext }).catch((error) => {
      logger.error("Erro ao buscar marcas para o cadastro de produto", error);
      return [] as Awaited<ReturnType<typeof getBrands>>;
    }),
    getPtypes({ limit: OPTIONS_LIMIT, ...apiContext }).catch((error) => {
      logger.error("Erro ao buscar tipos para o cadastro de produto", error);
      return [] as Awaited<ReturnType<typeof getPtypes>>;
    }),
    getTaxonomyMenuManager({
      limit: CATEGORY_MENU_LIMIT,
      ...apiContext,
    })
      .then(({ items }) => ({
        available: true as const,
        options: items
          .filter(
            (item) => !item.inactive && item.level >= 1 && item.level <= 3,
          )
          .sort(
            (left, right) =>
              left.order - right.order || left.name.localeCompare(right.name),
          )
          .map((item) => ({
            id: item.id,
            parentId: item.parentId,
            name: item.name,
            level: item.level,
          })),
      }))
      .catch((error) => {
        logger.error(
          "Erro ao buscar hierarquia de categorias para o cadastro de produto",
          error,
        );
        return { available: false as const, options: [] };
      }),
  ]);

  return {
    brands: brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      inactive: brand.inactive,
    })),
    ptypes: ptypes.map((ptype) => ({
      id: ptype.id,
      name: ptype.name,
    })),
    taxonomyOptions: taxonomy.options,
    isTaxonomyAvailable: taxonomy.available,
  };
}

export async function EntryItemsTabServer({
  entryId,
  isStockClosed,
  apiContext,
}: EntryItemsTabServerProps) {
  try {
    const [response, productFormOptions] = await Promise.all([
      entryItemServiceApi.findEntryItemsByEntryId({
        ...apiContext,
        pe_entry_id: entryId,
        pe_limit: 1000,
      }),
      loadProductFormOptions(apiContext),
    ]);

    if (!isApiSuccess(response.statusCode)) {
      throw new Error(response.message || "Entry items API returned an error");
    }

    const items = entryItemServiceApi
      .extractEntryItemsByEntryId(response)
      .filter((item) => item.ID_ENTRADA === entryId)
      .map(toEntryItemViewModel);

    return (
      <EntryItemsTab
        entryId={entryId}
        isStockClosed={isStockClosed}
        items={items}
        productFormOptions={productFormOptions}
      />
    );
  } catch (error) {
    logger.error(`Erro ao carregar itens da entrada ${entryId}`, error);
    return (
      <EntryItemsTab
        entryId={entryId}
        isStockClosed={isStockClosed}
        items={[]}
        productFormOptions={{
          brands: [],
          ptypes: [],
          taxonomyOptions: [],
          isTaxonomyAvailable: false,
        }}
        hasLoadError
      />
    );
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
