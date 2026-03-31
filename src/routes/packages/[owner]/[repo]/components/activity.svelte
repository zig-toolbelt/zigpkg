<script lang="ts">
  import { Activity } from "lucide-svelte";

  let { daysSinceCommit } = $props();

  const activity = $derived.by(() => {
    switch (true) {
      case daysSinceCommit < 30:
        return {
          label: "Active",
          color: "text-emerald-500",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          pulse: true,
        };
      case daysSinceCommit < 180:
        return {
          label: "Moderate",
          color: "text-amber-500",
          bg: "bg-amber-50",
          border: "border-amber-200",
          pulse: false,
        };
      default:
        return {
          label: "Inactive",
          color: "text-slate-400",
          bg: "bg-slate-50",
          border: "border-slate-200",
          pulse: false,
        };
    }
  });
</script>

<div
  class="text-xs font-medium px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200
  {activity.color} {activity.pulse ? 'animate-pulse' : ''}
  "
>
  <Activity class="w-4 h-4" />
</div>
