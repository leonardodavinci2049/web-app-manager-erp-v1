interface PageTitleSectionProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageTitleSection({
  title,
  subtitle,
  className = "space-y-2 pb-6",
}: PageTitleSectionProps) {
  return (
    <div className={className}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
