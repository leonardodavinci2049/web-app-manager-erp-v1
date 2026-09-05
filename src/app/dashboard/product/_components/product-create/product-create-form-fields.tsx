"use client";

import { Check, ChevronsUpDown, Loader2, Plus, Search, X } from "lucide-react";
import type { ComponentProps, FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ProductCreateFormInput(props: ComponentProps<typeof Input>) {
  return <Input {...props} />;
}

export function ProductCreateFormTextarea(
  props: ComponentProps<typeof Textarea>,
) {
  return <Textarea {...props} />;
}

interface ProductCreateCurrencyInputProps
  extends Omit<
    ComponentProps<typeof Input>,
    "defaultValue" | "name" | "onChange" | "type" | "value"
  > {
  name: string;
  defaultValue?: string;
  maxDecimals?: number;
  maxValue?: number;
}

export function ProductCreateCurrencyInput({
  name,
  defaultValue = "0",
  maxDecimals = 4,
  maxValue = 2000000,
  ...props
}: ProductCreateCurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(
    defaultValue.replace(".", ","),
  );

  const normalizedValue = displayValue.replace(",", ".");

  return (
    <>
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={(event) => {
          let nextValue = event.target.value.replace(/[^0-9,]/g, "");
          const [integerPart = "", ...decimalParts] = nextValue.split(",");

          if (decimalParts.length > 0) {
            nextValue = `${integerPart},${decimalParts
              .join("")
              .slice(0, maxDecimals)}`;
          }

          const numericValue = Number(nextValue.replace(",", "."));
          if (
            nextValue !== "" &&
            Number.isFinite(numericValue) &&
            numericValue > maxValue
          ) {
            return;
          }

          setDisplayValue(nextValue);
        }}
      />
      <input type="hidden" name={name} value={normalizedValue} />
    </>
  );
}

interface ProductCreateIntegerInputProps
  extends Omit<
    ComponentProps<typeof Input>,
    "defaultValue" | "onChange" | "type" | "value"
  > {
  defaultValue?: string;
  maxValue?: number;
}

export function ProductCreateIntegerInput({
  defaultValue = "0",
  maxValue = 1000000,
  ...props
}: ProductCreateIntegerInputProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={(event) => {
        const nextValue = event.target.value.replace(/\D/g, "");
        const numericValue = Number(nextValue);

        if (
          nextValue !== "" &&
          Number.isFinite(numericValue) &&
          numericValue > maxValue
        ) {
          return;
        }

        setValue(nextValue);
      }}
    />
  );
}

interface ProductCreateSelectOption {
  value: string;
  label: string;
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

interface ProductCreateFormSelectProps {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  options: ProductCreateSelectOption[];
  ariaLabel: string;
  ariaInvalid?: boolean;
  disabled?: boolean;
  onValueChange: (value: string) => void;
}

export function ProductCreateFormSelect({
  id,
  name,
  value,
  placeholder,
  options,
  ariaLabel,
  ariaInvalid,
  disabled,
  onValueChange,
}: ProductCreateFormSelectProps) {
  return (
    <>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || options.length === 0}
      >
        <SelectTrigger
          id={id}
          className="w-full"
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={value} />
    </>
  );
}

interface ProductCreateSearchableSelectProps {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  options: ProductCreateSelectOption[];
  ariaLabel: string;
  disabled?: boolean;
  createLabel?: string;
  createDialogTitle?: string;
  createDialogDescription?: string;
  createSubmitLabel?: string;
  onCreate?: (name: string) => Promise<boolean>;
  onValueChange: (value: string) => void;
}

export function ProductCreateSearchableSelect({
  id,
  name,
  value,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  options,
  ariaLabel,
  disabled,
  createLabel,
  createDialogTitle,
  createDialogDescription,
  createSubmitLabel,
  onCreate,
  onValueChange,
}: ProductCreateSearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const normalizedSearch = normalizeSearch(search.trim());
  const filteredOptions = normalizedSearch
    ? options.filter((option) =>
        normalizeSearch(option.label).includes(normalizedSearch),
      )
    : options;
  const canCreate = Boolean(
    onCreate &&
      createLabel &&
      createDialogTitle &&
      createDialogDescription &&
      createSubmitLabel,
  );
  const isDisabled = disabled || (options.length === 0 && !canCreate);

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!onCreate || createName.trim().length < 2) return;

    setIsCreating(true);
    try {
      const wasCreated = await onCreate(createName.trim());
      if (wasCreated) {
        setCreateDialogOpen(false);
        setCreateName("");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-label={ariaLabel}
            aria-expanded={open}
            disabled={isDisabled}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">
              {selectedOption?.label ?? placeholder}
            </span>
            <ChevronsUpDown
              className="ml-2 size-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-1"
        >
          <div className="relative border-b p-1">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="border-0 pl-8 shadow-none focus-visible:ring-0"
            />
          </div>
          <div
            className="max-h-56 overflow-y-auto p-1"
            role="listbox"
            aria-label={ariaLabel}
          >
            {value !== "0" && (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground w-full justify-start"
                onClick={() => {
                  onValueChange("0");
                  setOpen(false);
                }}
              >
                <X className="size-4" aria-hidden="true" />
                Limpar seleção
              </Button>
            )}
            {filteredOptions.length === 0 ? (
              <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                {emptyMessage}
              </p>
            ) : (
              filteredOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="ghost"
                  role="option"
                  aria-selected={option.value === value}
                  className="w-full justify-start"
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={
                      option.value === value ? "size-4" : "size-4 opacity-0"
                    }
                    aria-hidden="true"
                  />
                  <span className="truncate">{option.label}</span>
                </Button>
              ))
            )}
            {canCreate && (
              <Button
                type="button"
                variant="ghost"
                role="option"
                aria-label={createLabel}
                className="text-primary mt-1 w-full justify-start border-t pt-2"
                onClick={() => {
                  setCreateName(search.trim());
                  setOpen(false);
                  setCreateDialogOpen(true);
                }}
              >
                <Plus className="size-4" aria-hidden="true" />
                {createLabel}
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <input type="hidden" name={name} value={value} />

      {canCreate && (
        <Dialog
          open={createDialogOpen}
          onOpenChange={(nextOpen) => {
            if (isCreating) return;
            setCreateDialogOpen(nextOpen);
            if (!nextOpen) setCreateName("");
          }}
        >
          <DialogContent>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>{createDialogTitle}</DialogTitle>
                <DialogDescription>{createDialogDescription}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor={`${id}-new-category-name`}>Nome</Label>
                <Input
                  id={`${id}-new-category-name`}
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  autoComplete="off"
                  autoFocus
                  disabled={isCreating}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isCreating}
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || createName.trim().length < 2}
                >
                  {isCreating ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                      Criando...
                    </>
                  ) : (
                    createSubmitLabel
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

interface ProductCreateSubmitButtonProps
  extends Omit<ComponentProps<typeof Button>, "type"> {
  pending: boolean;
  pendingText: string;
}

export function ProductCreateSubmitButton({
  children,
  pending,
  pendingText,
  ...props
}: ProductCreateSubmitButtonProps) {
  return (
    <Button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      aria-disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
