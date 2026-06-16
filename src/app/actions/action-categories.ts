"use server";

/**
 * Server Actions para gerenciamento de categorias (taxonomias)
 *
 * Este arquivo contém Server Actions que interagem com o serviço de taxonomias
 * seguindo os padrões de segurança e arquitetura do projeto.
 */

import { revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import type { CategoryNode } from "@/app/dashboard/category/category-overviews/_components/category-tree.types";
import {
  findNodeById as findHierarchyNodeById,
  resolveCategoryQuantities,
  transformTaxonomyToHierarchy,
  validateTaxonomyData,
} from "@/app/dashboard/category/category-overviews/utils/taxonomy-transform";
import { CACHE_TAGS } from "@/lib/cache-config";
import { createLogger } from "@/lib/logger";
import { getAuthContext } from "@/server/auth-context";
import { taxonomyBaseServiceApi } from "@/services/api-main/taxonomy-base";
import {
  transformTaxonomyDetail,
  transformTaxonomyList,
  transformTaxonomyMenuList,
  type UITaxonomy,
  type UITaxonomyMenuItem,
} from "@/services/api-main/taxonomy-base/transformers/transformers";

const logger = createLogger("ActionCategories");
const PRODUCT_CATEGORY_TAXONOMY_TYPE_ID = 1;

const CreateCategoryFromMenuSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome não pode ter mais de 100 caracteres"),
  parentId: z.number().int().min(0),
  parentLevel: z.union([z.literal(0), z.literal(1), z.literal(2)]),
});

const DeleteCategoryFromMenuSchema = z.object({
  categoryId: z.number().int().positive(),
});

/**
 * Interface para parâmetros de busca de categorias
 */
export interface FindCategoriesParams {
  searchTerm?: string;
  searchType?: "name" | "id";
  sortColumn?: number;
  sortOrder?: number;
  filterStatus?: number;
  page?: number;
  perPage?: number;
  parentId?: number;
}

/**
 * Interface para resposta de busca de categorias
 */
export interface FindCategoriesResponse {
  success: boolean;
  data: UITaxonomy[];
  hasMore: boolean;
  total: number;
  error?: string;
}

/**
 * Busca categorias com filtros e paginação
 */
export async function findCategories(
  params: FindCategoriesParams = {},
): Promise<FindCategoriesResponse> {
  try {
    const { apiContext } = await getAuthContext();

    const {
      searchTerm = "",
      searchType = "name",
      sortColumn = 2,
      sortOrder = 2,
      filterStatus = 0,
      page = 0,
      perPage = 20,
      parentId = -1,
    } = params;

    // Construir parâmetros da API com nomes do novo serviço
    const apiParams: Record<string, unknown> = {
      pe_parent_id: parentId,
      pe_flag_inactive: filterStatus,
      pe_records_quantity: perPage,
      pe_page_id: page,
      pe_column_id: sortColumn,
      pe_order_id: sortOrder,
      ...apiContext,
    };

    if (searchTerm) {
      if (searchType === "id") {
        const idNumber = Number.parseInt(searchTerm, 10);
        if (!Number.isNaN(idNumber)) {
          apiParams.pe_taxonomy_id = idNumber;
          apiParams.pe_search = "";
        } else {
          return { success: true, data: [], hasMore: false, total: 0 };
        }
      } else {
        apiParams.pe_search = searchTerm;
      }
    } else {
      apiParams.pe_search = "";
    }

    const response = await taxonomyBaseServiceApi.findAllTaxonomies(apiParams);
    const taxonomies = taxonomyBaseServiceApi.extractTaxonomies(response);
    const categories = transformTaxonomyList(taxonomies);
    const hasMore = categories.length === perPage;

    return {
      success: true,
      data: categories,
      hasMore,
      total: response.quantity || categories.length,
    };
  } catch (error) {
    logger.error("Erro ao buscar categorias", error);
    return {
      success: false,
      data: [],
      hasMore: false,
      total: 0,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao buscar categorias",
    };
  }
}

/**
 * Busca uma categoria específica por ID
 */
