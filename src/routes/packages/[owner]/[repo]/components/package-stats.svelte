<script lang="ts">
  import { Star } from "lucide-svelte";
  let {
    stars,
    forks,
    openIssues,
  }: { stars: number; forks: number; openIssues: number } = $props();
</script>

<div class="bg-white border border-gray-200 rounded-sm p-5">
  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
    Stats
  </h3>
  <div class="space-y-3.5">
    <div class="flex items-center justify-between">
      <span class="text-sm text-slate-500">Stars</span>
      <div class="flex items-center gap-1.5">
        <Star class="w-4 h-4 text-yellow-400" fill="currentColor" />
        <span class="text-sm font-bold text-slate-900"
          >{stars.toLocaleString()}</span
        >
      </div>
    </div>
    <div
      class="border-t border-gray-100 pt-3 flex items-center justify-between"
    >
      <span class="text-sm text-slate-500">Forks</span>
      <span class="text-sm font-bold text-slate-900"
        >{forks.toLocaleString()}</span
      >
    </div>
    <div
      class="border-t border-gray-100 pt-3 flex items-center justify-between"
    >
      <span class="text-sm text-slate-500">Open Issues</span>
      <span class="text-sm font-bold text-slate-900"
        >{openIssues.toLocaleString()}</span
      >
    </div>
  </div>
</div>
