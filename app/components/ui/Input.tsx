import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  className?: string;
}

export default function Input({ label, name, type = "text", className, ...props }: InputProps) {
  return (
    <div className="flex w-full flex-col space-y-2">
      <label htmlFor={name} className="text-foreground text-md">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={cn(
          "border-border-header bg-background-header placeholder-foreground/50 text-foreground invalid:text-foreground/50 w-full rounded-lg border-2 p-4 focus:border-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-hidden",
          className,
        )}
        {...props}
      />
    </div>
  );
}
