import { RegistryDetailLoading } from "@/components/registry";

export default function BrandDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes da marca"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Marcas", isActive: true },
      ]}
      variant="brand"
    />
  );
}
