import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { taxonomyBaseServiceApi } from "./taxonomy-base-service-api";
import {
  transformTaxonomyDetail,
  transformTaxonomyList,
  transformTaxonomyMenuList,
  type UITaxonomy,
  type UITaxonomyMenuItem,
} from "./transformers/transformers";

export async function getTaxonomies(
  params: {
    parentId?: number;
    search?: string;
    inactive?: number;
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
): Promise<UITaxonomy[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.taxonomies);

  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await taxonomyBaseServiceApi.findAllTaxonomies({
    pe_parent_id: params.parentId,
    pe_search: params.search,
    pe_flag_inactive: params.inactive,
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

  const taxonomies = taxonomyBaseServiceApi.extractTaxonomies(response);
  return transformTaxonomyList(taxonomies);
}

export async function getTaxonomyById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UITaxonomy | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.taxonomy(String(id)), CACHE_TAGS.taxonomies);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await taxonomyBaseServiceApi.findTaxonomyById({
    pe_taxonomy_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const taxonomy = taxonomyBaseServiceApi.extractTaxonomyById(response);
  if (!taxonomy) return undefined;

  return transformTaxonomyDetail(taxonomy);
}

export async function getTaxonomyMenu(
  typeId: number,
  parentId: number = 0,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UITaxonomyMenuItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.taxonomyMenu(String(typeId)), CACHE_TAGS.taxonomiesMenu);

  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await taxonomyBaseServiceApi.findTaxonomyMenu({
    pe_type_id: typeId,
    pe_parent_id: parentId,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const menuItems = taxonomyBaseServiceApi.extractTaxonomyMenu(response);
  return transformTaxonomyMenuList(menuItems);
}
