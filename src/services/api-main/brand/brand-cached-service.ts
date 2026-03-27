import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { brandServiceApi } from "./brand-service-api";
import {
  transformBrand,
  transformBrandList,
  type UIBrand,
} from "./transformers/transformers";

export async function getBrands(
  params: {
    search?: string;
    inactive?: number;
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIBrand[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.brands);

  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await brandServiceApi.findAllBrands({
    pe_search: params.search,
    pe_inactive: params.inactive,
    pe_limit: params.limit,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const brands = brandServiceApi.extractBrands(response);
  return transformBrandList(brands);
}

export async function getBrandById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIBrand | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.brand(String(id)), CACHE_TAGS.brands);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await brandServiceApi.findBrandById({
    pe_brand_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const brand = brandServiceApi.extractBrandById(response);
  if (!brand) {
    return undefined;
  }

  return transformBrand(brand) ?? undefined;
}
