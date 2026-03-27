"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { productBaseServiceApi } from "@/services/api-main/product-base";
import { productUpdateServiceApi } from "@/services/api-main/product-update";
import { generateSlugFromName } from "@/utils/slug-utils";

const logger = createLogger("ProductActions");

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
  additionalInfo?: string;
}

/**
 * Server Action to create a new product from FormData (used with Next.js Form component)
 */
export async function createProductFromForm(formData: FormData): Promise<{
  success: boolean;
  productId?: number;
  error?: string;
}> {
  try {
    // Extract data from FormData
    const name = formData.get("name") as string;
    const reference = formData.get("reference") as string;
    const additionalInfo = formData.get("additionalInfo") as string;

    // Set description, tags, and model as empty strings (server-side)
    const description = "";
    const tags = "";
    const model = "";

    // Parse numeric values with fallbacks
    const wholesalePrice =
      parseFloat(formData.get("wholesalePrice") as string) || 0;
    const retailPrice = parseFloat(formData.get("retailPrice") as string) || 0;
    const corporatePrice =
      parseFloat(formData.get("corporatePrice") as string) || 0;
    const stock = parseInt(formData.get("stock") as string, 10) || 0;
    const brandId = parseInt(formData.get("brandId") as string, 10) || 0;
    const typeId = parseInt(formData.get("typeId") as string, 10) || 0;

    // Auto-generate slug from product name
    const slug = generateSlugFromName(name);

    // Validate that we have a name to work with
    if (!name || !name.trim()) {
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
      pe_product_name: name,
      pe_tab_description: description || "",
      pe_label: tags || "",
      pe_ref: reference || "",
      pe_model: model || "",
      pe_product_type_id: typeId,
      pe_brand_id: brandId,
      pe_weight_gr: 0,
      pe_length_mm: 0,
      pe_width_mm: 0,
      pe_height_mm: 0,
      pe_diameter_mm: 0,
      pe_warranty_period_days: 0,
      pe_wholesale_price: wholesalePrice,
      pe_retail_price: retailPrice,
      pe_corporate_price: corporatePrice,
      pe_stock_quantity: stock,
      pe_website_off_flag: 0,
      pe_imported_flag: 0,
      pe_additional_info: additionalInfo || "",
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

    revalidateTag(CACHE_TAGS.productsPdv, "seconds");
    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidatePath("/dashboard/product/catalog");

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
    if (!data.name || !data.name.trim()) {
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

    revalidateTag(CACHE_TAGS.productsPdv, "seconds");
    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidatePath("/dashboard/product/catalog");

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

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(data.productId)), "hours");

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

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(data.productId)), "hours");

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

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(data.productId)), "hours");

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

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(data.productId)), "hours");

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
