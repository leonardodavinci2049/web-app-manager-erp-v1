"use server";

import { revalidateTag } from "next/cache";
import { createLogger } from "@/lib/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { ProductServiceApi } from "@/services/api/product/product-service-api";
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
    const businessType =
      parseInt(formData.get("businessType") as string, 10) || 1;

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

    // Prepare API request data - todos os parâmetros conforme API Reference
    const apiData = {
      // Tipo de negócio (obrigatório)
      pe_type_business: businessType, // From FormData

      // Dados básicos do produto (obrigatórios)
      pe_nome_produto: name,
      pe_slug: slug, // Auto-generated slug

      // Dados básicos opcionais
      pe_descricao_tab: description || "",
      pe_etiqueta: tags || "",
      pe_ref: reference || "",
      pe_modelo: model || "",

      // Relacionamentos opcionais
      pe_id_fornecedor: 0, // Default: sem fornecedor
      pe_id_tipo: typeId, // ID do Tipo do formulário
      pe_id_marca: brandId, // ID da Marca do formulário
      pe_id_familia: 0, // Default: sem família
      pe_id_grupo: 0, // Default: sem grupo
      pe_id_subgrupo: 0, // Default: sem subgrupo

      // Características físicas opcionais
      pe_peso_gr: 0,
      pe_comprimento_mm: 0,
      pe_largura_mm: 0,
      pe_altura_mm: 0,
      pe_diametro_mm: 0,
      pe_tempodegarantia_mes: 0,

      // Preços (obrigatórios no formulário)
      pe_vl_venda_atacado: wholesalePrice, // Preço Atacado
      pe_vl_venda_varejo: retailPrice, // Preço Varejo
      pe_vl_corporativo: corporatePrice, // Preço Corporativo

      // Estoque e flags opcionais
      pe_qt_estoque: stock,
      pe_flag_website_off: 0, // Default: website ativo
      pe_flag_importado: 2, // Default: produto importado

      // Informações adicionais opcionais
      pe_info: additionalInfo || "",
    }; // Call API service
    const response = await ProductServiceApi.createProduct(apiData);

    // Validate response
    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage = spResponse?.sp_message || "Erro ao criar produto";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Extract product ID from response
    const productId = ProductServiceApi.extractRecordId(response);

    if (!productId) {
      logger.error("No product ID returned from API:", response);
      return {
        success: false,
        error: "ID do produto não foi retornado",
      };
    }

    // Invalida o cache da listagem de produtos
    revalidateTag(CACHE_TAGS.productsPdv);

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

    // Prepare API request data - todos os parâmetros conforme API Reference
    const apiData = {
      // Tipo de negócio (obrigatório)
      pe_type_business: 1, // Default: 1 (venda para consumidor final) - can be made dynamic if needed
      // Dados básicos do produto (obrigatórios)
      pe_nome_produto: data.name,
      pe_slug: slug, // Use auto-generated slug

      // Dados básicos opcionais
      pe_descricao_tab: data.description || "",
      pe_etiqueta: data.tags || "",
      pe_ref: data.reference || "",
      pe_modelo: data.model || "",

      // Relacionamentos opcionais
      pe_id_fornecedor: 0, // Default: sem fornecedor
      pe_id_tipo: data.typeId || 0, // ID do Tipo
      pe_id_marca: data.brandId || 0,
      pe_id_familia: 0, // Default: sem família
      pe_id_grupo: 0, // Default: sem grupo
      pe_id_subgrupo: 0, // Default: sem subgrupo

      // Características físicas opcionais
      pe_peso_gr: 0,
      pe_comprimento_mm: 0,
      pe_largura_mm: 0,
      pe_altura_mm: 0,
      pe_diametro_mm: 0,
      pe_tempodegarantia_mes: 0,

      // Preços (obrigatórios no formulário)
      pe_vl_venda_atacado: data.wholesalePrice || 0, // Preço Atacado
      pe_vl_venda_varejo: data.retailPrice || 0, // Preço Varejo
      pe_vl_corporativo: data.corporatePrice || 0, // Preço Corporativo

      // Estoque e flags opcionais
      pe_qt_estoque: data.stock || 0,
      pe_flag_website_off: 0, // Default: website ativo
      pe_flag_importado: 2, // Default: produto importado

      // Informações adicionais opcionais
      pe_info: data.additionalInfo || "",
    }; // Call API service
    const response = await ProductServiceApi.createProduct(apiData);

    // Validate response
    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    // Check if operation was successful
    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage = spResponse?.sp_message || "Erro ao criar produto";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Extract product ID from response
    const productId = ProductServiceApi.extractRecordId(response);

    if (!productId) {
      logger.error("No product ID returned from API:", response);
      return {
        success: false,
        error: "ID do produto não foi retornado",
      };
    }

    // Invalida o cache da listagem de produtos
    revalidateTag(CACHE_TAGS.productsPdv);

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
    const response = await ProductServiceApi.updateProductGeneral({
      pe_id_produto: data.productId,
      pe_nome_produto: data.productName,
      pe_ref: data.reference,
      pe_modelo: data.model,
      pe_etiqueta: data.label,
      pe_descricao_tab: data.descriptionTab,
    });

    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar dados gerais";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

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
    const response = await ProductServiceApi.updateProductCharacteristics({
      pe_id_produto: data.productId,
      pe_peso_gr: data.weightGr,
      pe_comprimento_mm: data.lengthMm,
      pe_largura_mm: data.widthMm,
      pe_altura_mm: data.heightMm,
      pe_diametro_mm: data.diameterMm,
      pe_tempodegarantia_dia: data.warrantyDays,
      pe_tempodegarantia_mes: data.warrantyMonths,
    });

    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar características";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

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
    const response = await ProductServiceApi.updateProductTaxValues({
      pe_id_produto: data.productId,
      pe_cfop: data.cfop,
      pe_cst: data.cst,
      pe_ean: data.ean,
      pe_nbm: data.nbm,
      pe_ncm: data.ncm,
      pe_ppb: data.ppb,
      pe_temp: Number(data.temp),
    });

    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage =
        spResponse?.sp_message || "Erro ao atualizar valores fiscais";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

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
    const response = await ProductServiceApi.updateProductFlags({
      pe_id_produto: data.productId,
      pe_flag_controle_fisico: data.controleFisico,
      pe_flag_controle_estoque: data.controlarEstoque,
      pe_flag_descontinuado: data.consignado,
      pe_flag_destaque: data.destaque,
      pe_flag_promocao: data.promocao,
      pe_flag_servico: data.servico,
      pe_flag_website_off: data.websiteOff,
      pe_flag_inativo: data.inativo,
      pe_flag_importado: data.importado,
    });

    if (!ProductServiceApi.isValidOperationResponse(response)) {
      logger.error("Invalid API response:", response);
      return {
        success: false,
        error: "Resposta inválida da API",
      };
    }

    if (!ProductServiceApi.isOperationSuccessful(response)) {
      const spResponse =
        ProductServiceApi.extractStoredProcedureResponse(response);
      const errorMessage = spResponse?.sp_message || "Erro ao atualizar flags";
      logger.error("API returned error:", { spResponse, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }

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
