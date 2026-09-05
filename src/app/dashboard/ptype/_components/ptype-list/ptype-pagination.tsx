import { RegistryPagination } from "@/app/dashboard/_components/registry";

interface PtypePaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
}

export function PtypePagination(props: PtypePaginationProps) {
  return (
    <RegistryPagination
      {...props}
      ariaLabel="Paginação dos tipos de produtos"
    />
  );
}
