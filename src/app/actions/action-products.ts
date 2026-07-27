"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { productBaseServiceApi } from "@/services/api-main/product-base";
import { productUpdateServiceApi } from "@/services/api-main/product-update";
import { getTaxonomyMenuManager } from "@/services/api-main/taxonomy-base/taxonomy-base-service-api";
import { generateSlugFromName } from "@/utils/slug-utils";

const logger = createLogger("ProductActions");
const CATEGORY_MENU_LIMIT = 10_000;

const createProductFormSchema = z
  .object({
    name: z.string().trim().min(6).max(300),
    reference: z.string().trim().max(100),
    model: z.string().trim().max(100),
    label: z.string().trim().max(100),
    wholesalePrice: z.number().finite().positive().max(2000000),
    retailPrice: z.number().finite().positive().max(2000000),
    corporatePrice: z.number().finite().positive().max(2000000),
    stock: z.number().int().min(0).max(1000000).default(0),
    brandId: z.number().int().nonnegative().default(0),
    typeId: z.number().int().nonnegative().default(0),
    familyId: z.number().int().nonnegative(),
    groupId: z.number().int().nonnegative(),
    subgroupId: z.number().int().nonnegative(),
    additionalInfo: z.string().trim().max(5000),
  })
  .refine((data) => data.wholesalePrice <= data.retailPrice, {
    path: ["wholesalePrice"],
  });

function readFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readFormNumber(formData: FormData, key: string): number {
  const value = readFormString(formData, key).trim();
  return value === "" ? Number.NaN : Number(value.replace(",", "."));
}

function readFormNumberOrDefault(
  formData: FormData,
  key: string,
  defaultValue = 0,
): number {
  const value = readFormString(formData, key).trim();
  return value === "" ? defaultValue : Number(value.replace(",", "."));
}

// ========================================
// CREATE PRODUCT ACTION
// ========================================

/**
 * Interface for creating a new product
 */
export interface CreateProductData {
  name: string;
  slug?: string; // Now optional - will be auto-generated from name
  reference?: string;
  model?: string;
  description?: string;
  tags?: string;
  brandId?: number;
  typeId?: number; // ID do Tipo
  wholesalePrice?: number; // Preço Atacado
  retailPrice?: number; // Preço Varejo
  corporatePrice?: number; // Preço Corporativo
  stock?: number;
  businessType?: number;
  familyId?: number;
  groupId?: number;
  subgroupId?: number;
  additionalInfo?: string;
}

/**
 * Server Action to create a new product from FormData (used with Next.js Form component)
 */
