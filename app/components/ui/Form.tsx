import { cn } from "@/lib/utils/cn";

export default function Form({
  action,
  children,
  className,
}: {
  action: (formData: FormData) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      className={cn(
        "border-border-header bg-background-header flex w-full max-w-2xl flex-col gap-3 rounded-2xl border-4 p-8 shadow-xl",
        className,
      )}
    >
      {children}
    </form>
  );
}
