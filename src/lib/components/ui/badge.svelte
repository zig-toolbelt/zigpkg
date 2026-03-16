<script lang="ts" module>
  export { badgeVariants } from "./badge-variants";
  export type { BadgeVariant as Variant } from "./badge-variants";
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils/cn";
  import type { Snippet } from "svelte";
  import { badgeVariants } from "./badge-variants";
  import type { BadgeVariant as Variant } from "./badge-variants";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    variant?: Variant;
    class?: string;
    children?: Snippet;
  }

  let {
    class: className,
    variant = "default",
    children,
    ...rest
  }: Props = $props();
</script>

<div class={cn(badgeVariants({ variant }), className)} {...rest}>
  {@render children?.()}
</div>
