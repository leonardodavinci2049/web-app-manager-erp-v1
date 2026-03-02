import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";

import { productPdvServiceApi } from "./product-pdv-service-api";
import {
  transformProductPdv,
  transformProductPdvList,
  transformProductPdvSearchList,
  transformRelatedCategories,
  type UIProductPdv,
  type UIProductPdvRelatedCategory,
} from "./transformers/transformers";

const logger = createLogger("product-pdv-cached-service");

export async function getProductsPdv(
  params: {
    search?: string;
    taxonomyId?: number;
    typeId?: number;
    brandId?: number;
    flagStock?: number;
    flagService?: number;
    recordsQuantity?: number;
    pageId?: number;
    columnId?: number;
    orderId?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIProductPdv[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.productsPdv);

 // console.log("getProductsPdv called with params  :", params);

  if (!params.pe_system_client_id) {
    return [];
  }




  try {
    const response = await productPdvServiceApi.findAllProductsPdv({
      pe_search: params.search,
      pe_taxonomy_id: params.taxonomyId,
      pe_type_id: params.typeId,
      pe_brand_id: params.brandId,
      pe_flag_stock: params.flagStock,
      pe_flag_service: params.flagService,
      pe_records_quantity: params.recordsQuantity,
      pe_page_id: params.pageId,
      pe_column_id: params.columnId,
      pe_order_id: params.orderId,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const products = productPdvServiceApi.extractProductsPdv(response);
    return transformProductPdvList(products);
  } catch (error) {
    logger.error("Erro ao buscar produtos PDV:", error);
    return [];
  }
}

export async function getProductPdvById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
    pe_type_business?: number;
  } = {},
): Promise<
  | { product: UIProductPdv; relatedCategories: UIProductPdvRelatedCategory[] }
  | undefined
> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.productPdv(String(id)), CACHE_TAGS.productsPdv);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  try {
    const response = await productPdvServiceApi.findProductPdvById({
      pe_product_id: id,
      pe_type_business: params.pe_type_business,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const productEntity = productPdvServiceApi.extractProductPdvById(response);
    if (!productEntity) {
      return undefined;
    }

    const product = transformProductPdv(productEntity);
    if (!product) {
      return undefined;
    }

    const categoriesEntities =
      productPdvServiceApi.extractRelatedCategories(response);
    const relatedCategories = transformRelatedCategories(categoriesEntities);

    return { product, relatedCategories };
  } catch (error) {
    logger.error(`Erro ao buscar produto PDV por ID ${id}:`, error);
    return undefined;
  }
}

export async function searchProductsPdv(
  params: {
    search?: string;
    customerId?: number;
    flagStock?: number;
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIProductPdv[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.productsPdv);

  if (!params.pe_system_client_id) {
    return [];
  }

  try {
    const response = await productPdvServiceApi.findProductsPdvSearch({
      pe_search: params.search,
      pe_customer_id: params.customerId,
      pe_flag_stock: params.flagStock,
      pe_limit: params.limit,
      pe_system_client_id: params.pe_system_client_id,
      pe_organization_id: params.pe_organization_id,
      pe_user_id: params.pe_user_id,
      pe_user_name: params.pe_user_name,
      pe_user_role: params.pe_user_role,
      pe_person_id: params.pe_person_id,
    });

    const products = productPdvServiceApi.extractProductsPdvSearch(response);
    return transformProductPdvSearchList(products);
  } catch (error) {
    logger.error("Erro ao buscar produtos PDV por termo de pesquisa:", error);
    return [];
  }
}
