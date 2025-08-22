interface SelectProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

export default function Select({
  label,
  name,
  options,
  defaultValue = "",
  required = false,
  className = "",
  onChange,
}: SelectProps) {
  return (
    <div className={`flex w-full flex-col space-y-2 ${className}`}>
      <label htmlFor={name} className="text-foreground text-md">
        {label}
        {required ? <span className="text-primary ml-1">*</span> : null}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          defaultValue={defaultValue}
          required={required}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="border-border-header bg-background-header text-foreground focus:border-primary focus:ring-primary w-full appearance-none rounded-lg border-2 p-4 pr-10 focus:ring-2 focus:outline-hidden"
        >
          <option value="">Seleccionar...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="text-ml-grey pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">▼</span>
      </div>
    </div>
  );
}
