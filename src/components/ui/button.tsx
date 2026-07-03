import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-sans text-sm font-semibold outline-none shadow-sm transition-all duration-200 ease-[ease] focus-visible:ring-2 focus-visible:ring-[#6878E8] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:shadow-sm disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-[#6878E8] text-white hover:bg-[#5B6CE0] hover:shadow-md active:bg-[#4F46D8]",
        secondary: "border border-[#E5E7EB] bg-white text-gray-700 hover:bg-[#F8FAFC] hover:shadow-md active:bg-slate-100",
        outline: "border border-[#E5E7EB] bg-white text-gray-700 hover:bg-[#F8FAFC] hover:shadow-md active:bg-slate-100",
        ghost: "bg-transparent text-gray-700 shadow-none hover:bg-[#F8FAFC] hover:shadow-sm active:bg-slate-100",
        danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-md active:bg-red-800",
        success: "bg-green-600 text-white hover:bg-green-700 hover:shadow-md active:bg-green-800",
      },
      size: {
        sm: "h-11 px-6",
        md: "h-11 px-6",
        lg: "h-11 px-6",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, disabled, loading = false, loadingText, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    return (
      <Comp
        aria-busy={loading || undefined}
        aria-disabled={asChild && isDisabled ? true : undefined}
        className={cn(buttonVariants({ variant, size, className }))}
        data-loading={loading || undefined}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {loading && loadingText ? loadingText : children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
