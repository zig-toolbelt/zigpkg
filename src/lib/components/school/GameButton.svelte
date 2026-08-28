<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  import { sound } from "$lib/school/sound";
  import { cn } from "$lib/utils/cn";

  import {
    gameButtonVariants,
    type GameButtonSize,
    type GameButtonVariant,
  } from "./game-button-variants";

  interface Props extends HTMLButtonAttributes {
    variant?: GameButtonVariant;
    size?: GameButtonSize;
  }

  let {
    class: className,
    variant = "primary",
    size = "md",
    onclick,
    children,
    ...rest
  }: Props = $props();

  const handleClick: HTMLButtonAttributes["onclick"] = (event) => {
    sound.tap();
    onclick?.(event);
  };
</script>

<button
  {...rest}
  type="button"
  class={cn(gameButtonVariants({ variant, size }), className)}
  onclick={handleClick}
>
  {@render children?.()}
</button>
