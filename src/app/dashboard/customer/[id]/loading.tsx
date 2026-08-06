import { RegistryDetailLoading } from "@/components/registry";

export default function CustomerDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes do cliente"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Clientes", isActive: true },
      ]}
      variant="customer"
    />
  );
}
