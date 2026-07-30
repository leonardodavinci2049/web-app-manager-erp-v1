"use client";

import { Loader2, UserPlus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { createCustomerAction } from "@/app/dashboard/customer/_actions/customer-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { CustomerCreateValues } from "./types/customer-dashboard-types";

const EMPTY_VALUES: CustomerCreateValues = {
  name: "",
  email: "",
  personTypeId: 1,
  cnpj: "",
  companyName: "",
  cpf: "",
  phone: "",
  whatsapp: "",
  image: "",
  zipCode: "",
  address: "",
  addressNumber: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  notes: "",
};

interface CustomerCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customerId: number) => void;
}

export function CustomerCreateSheet({
  open,
  onOpenChange,
  onCreated,
}: CustomerCreateSheetProps) {
  const [values, setValues] = useState<CustomerCreateValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <Key extends keyof CustomerCreateValues>(
    field: Key,
    value: CustomerCreateValues[Key],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      const result = await createCustomerAction(values);
      if (!result.success || !result.customerId) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setValues(EMPTY_VALUES);
      onOpenChange(false);
      onCreated(result.customerId);
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (field: keyof CustomerCreateValues) => errors[field]?.[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[94vw] max-w-[94vw] flex-col gap-0 p-0 sm:w-full sm:max-w-xl"
      >
        <SheetHeader className="border-b p-4 pr-12 sm:p-6">
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Adicionar cliente
          </SheetTitle>
        </SheetHeader>
        <form
          id="customer-create-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1"
        >
          <Tabs defaultValue="identification" className="h-full gap-0">
            <div className="border-b px-4 py-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="identification">Identificação</TabsTrigger>
                <TabsTrigger value="address">Endereço</TabsTrigger>
              </TabsList>
            </div>
            <div className="h-[calc(100%-3.5rem)] overflow-y-auto p-4 sm:p-6">
              <TabsContent value="identification" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="customer-create-name">Nome *</Label>
                    <Input
                      id="customer-create-name"
                      value={values.name}
                      maxLength={255}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(fieldError("name"))}
                      onChange={(event) => setField("name", event.target.value)}
                    />
                    {fieldError("name") && (
                      <p className="text-destructive text-xs">
                        {fieldError("name")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-create-email">E-mail *</Label>
                    <Input
                      id="customer-create-email"
                      type="email"
                      value={values.email}
                      maxLength={255}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(fieldError("email"))}
                      onChange={(event) =>
                        setField("email", event.target.value)
                      }
                    />
                    {fieldError("email") && (
                      <p className="text-destructive text-xs">
                        {fieldError("email")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-create-person-type">
                      Tipo de pessoa *
                    </Label>
                    <select
                      id="customer-create-person-type"
                      value={values.personTypeId}
                      disabled={isSubmitting}
                      className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs"
                      onChange={(event) =>
                        setField("personTypeId", Number(event.target.value))
                      }
                    >
                      <option value={1}>Pessoa física</option>
                      <option value={2}>Pessoa jurídica</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-create-phone">Telefone</Label>
                    <Input
                      id="customer-create-phone"
                      value={values.phone}
                      maxLength={100}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setField("phone", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-create-whatsapp">WhatsApp</Label>
                    <Input
                      id="customer-create-whatsapp"
                      value={values.whatsapp}
                      maxLength={100}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setField("whatsapp", event.target.value)
                      }
                    />
                  </div>
                  {values.personTypeId === 1 ? (
                    <div className="space-y-1">
                      <Label htmlFor="customer-create-cpf">CPF</Label>
                      <Input
                        id="customer-create-cpf"
                        value={values.cpf}
                        maxLength={100}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          setField("cpf", event.target.value)
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="customer-create-cnpj">CNPJ</Label>
                        <Input
                          id="customer-create-cnpj"
                          value={values.cnpj}
                          maxLength={100}
                          disabled={isSubmitting}
                          onChange={(event) =>
                            setField("cnpj", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="customer-create-company">
                          Razão social
                        </Label>
                        <Input
                          id="customer-create-company"
                          value={values.companyName}
                          maxLength={255}
                          disabled={isSubmitting}
                          onChange={(event) =>
                            setField("companyName", event.target.value)
                          }
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="customer-create-image">
                      Caminho da imagem
                    </Label>
                    <Input
                      id="customer-create-image"
                      value={values.image}
                      maxLength={500}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setField("image", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="customer-create-notes">Observações</Label>
                    <Textarea
                      id="customer-create-notes"
                      value={values.notes}
                      maxLength={2000}
                      rows={5}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setField("notes", event.target.value)
                      }
                    />
                    <p className="text-muted-foreground text-right text-xs">
                      {values.notes.length}/2000
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="customer-create-zip">CEP</Label>
                    <Input
                      id="customer-create-zip"
                      value={values.zipCode}
                      maxLength={100}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setField("zipCode", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-create-state">UF</Label>
                    <Input
                      id="customer-create-state"
                      value={values.state}
                      maxLength={2}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setField(
                          "state",
                          event.target.value.toLocaleUpperCase("pt-BR"),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="customer-create-address">Endereço</Label>
                    <Input
                      id="customer-create-address"
                      value={values.address}
                      maxLength={300}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setField("address", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-create-number">Número</Label>
                    <Input
                      id="customer-create-number"
                      value={values.addressNumber}
                      maxLength={100}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setField("addressNumber", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-create-complement">
                      Complemento
                    </Label>
                    <Input
                      id="customer-create-complement"
                      value={values.complement}
                      maxLength={100}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setField("complement", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-create-neighborhood">Bairro</Label>
                    <Input
                      id="customer-create-neighborhood"
                      value={values.neighborhood}
                      maxLength={300}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setField("neighborhood", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-create-city">Cidade</Label>
                    <Input
                      id="customer-create-city"
                      value={values.city}
                      maxLength={300}
                      disabled={isSubmitting}
                      onChange={(event) => setField("city", event.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </form>
        <SheetFooter className="bg-background/95 border-t sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="customer-create-form"
            disabled={
              isSubmitting ||
              values.name.trim() === "" ||
              values.email.trim() === ""
            }
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Salvando..." : "Criar cliente"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
