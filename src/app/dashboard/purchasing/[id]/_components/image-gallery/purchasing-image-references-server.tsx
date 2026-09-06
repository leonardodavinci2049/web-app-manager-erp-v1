import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPurchasingGalleryInitialState } from "./purchasing-image-gallery-server";

export async function PurchasingImageReferencesServer({
  productId,
  currentImagePath,
}: {
  productId: number;
  currentImagePath?: string;
}) {
  const gallery = await getPurchasingGalleryInitialState(productId);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Referências das imagens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium">
            PATH_IMAGEM atual
          </p>
          <p className="break-all">
            {currentImagePath?.trim() || "Não informado"}
          </p>
        </div>
        {gallery.status === "ready" ? (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">
              URLs originais da galeria
            </p>
            <ol className="space-y-2">
              {gallery.images.map((image, index) => (
                <li key={image.id} className="rounded-md border p-2">
                  <span className="font-medium">
                    Imagem {index + 1}
                    {image.isPrimary ? " (principal)" : ""}
                  </span>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {image.urls.original}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="text-muted-foreground">
            {gallery.status === "error"
              ? gallery.error
              : "A galeria ainda não possui imagens."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
