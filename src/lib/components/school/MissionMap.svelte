<script lang="ts">
  import { Check, Lock } from "lucide-svelte";

  import type { Level } from "$lib/school/types";
  import { cn } from "$lib/utils/cn";

  interface Props {
    levels: Level[];
    completed: number;
    class?: string;
  }

  let { levels, completed, class: className }: Props = $props();
</script>

<ol class={cn("grid gap-2 sm:grid-cols-2", className)}>
  {#each levels as level, index (level.id)}
    {@const done = index < completed}
    {@const current = index === completed}
    <li
      class={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
        done
          ? "border-emerald-200 bg-emerald-50"
          : current
            ? "border-zig-300 bg-zig-50"
            : "border-slate-200 bg-white",
      )}
    >
      <span
        class={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-sm font-black",
          done
            ? "bg-emerald-500 text-white"
            : current
              ? "school-ring bg-zig-400 text-slate-900"
              : "bg-slate-100 text-slate-400",
        )}
      >
        {#if done}
          <Check class="h-4 w-4" />
        {:else if current}
          {level.id}
        {:else}
          <Lock class="h-3.5 w-3.5" />
        {/if}
      </span>
      <span class="min-w-0">
        <span
          class={cn(
            "block truncate font-mono text-[10px] font-semibold uppercase tracking-wide",
            done ? "text-emerald-700" : current ? "text-zig-700" : "text-slate-400",
          )}
        >
          {level.codename}
        </span>
        <span class="block truncate text-sm font-semibold text-slate-800">{level.title}</span>
      </span>
      <span class="ml-auto shrink-0 font-mono text-[11px] text-slate-400">+{level.reward}</span>
    </li>
  {/each}
</ol>