export async function createProductFromForm(formData: FormData): Promise<{
  success: boolean;
  productId?: number;
  message?: string;
  error?: string;
}> {
  try {
    const { apiContext } = await getAuthContext();
    const parsedData = createProductFormSchema.safeParse({
      name: readFormString(formData, "name"),
      reference: readFormString(formData, "reference"),
      model: readFormString(formData, "model"),
      label: readFormString(formData, "label"),
      wholesalePrice: readFormNumber(formData, "wholesalePrice"),
      retailPrice: readFormNumber(formData, "retailPrice"),
      corporatePrice: readFormNumber(formData, "corporatePrice"),
      stock: readFormNumberOrDefault(formData, "stock"),
      brandId: readFormNumberOrDefault(formData, "brandId"),
      typeId: readFormNumberOrDefault(formData, "typeId"),
      familyId: readFormNumberOrDefault(formData, "familyId"),
      groupId: readFormNumberOrDefault(formData, "groupId"),
      subgroupId: readFormNumberOrDefault(formData, "subgroupId"),
      additionalInfo: readFormString(formData, "additionalInfo"),
    });

    if (!parsedData.success) {
      return {
        success: false,
        error: "Revise os dados informados e tente novamente.",
      };
    }

    const data = parsedData.data;
    const slug = generateSlugFromName(data.name);

    if (!slug || slug.length < 2) {
      return {
        success: false,
        error:
          "Não foi possível gerar um slug válido a partir do nome do produto",
      };
    }

    if (
      (data.familyId === 0 && (data.groupId !== 0 || data.subgroupId !== 0)) ||
      (data.groupId === 0 && data.subgroupId !== 0)
    ) {
      return {
        success: false,
        error: "A hierarquia de categorias informada é inválida.",
      };
    }

    if (data.familyId !== 0) {
      let taxonomyItems: Awaited<
        ReturnType<typeof getTaxonomyMenuManager>
      >["items"];

      try {
        const taxonomyMenu = await getTaxonomyMenuManager({
          limit: CATEGORY_MENU_LIMIT,
          ...apiContext,
        });
        taxonomyItems = taxonomyMenu.items;
      } catch (error) {
        logger.error("Failed to validate product taxonomy hierarchy", error);
        return {
          success: false,
          error:
            "Não foi possível validar as categorias. Tente novamente em instantes.",
        };
      }

      const activeItemsById = new Map(
        taxonomyItems
          .filter((item) => !item.inactive)
          .map((item) => [item.id, item]),
      );
      const family = activeItemsById.get(data.familyId);
      const group =
        data.groupId === 0 ? undefined : activeItemsById.get(data.groupId);
      const subgroup =
        data.subgroupId === 0
          ? undefined
          : activeItemsById.get(data.subgroupId);
      const isValidFamily = family?.level === 1 && family.parentId === 0;
      const isValidGroup =
        data.groupId === 0 ||
        (group?.level === 2 && group.parentId === data.familyId);
      const isValidSubgroup =
        data.subgroupId === 0 ||
        (subgroup?.level === 3 && subgroup.parentId === data.groupId);

      if (!isValidFamily || !isValidGroup || !isValidSubgroup) {
        return {
          success: false,
          error: "A hierarquia de categorias informada é inválida.",
        };
      }
    }

    // Prepare API request data — novos nomes de parâmetros
    const apiData = {
      pe_product_name: data.name,
      pe_tab_description: "",
      pe_label: data.label,
      pe_ref: data.reference,
      pe_model: data.model,
      pe_product_type_id: data.typeId,
      pe_brand_id: data.brandId,
      pe_supplier_id: 0,
      pe_family_id: data.familyId,
      pe_group_id: data.groupId,
      pe_subgroup_id: data.subgroupId,
      pe_weight_gr: 0,
      pe_length_mm: 0,
      pe_width_mm: 0,
      pe_height_mm: 0,
      pe_diameter_mm: 0,
      pe_warranty_period_days: 0,
      pe_wholesale_price: data.wholesalePrice,
      pe_retail_price: data.retailPrice,
      pe_corporate_price: data.corporatePrice,
      pe_stock_quantity: data.stock,
      pe_website_off_flag: 0,
      pe_imported_flag: 2,
      pe_additional_info: data.additionalInfo,
    };

    const response = await productBaseServiceApi.createProduct({
      ...apiData,
      ...apiContext,
    });

    const spResult =
      productBaseServiceApi.extractStoredProcedureResult(response);
    const productId = spResult?.sp_return_id;
    const apiMessage = spResult?.sp_message || response.message;

    if (!productId) {
      logger.error("No product ID returned from API:", response);
      return {
        success: false,
        error: apiMessage || "ID do produto não foi retornado",
      };
    }

    return {
      success: true,
      productId,
      message: apiMessage || "Produto criado com sucesso!",
    };
  } catch (error) {
    unstable_rethrow(error);
    logger.error("Error creating product:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível criar o produto. Tente novamente.",
    };
  }
}

/**
 * Server Action to create a new product (original version for object data)
 */
