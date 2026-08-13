import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Helper function to format date
function formatDate(dateString: string): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

interface ProductMetadataCardProps {
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string | null;
  slug: string | null;
}

export function ProductMetadataCard({
  metaTitle,
  metaDescription,
  createdAt,
  updatedAt,
  slug,
}: ProductMetadataCardProps) {
  return (
    <>
      {/* Card 1 - Metadados SEO */}
      <Card>
        <CardHeader>
          <CardTitle>Metadados SEO</CardTitle>
          <CardDescription>
            Informações de otimização para mecanismos de busca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b">
              <span className="font-medium text-left">Meta Title:</span>
              <span className="text-sm text-left">{metaTitle || "—"}</span>
            </div>

            <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b">
              <span className="font-medium text-left">Meta Description:</span>
              <span className="text-sm text-left">
                {metaDescription || "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2 - Informações de Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Diversas</CardTitle>
          <CardDescription>
            Dados de registro e atualização do produto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b">
              <span className="font-medium text-left">Data de Criação:</span>
              <span className="text-left">{formatDate(createdAt)}</span>
            </div>

            <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b">
              <span className="font-medium text-left">Última Atualização:</span>
              <span className="text-left">
                {formatDate(updatedAt || createdAt)}
              </span>
            </div>

            {slug && (
              <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b">
                <span className="font-medium text-left">Slug:</span>
                <span className="font-mono text-sm text-left">{slug}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
