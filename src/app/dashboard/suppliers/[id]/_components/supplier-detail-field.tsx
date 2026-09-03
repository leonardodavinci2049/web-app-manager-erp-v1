interface SupplierDetailFieldProps {
  label: string;
  value?: string | number;
}

export function SupplierDetailField({
  label,
  value,
}: SupplierDetailFieldProps) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium">
        {value === undefined || value === "" ? "Não informado" : value}
      </dd>
    </div>
  );
}
