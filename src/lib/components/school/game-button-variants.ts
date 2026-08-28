import { tv, type VariantProps } from "tailwind-variants";

export const gameButtonVariants = tv({
  base: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-bold tracking-wide transition-all active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
  variants: {
    variant: {
      primary:
        "bg-zig-400 text-slate-900 shadow-[0_3px_0_0_var(--color-zig-600)] hover:bg-zig-300",
      success:
        "bg-emerald-500 text-white shadow-[0_3px_0_0_var(--color-emerald-700)] hover:bg-emerald-400",
      danger: "bg-red-500 text-white shadow-[0_3px_0_0_var(--color-red-700)] hover:bg-red-400",
      neutral:
        "border border-slate-200 bg-white text-slate-700 shadow-[0_3px_0_0_var(--color-slate-200)] hover:bg-slate-50",
      ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    },
    size: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-sm uppercase",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export type GameButtonVariant = VariantProps<typeof gameButtonVariants>["variant"];
export type GameButtonSize = VariantProps<typeof gameButtonVariants>["size"];
