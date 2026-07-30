import { RegistryPagination } from "@/components/registry";

interface CustomerPaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
}

export function CustomerPagination(props: CustomerPaginationProps) {
  return <RegistryPagination {...props} ariaLabel="Paginação dos clientes" />;
}
