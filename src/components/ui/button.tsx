import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "quiet" | "nav";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground ring-1 ring-primary/40 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
  quiet:
    "bg-surface-subtle text-muted-foreground ring-1 ring-border hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  nav: "text-muted-foreground hover:bg-surface-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
};

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-9 items-center justify-center rounded-lg px-3 font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  );
}