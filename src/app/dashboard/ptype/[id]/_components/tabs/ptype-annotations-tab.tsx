import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PtypeAnnotationsTabProps {
  notes?: string;
}

export function PtypeAnnotationsTab({ notes }: PtypeAnnotationsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anotações</CardTitle>
      </CardHeader>
      <CardContent>
        {notes ? (
          <p className="whitespace-pre-wrap break-words text-sm">{notes}</p>
        ) : (
          <p className="text-muted-foreground text-sm italic">
            Nenhuma anotação informada.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
