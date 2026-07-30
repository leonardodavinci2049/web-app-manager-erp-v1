import { RegistryPagination } from "@/components/registry";

interface SellerPaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
}

export function SellerPagination(props: SellerPaginationProps) {
  return <RegistryPagination {...props} ariaLabel="Paginação dos vendedores" />;
}
