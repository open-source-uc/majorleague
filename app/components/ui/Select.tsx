import { cn } from "@/lib/utils/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}

export default function Select({ label, name, options, className, placeholder, ...props }: SelectProps) {
  return (
    <div className="flex w-full flex-col space-y-2">
      <label htmlFor={name} className="text-foreground text-lg">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={cn(
          "border-border-header bg-background-header text-foreground disabled:text-foreground/50 w-full rounded-lg border-2 p-4 focus:border-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-hidden",
          className,
        )}
        defaultValue={placeholder}
        {...props}
      >
        {/* TODO: Disabled color does not work */}
        {placeholder ? (
          <option value={placeholder} disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
