import { RegistryDetailLoading } from "@/app/dashboard/_components/detail-page";

export default function PtypeDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes do tipo de produto"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Tipos de produtos", isActive: true },
      ]}
      variant="ptype"
    />
  );
}
