/**
 * button.jsx — plain-Tailwind port of the shadcn/ui Button (no Radix).
 *
 * `cn` here joins rather than merges (see ../lib/utils), so base classes are
 * kept minimal and the caller's `className` is appended last.
 */
import { forwardRef } from "react";
import { cn } from "../lib/utils";

const VARIANTS = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  outline: "border border-border bg-transparent hover:bg-muted hover:text-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-muted hover:text-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const SIZES = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-8",
  icon: "h-10 w-10",
};

export const Button = forwardRef(function Button(
  { className, variant = "default", size = "default", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant] ?? VARIANTS.default,
        SIZES[size] ?? SIZES.default,
        className,
      )}
      {...props}
    />
  );
});

export default Button;
