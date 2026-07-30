import { RegistryPagination } from "@/components/registry";

interface SupplierPaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
}

export function SupplierPagination(props: SupplierPaginationProps) {
  return (
    <RegistryPagination {...props} ariaLabel="Paginação dos fornecedores" />
  );
}
