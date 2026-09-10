"use client";

import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
