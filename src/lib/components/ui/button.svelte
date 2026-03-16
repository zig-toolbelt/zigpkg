<script lang="ts" module>
  export { buttonVariants } from "./button-variants";
  export type { ButtonVariant as Variant, ButtonSize as Size } from "./button-variants";
</script>

<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { cn } from "$lib/utils/cn";
  import { buttonVariants } from "./button-variants";
  import type { ButtonVariant as Variant, ButtonSize as Size } from "./button-variants";

  interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    size?: Size;
  }

  let {
    class: className,
    variant = "default",
    size = "default",
    children,
    ...rest
  }: Props = $props();
</script>

<button class={cn(buttonVariants({ variant, size }), className)} {...rest}>
  {@render children?.()}
</button>
