import type { ReactNode } from "react";

interface OrderDetailFieldProps {
  label: string;
  children?: ReactNode;
  className?: string;
}

export function OrderDetailField({
  label,
  children,
  className,
}: OrderDetailFieldProps) {
  const value =
    children === null || children === undefined || children === ""
      ? "Não informado"
      : children;

  return (
    <div className={`min-w-0 ${className ?? ""}`}>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium">
        {value}
      </dd>
    </div>
  );
}
