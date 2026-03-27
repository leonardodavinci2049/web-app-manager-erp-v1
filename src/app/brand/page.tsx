import { connection } from "next/server";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getBrands } from "@/services/api-main/brand/brand-cached-service";
import { BrandList } from "./_components/brand-list";

const logger = createLogger("BrandPage");

interface BrandPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function BrandPage(props: BrandPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();

  const brands = await getBrands({
    limit: 100,
    search: searchParams.search,
    ...apiContext,
  }).catch((error) => {
    logger.error("Erro ao buscar marcas:", error);
    return [] as Awaited<ReturnType<typeof getBrands>>;
  });

  return <BrandList brands={brands} />;
}
