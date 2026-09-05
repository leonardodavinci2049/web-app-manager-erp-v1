import { RegistryPagination } from "@/app/dashboard/_components/registry";

interface BrandPaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
  paramName?: string;
}

export function BrandPagination(props: BrandPaginationProps) {
  return <RegistryPagination {...props} ariaLabel="Paginação das marcas" />;
}
