import { tv, type VariantProps } from "tailwind-variants";

export const badgeVariants = tv({
  base: "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  variants: {
    variant: {
      default:
        "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
      outline: "text-foreground",
      zig: "rounded-full border-zig-200 bg-zig-50 font-mono text-[11px] text-zig-800",
      topic: "rounded-full border-transparent bg-slate-100 px-2 text-[11px] font-medium text-slate-500 hover:bg-zig-100 hover:text-zig-700",
      subtle: "rounded-full border-transparent bg-zig-100 text-zig-700",
      muted: "rounded-full border-transparent bg-gray-100 text-slate-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
