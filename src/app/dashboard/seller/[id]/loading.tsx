import { RegistryDetailLoading } from "@/app/dashboard/_components/detail-page";

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
