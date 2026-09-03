import { RegistryDetailLoading } from "@/app/dashboard/_components/detail-page";

export default function SupplierDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes do fornecedor"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Fornecedores", isActive: true },
      ]}
      variant="extended"
    />
  );
}
