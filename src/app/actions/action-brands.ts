"use server";

import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { brandServiceApi } from "@/services/api-main/brand";
import {
  transformBrandList,
  type UIBrand,
} from "@/services/api-main/brand/transformers/transformers";

const logger = createLogger("ActionBrands");

/**
 * Carrega lista de marcas para uso em menus/selects
 */
export async function loadBrandsListAction(): Promise<{
  success: boolean;
  data: UIBrand[];
  message: string;
}> {
  try {
    const { apiContext } = await getAuthContext();

    const response = await brandServiceApi.searchAllBrands({
      pe_limit: 100,
      ...apiContext,
    });

    const brands = brandServiceApi.extractSearchBrands(response);
    return {
      success: true,
      data: transformBrandList(brands),
      message: "Marcas carregadas com sucesso",
    };
  } catch (error) {
    logger.error("Erro ao carregar marcas na server action", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao carregar marcas";
    return {
      success: false,
      data: [],
      message: errorMessage,
    };
  }
}
