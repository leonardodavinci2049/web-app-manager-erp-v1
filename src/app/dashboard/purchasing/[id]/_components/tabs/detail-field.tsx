import type { ReactNode } from "react";

export function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const value =
    children === null || children === undefined || children === ""
      ? "—"
      : children;

  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-muted-foreground text-xs font-medium">{label}</dt>
      <dd className="break-words text-sm">{value}</dd>
    </div>
  );
}
