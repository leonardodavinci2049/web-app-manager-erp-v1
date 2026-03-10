"use server";

/**
 * Server Actions para gerenciamento de categorias (taxonomias)
 *
 * Este arquivo contém Server Actions que interagem com o serviço de taxonomias
 * seguindo os padrões de segurança e arquitetura do projeto.
 */

import { revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { CACHE_TAGS } from "@/lib/cache-config";
import { createLogger } from "@/lib/logger";
import { taxonomyBaseServiceApi } from "@/services/api-main/taxonomy-base";
import {
  transformTaxonomyDetail,
  transformTaxonomyList,
  transformTaxonomyMenuList,
  type UITaxonomy,
  type UITaxonomyMenuItem,
} from "@/services/api-main/taxonomy-base/transformers/transformers";

const logger = createLogger("ActionCategories");

// Helper para obter contexto da sessão
async function getSessionContext() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;
  return {
    session,
    apiContext: {
      pe_system_client_id: session.session?.systemId ?? 0,
      pe_organization_id: session.session?.activeOrganizationId ?? "0",
      pe_user_id: session.user.id ?? "0",
      pe_user_name: session.user.name ?? "",
      pe_user_role: session.user.role ?? "admin",
      pe_person_id: 1,
    },
  };
}

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
    const ctx = await getSessionContext();
    if (!ctx) {
      logger.error("Usuário não autenticado");
      return {
        success: false,
        data: [],
        hasMore: false,
        total: 0,
        error: "Usuário não autenticado",
      };
    }

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
      ...ctx.apiContext,
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
    const ctx = await getSessionContext();
    if (!ctx) {
      logger.error("Usuário não autenticado");
      return null;
    }

    const response = await taxonomyBaseServiceApi.findTaxonomyById({
      pe_taxonomy_id: id,
      ...ctx.apiContext,
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
    const ctx = await getSessionContext();
    if (!ctx) {
      logger.error("Usuário não autenticado");
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "Usuário não autenticado",
      };
    }

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
      ...ctx.apiContext,
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

/**
 * Server Action to load categories menu for client components
 * Uses pe_type_id = 2 for product categories as per API documentation
 */
export async function loadCategoriesMenuAction() {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      logger.error("Usuário não autenticado para carregar menu de categorias");
      return {
        success: false,
        data: [] as UITaxonomyMenuItem[],
        message: "Usuário não autenticado",
      };
    }

    const response = await taxonomyBaseServiceApi.findTaxonomyMenu({
      pe_type_id: 2,
      pe_parent_id: 0,
      ...ctx.apiContext,
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
    const ctx = await getSessionContext();
    if (!ctx) {
      logger.error("Usuário não autenticado");
      return [];
    }

    const response = await taxonomyBaseServiceApi.findTaxonomyMenu({
      pe_type_id: 1,
      pe_parent_id: 0,
      ...ctx.apiContext,
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

    const ctx = await getSessionContext();
    if (!ctx) {
      logger.error("Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }

    // Novo serviço lança exceção em caso de erro
    await taxonomyBaseServiceApi.createTaxonomy({
      pe_taxonomy_name: validated.name,
      pe_slug: slug,
      pe_parent_id: validated.parentId,
      pe_level: 1,
      pe_type_id: 1,
      ...ctx.apiContext,
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
    const ctx = await getSessionContext();
    if (!ctx) {
      logger.error("Usuário não autenticado");
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "Usuário não autenticado",
      };
    }

    const { name, slug, parentId = 0, level = 1, type = 2 } = params;

    const response = await taxonomyBaseServiceApi.createTaxonomy({
      pe_taxonomy_name: name,
      pe_slug: slug,
      pe_parent_id: parentId,
      pe_level: level,
      pe_type_id: type,
      ...ctx.apiContext,
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

/**
 * Deleta uma categoria (soft delete)
 */
export async function deleteCategory(
  categoryId: number,
): Promise<DeleteCategoryResponse> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return {
        success: false,
        message: "Não autorizado",
        error: "Usuário não autenticado",
      };
    }

    const response = await taxonomyBaseServiceApi.deleteTaxonomy({
      pe_taxonomy_id: categoryId,
      ...ctx.apiContext,
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
