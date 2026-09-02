import { RegistryDetailLoading } from "@/components/registry";

export default function EntryDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes da entrada"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Entradas", isActive: true },
      ]}
      variant="extended"
    />
  );
}
