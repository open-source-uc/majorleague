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
    <form action={action} className={cn("flex w-full max-w-2xl flex-col gap-3 p-8 md:rounded-2xl", className)}>
      {children}
    </form>
  );
}
