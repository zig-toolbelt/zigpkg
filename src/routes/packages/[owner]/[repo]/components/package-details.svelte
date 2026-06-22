<script lang="ts">
  import { formatDate } from "$lib/utils/formatDate.js";
  import DetailRow from "./detail-row.svelte";

  let { createdAt }: { createdAt: string } = $props();
</script>

<div class="rounded-lg border border-slate-200 bg-white p-3.5">
  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
    Details
  </h3>
  <div class="space-y-3.5">
    <DetailRow label="Created" border={false}>{formatDate(createdAt)}</DetailRow>
  </div>
</div>
