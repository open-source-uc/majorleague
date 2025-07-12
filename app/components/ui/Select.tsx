import { cn } from "@/lib/utils/cn";

interface SelectProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
  className?: string;
}

export default function Select({
  label,
  name,
  options,
  defaultValue = "",
  required = false,
  className = "",
}: SelectProps) {
  return (
    <div className={`flex w-full flex-col space-y-2 ${className}`}>
      <label htmlFor={name} className="text-foreground text-md">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="border-border-header bg-background-header text-foreground w-full rounded-lg border-2 p-4 focus:border-primary focus:ring-2 focus:ring-primary focus:outline-hidden"
      >
        <option value="">Seleccionar...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
