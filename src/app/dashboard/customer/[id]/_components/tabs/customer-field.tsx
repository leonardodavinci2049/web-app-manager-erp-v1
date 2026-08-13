import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerFieldProps {
  disabled?: boolean;
  error?: string[];
  id: string;
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}

export function CustomerField({
  disabled = false,
  error,
  id,
  label,
  maxLength,
  onChange,
  required = false,
  type,
  value,
}: CustomerFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error?.[0])}
        onChange={(event) => onChange(event.target.value)}
      />
      {error?.[0] && <p className="text-destructive text-xs">{error[0]}</p>}
    </div>
  );
}
