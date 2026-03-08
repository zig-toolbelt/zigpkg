<script lang="ts">
  import { formatDate } from "$lib/utils/formatDate.js";

  let {
    version,
    license,
    zonInfo,
    pushedAt,
    createdAt,
  }: {
    version: string;
    license: string | null;
    zonInfo: { minimumZigVersion?: string | null } | null;
    pushedAt: string;
    createdAt: string;
  } = $props();
</script>

<div class="bg-white border border-gray-200 rounded-2xl p-5">
  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Details</h3>
  <div class="space-y-3.5">
    <div class="flex items-center justify-between">
      <span class="text-sm text-slate-500">Version</span>
      <span class="text-sm font-semibold text-slate-900">{version}</span>
    </div>
    <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
      <span class="text-sm text-slate-500">License</span>
      <span class="text-sm font-semibold text-slate-900">{license || "Unknown"}</span>
    </div>
    {#if zonInfo?.minimumZigVersion}
      <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
        <span class="text-sm text-slate-500">Min Zig Version</span>
        <span class="text-sm font-semibold text-slate-900">{zonInfo.minimumZigVersion}</span>
      </div>
    {/if}
    <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
      <span class="text-sm text-slate-500">Last Updated</span>
      <span class="text-sm font-semibold text-slate-900">{formatDate(pushedAt)}</span>
    </div>
    <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
      <span class="text-sm text-slate-500">Created</span>
      <span class="text-sm font-semibold text-slate-900">{formatDate(createdAt)}</span>
    </div>
  </div>
</div>
