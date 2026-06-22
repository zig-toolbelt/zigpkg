<script lang="ts">
  import { Activity } from "lucide-svelte";

  let { daysSinceCommit }: { daysSinceCommit: number } = $props();

  const activity = $derived.by(() => {
    switch (true) {
      case daysSinceCommit < 30:
        return {
          label: "Active",
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        };
      case daysSinceCommit < 180:
        return {
          label: "Moderate",
          color: "text-zig-500",
          bg: "bg-zig-50",
        };
      default:
        return {
          label: "Inactive",
          color: "text-slate-400",
          bg: "bg-slate-50",
        };
    }
  });
</script>

<div
  class="flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide {activity.bg} {activity.color}"
>
  <Activity class="h-3 w-3" />
  <span>{activity.label}</span>
</div>
