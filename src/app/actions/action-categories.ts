"use server";

/**
 * Server Actions para gerenciamento de categorias (taxonomias)
 *
 * Este arquivo contém Server Actions que interagem com o serviço de taxonomias
 * seguindo os padrões de segurança e arquitetura do projeto.
 */

import { createLogger } from "@/lib/logger";
import { getAuthContext } from "@/server/auth-context";
import { taxonomyBaseServiceApi } from "@/services/api-main/taxonomy-base";
import {
  transformTaxonomyMenuList,
  type UITaxonomyMenuItem,
} from "@/services/api-main/taxonomy-base/transformers/transformers";

const logger = createLogger("ActionCategories");
const PRODUCT_CATEGORY_TAXONOMY_TYPE_ID = 1;

/**
 * Server Action to load categories menu for client components
 * Uses the default taxonomy type configured for product categories
 */
export async function loadCategoriesMenuAction() {
  try {
    const { apiContext } = await getAuthContext();

    const response = await taxonomyBaseServiceApi.findTaxonomyMenu({
      pe_type_id: PRODUCT_CATEGORY_TAXONOMY_TYPE_ID,
      pe_parent_id: 0,
      ...apiContext,
    });

    if (taxonomyBaseServiceApi.isValidTaxonomyMenu(response)) {
      const menuItems = taxonomyBaseServiceApi.extractTaxonomyMenu(response);
      const taxonomies = transformTaxonomyMenuList(menuItems);

      return {
        success: true,
        data: taxonomies,
        message: "Categorias carregadas com sucesso",
      };
    }
    throw new Error("Resposta inválida da API de taxonomias");
  } catch (error) {
    logger.error("Error loading categories menu in server action", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro ao carregar categorias";

    return {
      success: false,
      data: [] as UITaxonomyMenuItem[],
      message: errorMessage,
    };
  }
}
