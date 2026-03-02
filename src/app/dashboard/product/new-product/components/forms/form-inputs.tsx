"use client";

/**
 * Componentes de input que usam useFormStatus para estado de loading
 */

import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Input que se desabilita automaticamente durante submit
export function FormInput(props: ComponentProps<typeof Input>) {
  const { pending } = useFormStatus();

  return <Input {...props} disabled={pending || props.disabled} />;
}

// Textarea que se desabilita automaticamente durante submit
export function FormTextarea(props: ComponentProps<typeof Textarea>) {
  const { pending } = useFormStatus();

  return <Textarea {...props} disabled={pending || props.disabled} />;
}

// Button que se desabilita automaticamente durante submit
export function FormButton(props: ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      disabled={pending || props.disabled}
      aria-disabled={pending}
    />
  );
}

// Input para valores monetários no padrão brasileiro (vírgula como separador decimal)
interface FormCurrencyInputProps
  extends Omit<ComponentProps<typeof Input>, "type" | "onChange"> {
  maxDecimals?: number;
  maxValue?: number;
}

export function FormCurrencyInput({
  maxDecimals = 4,
  maxValue = 2000000,
  defaultValue = "0",
  ...props
}: FormCurrencyInputProps) {
  const { pending } = useFormStatus();
  const [displayValue, setDisplayValue] = useState<string>("");
  const [realValue, setRealValue] = useState<string>("");

  // Initialize display value from defaultValue
  useEffect(() => {
    if (defaultValue) {
      const numValue =
        typeof defaultValue === "string" ? defaultValue : String(defaultValue);
      // Convert dot to comma for display
      setDisplayValue(numValue.replace(".", ","));
      setRealValue(numValue);
    }
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Allow only numbers, comma, and one comma
    value = value.replace(/[^0-9,]/g, "");

    // Ensure only one comma
    const commaCount = (value.match(/,/g) || []).length;
    if (commaCount > 1) {
      const parts = value.split(",");
      value = `${parts[0]},${parts.slice(1).join("")}`;
    }

    // Limit decimal places
    if (value.includes(",")) {
      const [integerPart, decimalPart] = value.split(",");
      if (decimalPart && decimalPart.length > maxDecimals) {
        value = `${integerPart},${decimalPart.slice(0, maxDecimals)}`;
      }
    }

    // Convert to number for validation (comma to dot)
    const numValue = parseFloat(value.replace(",", "."));

    // Check max value
    if (!Number.isNaN(numValue) && numValue > maxValue) {
      return; // Don't update if exceeds max
    }

    setDisplayValue(value);
    // Store real value with dot for form submission
    setRealValue(value.replace(",", "."));
  };

  return (
    <>
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        disabled={pending || props.disabled}
      />
      {/* Hidden input with real value (dot as decimal separator) for form submission */}
      <input type="hidden" name={props.name} value={realValue} />
    </>
  );
}

// Input para números inteiros positivos (sem aceitar sinais negativos ou decimais)
interface FormIntegerInputProps
  extends Omit<ComponentProps<typeof Input>, "type" | "onChange"> {
  maxValue?: number;
}

export function FormIntegerInput({
  maxValue = 1000000,
  defaultValue = "0",
  ...props
}: FormIntegerInputProps) {
  const { pending } = useFormStatus();
  const [value, setValue] = useState<string>("");

  // Initialize value from defaultValue
  useEffect(() => {
    if (defaultValue) {
      const strValue =
        typeof defaultValue === "string" ? defaultValue : String(defaultValue);
      setValue(strValue);
    }
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Allow only numbers (remove any non-numeric characters including signs)
    newValue = newValue.replace(/[^0-9]/g, "");

    // Remove leading zeros but keep single zero
    if (newValue.length > 1 && newValue.startsWith("0")) {
      newValue = newValue.replace(/^0+/, "");
    }

    // Convert to number for validation
    const numValue = parseInt(newValue, 10);

    // Check max value
    if (!Number.isNaN(numValue) && numValue > maxValue) {
      return; // Don't update if exceeds max
    }

    // Allow empty string
    setValue(newValue === "" ? "0" : newValue);
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      disabled={pending || props.disabled}
    />
  );
}

// Input para números inteiros positivos maiores que zero (não aceita zero nem negativos)
interface FormPositiveIntegerInputProps
  extends Omit<ComponentProps<typeof Input>, "type" | "onChange"> {
  maxValue?: number;
}

export function FormPositiveIntegerInput({
  maxValue = 1000000,
  defaultValue = "1",
  ...props
}: FormPositiveIntegerInputProps) {
  const { pending } = useFormStatus();
  const [value, setValue] = useState<string>("");

  // Initialize value from defaultValue
  useEffect(() => {
    if (defaultValue) {
      const strValue =
        typeof defaultValue === "string" ? defaultValue : String(defaultValue);
      setValue(strValue);
    }
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Allow only numbers (remove any non-numeric characters including signs)
    newValue = newValue.replace(/[^0-9]/g, "");

    // Remove leading zeros
    if (newValue.length > 1 && newValue.startsWith("0")) {
      newValue = newValue.replace(/^0+/, "");
    }

    // Don't allow zero
    if (newValue === "0" || newValue === "") {
      setValue("1");
      return;
    }

    // Convert to number for validation
    const numValue = parseInt(newValue, 10);

    // Check max value
    if (!Number.isNaN(numValue) && numValue > maxValue) {
      return; // Don't update if exceeds max
    }

    setValue(newValue);
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      disabled={pending || props.disabled}
    />
  );
}
