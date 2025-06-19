"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils/cn";

interface ButtonSubmitProps {
  children: React.ReactNode;
  processing: React.ReactNode;
  className?: string;
}

export default function ButtonSubmit({ children, processing, className }: ButtonSubmitProps) {
  const status = useFormStatus();

  return (
    <button
      type="submit"
      disabled={status.pending}
      className={cn(
        `border-border-header text-background-header w-full rounded-lg p-4 text-lg font-bold ${status.pending ? "bg-primary-darken" : "bg-primary hover:bg-primary-darken"} focus:ring-2 focus:ring-gray-500 focus:outline-hidden`,
        className,
      )}
    >
      {status.pending ? processing : children}
    </button>
  );
}
