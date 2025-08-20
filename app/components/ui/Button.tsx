import Link from "next/link";
import { forwardRef, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  "aria-label"?: string;
  role?: string;
}

interface ButtonAsButton extends BaseButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  href?: never;
}

interface ButtonAsLink extends BaseButtonProps {
  href: string;
  type?: never;
  onClick?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary",
  outline: "border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent",
  ghost: "text-primary hover:bg-accent hover:text-accent-foreground border-transparent",
  destructive: "bg-destructive text-primary-foreground hover:bg-destructive/90 border-destructive",
};

const buttonSizes = {
  sm: "h-8 px-3 text-sm rounded-xs",
  md: "h-10 px-4 py-2 text-md rounded-sm",
  lg: "h-12 px-6 py-3 text-lg rounded-sm",
};

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ children, className, variant = "primary", size = "md", disabled = false, ...props }, ref) => {
    const baseClasses = cn(
      // Base styles
      "inline-flex items-center justify-center font-bold tracking-normal",
      "border-2 border-solid",
      "transition-all duration-200 ease-in-out",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
      // Variant styles
      buttonVariants[variant],
      // Size styles
      buttonSizes[size],
      className
    );

    if (props.href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={props.href}
          className={baseClasses}
          aria-label={props["aria-label"]}
          role={props.role}
          tabIndex={disabled ? -1 : undefined}
          aria-disabled={disabled}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={props.type || "button"}
        onClick={props.onClick}
        disabled={disabled}
        className={baseClasses}
        aria-label={props["aria-label"]}
        role={props.role}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
export type { ButtonProps, ButtonVariant, ButtonSize };
