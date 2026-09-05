import { RegistryPagination } from "@/app/dashboard/_components/registry";

interface CarrierPaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
}

export function CarrierPagination(props: CarrierPaginationProps) {
  return (
    <RegistryPagination {...props} ariaLabel="Paginação das transportadoras" />
  );
}