export async function findCategoryById(id: number): Promise<UITaxonomy | null> {
  try {
    const { apiContext } = await getAuthContext();

    const response = await taxonomyBaseServiceApi.findTaxonomyById({
      pe_taxonomy_id: id,
      ...apiContext,
    });

    const entity = taxonomyBaseServiceApi.extractTaxonomyById(response);
    if (!entity) return null;

    return transformTaxonomyDetail(entity);
  } catch (error) {
    logger.error(`Erro ao buscar categoria ID ${id}`, error);
    return null;
  }
}

/**
 * Busca o nome da categoria pai
 */
export async function getCategoryParentName(parentId: number): Promise<string> {
  if (parentId === 0 || parentId === null) {
    return "Raiz";
  }

  try {
    const parent = await findCategoryById(parentId);
    return parent?.name || `ID ${parentId}`;
  } catch (error) {
    logger.error(`Erro ao buscar nome da categoria pai ${parentId}`, error);
    return `ID ${parentId}`;
  }
}

/**
 * Interface para parâmetros de atualização de categoria
 */
export interface UpdateCategoryParams {
  id: number;
  name: string;
  slug?: string;
  parentId?: number;
  metaTitle?: string;
  metaDescription?: string;
  notes?: string;
  order?: number;
  imagePath?: string;
  status?: number;
}

/**
 * Interface para resposta de atualização de categoria
 */
export interface UpdateCategoryResponse {
  success: boolean;
  message: string;
  data?: UITaxonomy;
  error?: string;
}

/**
 * Atualiza uma categoria existente
 */
export async function updateCategory(
  params: UpdateCategoryParams,
): Promise<UpdateCategoryResponse> {
  try {
    const { apiContext } = await getAuthContext();

    const {
      id,
      name,
      slug = "",
      parentId = 0,
      metaTitle = "",
      metaDescription = "",
      notes = "",
      order = 1,
      imagePath = "",
      status = 0,
    } = params;

    // Novo serviço lança exceção em caso de erro (checkStoredProcedureError)
    await taxonomyBaseServiceApi.updateTaxonomy({
      pe_taxonomy_id: id,
      pe_taxonomy_name: name,
      pe_slug: slug,
      pe_parent_id: parentId,
      pe_meta_title: metaTitle,
      pe_meta_description: metaDescription,
      pe_info: notes,
      pe_sort_order: order,
      pe_image_path: imagePath,
      pe_inactive: status,
      ...apiContext,
    });

    // Invalida cache de taxonomias
    revalidateTag(CACHE_TAGS.taxonomies, "seconds");
    revalidateTag(CACHE_TAGS.taxonomiesMenu, "hours");
    revalidateTag(CACHE_TAGS.taxonomy(String(id)), "hours");

    const updatedCategory = await findCategoryById(id);
    logger.info(`Categoria ${id} atualizada com sucesso`);

    return {
      success: true,
      message: "Categoria atualizada com sucesso",
      data: updatedCategory || undefined,
    };
  } catch (error) {
    logger.error("Erro ao atualizar categoria", error);
    return {
      success: false,
      message: "Erro ao atualizar categoria",
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao atualizar categoria",
    };
  }
}

/**
 * Interface para parâmetros de criação de categoria
 */
export interface CreateCategoryParams {
  name: string;
  slug: string;
  parentId?: number;
  level?: number;
  type?: number;
}

/**
 * Interface para resposta de criação de categoria
 */
export interface CreateCategoryResponse {
  success: boolean;
  message: string;
  recordId?: number;
  data?: UITaxonomy;
  error?: string;
}

export interface CreateCategoryFromMenuInput {
  name: string;
  parentId: number;
  parentLevel: 0 | 1 | 2;
}

export interface CreateCategoryFromMenuResponse {
  success: boolean;
  message: string;
  recordId?: number;
  error?: string;
}

export interface DeleteCategoryFromMenuInput {
  categoryId: number;
}

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

/**
 * Busca categorias para usar como opções de categoria pai
 * Retorna apenas níveis 1 e 2 (Família e Grupo)
 */
