import { RegistryPagination } from "@/components/registry";

interface BrandPaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
  paramName?: string;
}

export function BrandPagination(props: BrandPaginationProps) {
  return <RegistryPagination {...props} ariaLabel="Paginação das marcas" />;
}
