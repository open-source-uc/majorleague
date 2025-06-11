import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  className?: string;
}

export default function Input({ label, name, type = "text", className, ...props }: InputProps) {
  return (
    <div className="flex w-full flex-col space-y-2">
      <label htmlFor={name} className="text-lg font-semibold text-white">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={cn(
          "w-full rounded-lg border-2 border-gray-600 bg-gray-700 p-4 text-white focus:border-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-hidden",
          className,
        )}
        {...props}
      />
    </div>
  );
}
