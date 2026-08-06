import { RegistryDetailLoading } from "@/components/registry";

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
