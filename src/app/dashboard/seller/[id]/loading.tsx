import { RegistryDetailLoading } from "@/components/registry";

export default function SellerDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes do vendedor"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Vendedores", isActive: true },
      ]}
      variant="seller"
    />
  );
}
