import { RegistryPagination } from "@/components/registry";

interface EntryPaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
  paramName?: string;
}

export function EntryPagination(props: EntryPaginationProps) {
  return <RegistryPagination {...props} ariaLabel="Paginação das entradas" />;
}