export async function createProduct(data: CreateProductData): Promise<{
  success: boolean;
  productId?: number;
  error?: string;
}> {
  try {
    // Auto-generate slug from product name if not provided
    const slug = data.slug || generateSlugFromName(data.name);

    // Validate that we have a name to work with
    if (!data.name?.trim()) {
      return {
        success: false,
        error: "Nome do produto é obrigatório",
      };
    }

    // Validate generated slug
    if (!slug || slug.length < 2) {
      return {
        success: false,
        error:
          "Não foi possível gerar um slug válido a partir do nome do produto",
      };
    }

    // Prepare API request data — novos nomes de parâmetros
    const apiData = {
      pe_product_name: data.name,
      pe_tab_description: data.description || "",
      pe_label: data.tags || "",
      pe_ref: data.reference || "",
      pe_model: data.model || "",
      pe_product_type_id: data.typeId || 0,
      pe_brand_id: data.brandId || 0,
      pe_family_id: data.familyId || 0,
      pe_group_id: data.groupId || 0,
      pe_subgroup_id: data.subgroupId || 0,
      pe_weight_gr: 0,
      pe_length_mm: 0,
      pe_width_mm: 0,
      pe_height_mm: 0,
      pe_diameter_mm: 0,
      pe_warranty_period_days: 0,
      pe_wholesale_price: data.wholesalePrice || 0,
      pe_retail_price: data.retailPrice || 0,
      pe_corporate_price: data.corporatePrice || 0,
      pe_stock_quantity: data.stock || 0,
      pe_website_off_flag: 0,
      pe_imported_flag: 0,
      pe_additional_info: data.additionalInfo || "",
    };

    const { apiContext } = await getAuthContext();

    const response = await productBaseServiceApi.createProduct({
      ...apiData,
      ...apiContext,
    });

    const spResult =
      productBaseServiceApi.extractStoredProcedureResult(response);
    const productId = spResult?.sp_return_id;

    if (!productId) {
      logger.error("No product ID returned from API:", response);
      return {
        success: false,
        error: "ID do produto não foi retornado",
      };
    }

    revalidatePath("/dashboard");

    return {
      success: true,
      productId,
    };
  } catch (error) {
    logger.error("Error creating product:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao criar produto";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ========================================
// UPDATE PRODUCT ACTIONS
// ========================================

/**
 * Server Action to update general product data
 */
export async function updateProductGeneral(data: {
  productId: number;
  productName: string;
  descriptionTab: string;
  label: string;
  reference: string;
  model: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { apiContext } = await getAuthContext();

    await productUpdateServiceApi.updateProductGeneral({
      pe_product_id: data.productId,
      pe_product_name: data.productName,
      pe_ref: data.reference,
      pe_model: data.model,
      pe_label: data.label,
      pe_tab_description: data.descriptionTab,
      ...apiContext,
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product general data:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar dados gerais";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action to update product characteristics
 */
export async function updateProductCharacteristics(data: {
  productId: number;
  weightGr: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  diameterMm: number;
  warrantyDays: number;
  warrantyMonths: number;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { apiContext } = await getAuthContext();

    await productUpdateServiceApi.updateProductCharacteristics({
      pe_product_id: data.productId,
      pe_weight_gr: data.weightGr,
      pe_length_mm: data.lengthMm,
      pe_width_mm: data.widthMm,
      pe_height_mm: data.heightMm,
      pe_diameter_mm: data.diameterMm,
      pe_warranty_period_days: data.warrantyDays,
      pe_warranty_period_months: data.warrantyMonths,
      ...apiContext,
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product characteristics:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar características";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action to update product tax values
 */
export async function updateProductTaxValues(data: {
  productId: number;
  cfop: string;
  cst: string;
  ean: string;
  ncm: number;
  nbm: string;
  ppb: number;
  temp: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { apiContext } = await getAuthContext();

    await productUpdateServiceApi.updateProductTaxValues({
      pe_product_id: data.productId,
      pe_cfop: data.cfop,
      pe_cst: data.cst,
      pe_ean: data.ean,
      pe_nbm: data.nbm,
      pe_ncm: data.ncm,
      pe_ppb: data.ppb,
      pe_temp: Number(data.temp),
      ...apiContext,
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product tax values:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar valores fiscais";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action to update product flags
 */
export async function updateProductFlags(data: {
  productId: number;
  controleFisico: number;
  controlarEstoque: number;
  consignado: number;
  destaque: number;
  promocao: number;
  servico: number;
  websiteOff: number;
  inativo: number;
  importado: number;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { apiContext } = await getAuthContext();

    await productUpdateServiceApi.updateProductFlags({
      pe_product_id: data.productId,
      pe_physical_control_flag: data.controleFisico,
      pe_stock_control_flag: data.controlarEstoque,
      pe_discontinued_flag: data.consignado,
      pe_featured_flag: data.destaque,
      pe_promotion_flag: data.promocao,
      pe_service_flag: data.servico,
      pe_website_off_flag: data.websiteOff,
      pe_inactive_flag: data.inativo,
      pe_imported_flag: data.importado,
      ...apiContext,
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product flags:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar flags";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