export async function getCategoryOptions(): Promise<UITaxonomyMenuItem[]> {
  try {
    const { apiContext } = await getAuthContext();

    const response = await taxonomyBaseServiceApi.findTaxonomyMenu({
      pe_type_id: 1,
      pe_parent_id: 0,
      ...apiContext,
    });

    if (!taxonomyBaseServiceApi.isValidTaxonomyMenu(response)) {
      logger.error("Resposta inválida do endpoint de menu");
      return [];
    }

    const menuItems = taxonomyBaseServiceApi.extractTaxonomyMenu(response);
    return transformTaxonomyMenuList(menuItems);
  } catch (error) {
    logger.error("Erro ao buscar opções de categorias", error);
    return [];
  }
}

/**
 * Server Action modernizado para criação de categoria
 */
export async function createCategoryAction(formData: FormData) {
  "use server";

  try {
    const rawData = {
      name: formData.get("name") as string,
      parentId: formData.get("parentId") as string,
    };

    const { CreateCategoryServerSchema } = await import(
      "@/lib/validations/category-validations"
    );

    let validated: { name: string; parentId: number };
    try {
      validated = CreateCategoryServerSchema.parse({
        name: rawData.name,
        parentId: rawData.parentId,
      });
    } catch (validationError) {
      logger.error("Erro de validação", validationError);
      throw new Error("Dados do formulário inválidos");
    }

    const { generateSlugFromName } = await import(
      "@/lib/validations/category-validations"
    );

    const slug = generateSlugFromName(validated.name);
    if (!slug) {
      logger.error("Falha ao gerar slug a partir do nome", {
        name: validated.name,
      });
      throw new Error("Não foi possível gerar o slug da categoria");
    }

    const { apiContext } = await getAuthContext();

    // Novo serviço lança exceção em caso de erro
    await taxonomyBaseServiceApi.createTaxonomy({
      pe_taxonomy_name: validated.name,
      pe_slug: slug,
      pe_parent_id: validated.parentId,
      pe_level: 1,
      pe_type_id: 1,
      ...apiContext,
    });

    // Invalida cache de taxonomias para refletir a nova categoria
    revalidateTag(CACHE_TAGS.taxonomies, "seconds");
    revalidateTag(CACHE_TAGS.taxonomiesMenu, "hours");

    const { redirect } = await import("next/navigation");
    redirect("/dashboard/category/category-list");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logger.error("Erro ao criar categoria", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Erro interno do servidor");
  }
}

export async function createCategory(
  params: CreateCategoryParams,
): Promise<CreateCategoryResponse> {
  try {
    const { apiContext } = await getAuthContext();

    const {
      name,
      slug,
      parentId = 0,
      level = 1,
      type = PRODUCT_CATEGORY_TAXONOMY_TYPE_ID,
    } = params;

    const response = await taxonomyBaseServiceApi.createTaxonomy({
      pe_taxonomy_name: name,
      pe_slug: slug,
      pe_parent_id: parentId,
      pe_level: level,
      pe_type_id: type,
      ...apiContext,
    });

    const spResult =
      taxonomyBaseServiceApi.extractStoredProcedureResult(response);
    const recordId = spResult?.sp_return_id ?? response.recordId;

    if (!recordId) {
      throw new Error("ID do registro criado não foi retornado");
    }

    // Invalida cache de taxonomias
    revalidateTag(CACHE_TAGS.taxonomies, "seconds");
    revalidateTag(CACHE_TAGS.taxonomiesMenu, "hours");

    const createdCategory = await findCategoryById(recordId);

    return {
      success: true,
      message: "Categoria criada com sucesso",
      recordId,
      data: createdCategory || undefined,
    };
  } catch (error) {
    logger.error("Erro ao criar categoria", error);
    return {
      success: false,
      message: "Erro ao criar categoria",
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao criar categoria",
    };
  }
}

/**
 * Interface para resposta de exclusão de categoria
 */
export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface DeleteCategoryFromMenuResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Deleta uma categoria (soft delete)
 */
export async function deleteCategory(
  categoryId: number,
): Promise<DeleteCategoryResponse> {
  try {
    const { apiContext } = await getAuthContext();

    const response = await taxonomyBaseServiceApi.deleteTaxonomy({
      pe_taxonomy_id: categoryId,
      ...apiContext,
    });

    const spResponse =
      taxonomyBaseServiceApi.extractStoredProcedureResult(response);
    const successMessage =
      spResponse?.sp_message ||
      response.message ||
      "Categoria deletada com sucesso";

    // Invalida cache de taxonomias
    revalidateTag(CACHE_TAGS.taxonomies, "seconds");
    revalidateTag(CACHE_TAGS.taxonomiesMenu, "hours");
    revalidateTag(CACHE_TAGS.taxonomy(String(categoryId)), "hours");

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    logger.error("Erro ao deletar categoria", error);
    return {
      success: false,
      message: "Erro ao deletar categoria",
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao deletar categoria",
    };
  }
}

export async function createCategoryFromMenuAction(
  input: CreateCategoryFromMenuInput,
): Promise<CreateCategoryFromMenuResponse> {
  try {
    const validatedInput = CreateCategoryFromMenuSchema.parse(input);
    const { apiContext } = await getAuthContext();

    let level: 1 | 2 | 3 = 1;

    if (validatedInput.parentId === 0) {
      if (validatedInput.parentLevel !== 0) {
        return {
          success: false,
          message: "Nível da categoria raiz inválido.",
          error: "Nível da categoria raiz inválido.",
        };
      }
    } else {
      const categories = await loadCategoryHierarchyForMutations(apiContext);
      const parentNode = findHierarchyNodeById(
        categories,
        validatedInput.parentId,
      );

      if (!parentNode) {
        return {
          success: false,
          message: "Categoria pai não encontrada.",
          error: "Categoria pai não encontrada.",
        };
      }

      if (parentNode.level >= 3) {
        return {
          success: false,
          message: "Não é possível adicionar subcategorias no nível 3.",
          error: "Não é possível adicionar subcategorias no nível 3.",
        };
      }

      level = (parentNode.level + 1) as 2 | 3;
    }

    const { generateSlugFromName } = await import(
      "@/lib/validations/category-validations"
    );

    const slug = generateSlugFromName(validatedInput.name);
    if (!slug) {
      return {
        success: false,
        message: "Não foi possível gerar o slug da categoria.",
        error: "Não foi possível gerar o slug da categoria.",
      };
    }

    const response = await taxonomyBaseServiceApi.createTaxonomy({
      pe_taxonomy_name: validatedInput.name,
      pe_slug: slug,
      pe_parent_id: validatedInput.parentId,
      pe_level: level,
      pe_type_id: PRODUCT_CATEGORY_TAXONOMY_TYPE_ID,
      ...apiContext,
    });

    const spResult =
      taxonomyBaseServiceApi.extractStoredProcedureResult(response);
    const recordId = spResult?.sp_return_id ?? response.recordId;
    const message =
      spResult?.sp_message ||
      response.message ||
      "Categoria criada com sucesso.";

    revalidateTag(CACHE_TAGS.taxonomies, "seconds");
    revalidateTag(CACHE_TAGS.taxonomiesMenu, "hours");
    revalidateTag(
      CACHE_TAGS.taxonomyMenu(String(PRODUCT_CATEGORY_TAXONOMY_TYPE_ID)),
      "hours",
    );

    return {
      success: true,
      message,
      recordId,
    };
  } catch (error) {
    logger.error("Erro ao criar categoria pelo menu", error);

    const message =
      error instanceof Error ? error.message : "Erro ao criar categoria.";

    return {
      success: false,
      message,
      error: message,
    };
  }
}

export async function deleteCategoryFromMenuAction(
  input: DeleteCategoryFromMenuInput,
): Promise<DeleteCategoryFromMenuResponse> {
  try {
    const validatedInput = DeleteCategoryFromMenuSchema.parse(input);
    const { apiContext } = await getAuthContext();
    const categories = await loadCategoryHierarchyForMutations(apiContext);
    const node = findHierarchyNodeById(categories, validatedInput.categoryId);

    if (!node) {
      return {
        success: false,
        message: "Categoria não encontrada.",
        error: "Categoria não encontrada.",
      };
    }

    if ((node.children?.length ?? 0) > 0) {
      return {
        success: false,
        message: "Não é possível excluir categoria com subcategorias.",
        error: "Não é possível excluir categoria com subcategorias.",
      };
    }

    if ((node.quantity ?? 0) > 0) {
      return {
        success: false,
        message: "Não é possível excluir categoria com produtos.",
        error: "Não é possível excluir categoria com produtos.",
      };
    }

    const response = await taxonomyBaseServiceApi.deleteTaxonomy({
      pe_taxonomy_id: validatedInput.categoryId,
      ...apiContext,
    });

    const spResponse =
      taxonomyBaseServiceApi.extractStoredProcedureResult(response);
    const message =
      spResponse?.sp_message ||
      response.message ||
      "Categoria excluída com sucesso.";

    revalidateTag(CACHE_TAGS.taxonomies, "seconds");
    revalidateTag(CACHE_TAGS.taxonomiesMenu, "hours");
    revalidateTag(
      CACHE_TAGS.taxonomy(String(validatedInput.categoryId)),
      "hours",
    );
    revalidateTag(
      CACHE_TAGS.taxonomyMenu(String(PRODUCT_CATEGORY_TAXONOMY_TYPE_ID)),
      "hours",
    );

    return {
      success: true,
      message,
    };
  } catch (error) {
    logger.error("Erro ao excluir categoria pelo menu", error);

    const message =
      error instanceof Error ? error.message : "Erro ao excluir categoria.";

    return {
      success: false,
      message,
      error: message,
    };
  }
}

async function loadCategoryHierarchyForMutations(
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<CategoryNode[]> {
  const [menuItems, quantitySource] = await Promise.all([
    loadTaxonomyMenuForMutations(apiContext),
    loadCategoryQuantitySourceForMutations(apiContext),
  ]);

  if (menuItems.length > 0 && validateTaxonomyData(menuItems)) {
    return resolveCategoryQuantities(
      transformTaxonomyToHierarchy(menuItems),
      quantitySource,
    );
  }

  if (validateTaxonomyData(quantitySource)) {
    return resolveCategoryQuantities(
      transformTaxonomyToHierarchy(quantitySource),
      quantitySource,
    );
  }

  return [];
}

async function loadTaxonomyMenuForMutations(
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<UITaxonomyMenuItem[]> {
  const response = await taxonomyBaseServiceApi.findTaxonomyMenu({
    pe_type_id: PRODUCT_CATEGORY_TAXONOMY_TYPE_ID,
    pe_parent_id: 0,
    ...apiContext,
  });

  if (!taxonomyBaseServiceApi.isValidTaxonomyMenu(response)) {
    return [];
  }

  return transformTaxonomyMenuList(
    taxonomyBaseServiceApi.extractTaxonomyMenu(response),
  );
}

async function loadCategoryQuantitySourceForMutations(
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<UITaxonomy[]> {
  const recordsPerPage = 100;
  const maxPages = 10;
  const taxonomies: UITaxonomy[] = [];

  for (let pageId = 0; pageId < maxPages; pageId += 1) {
    const response = await taxonomyBaseServiceApi.findAllTaxonomies({
      pe_parent_id: -1,
      pe_flag_inactive: 0,
      pe_records_quantity: recordsPerPage,
      pe_page_id: pageId,
      pe_column_id: 2,
      pe_order_id: 1,
      ...apiContext,
    });

    const pageData = transformTaxonomyList(
      taxonomyBaseServiceApi.extractTaxonomies(response),
    );

    if (pageData.length === 0) {
      break;
    }

    taxonomies.push(...pageData);

    if (pageData.length < recordsPerPage) {
      break;
    }
  }

  return taxonomies;
}
