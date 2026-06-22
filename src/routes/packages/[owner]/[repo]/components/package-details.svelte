<script lang="ts">
  import { formatDate } from "$lib/utils/formatDate.js";
  import DetailRow from "./detail-row.svelte";

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

<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
    Details
  </h3>
  <div class="space-y-3.5">
    <DetailRow label="Version" border={false}>{version}</DetailRow>
    <DetailRow label="License">{license || "Unknown"}</DetailRow>
    {#if zonInfo?.minimumZigVersion}
      <DetailRow label="Min Zig Version">{zonInfo.minimumZigVersion}</DetailRow>
    {/if}
    <DetailRow label="Last Updated">{formatDate(pushedAt)}</DetailRow>
    <DetailRow label="Created">{formatDate(createdAt)}</DetailRow>
  </div>
</div>
