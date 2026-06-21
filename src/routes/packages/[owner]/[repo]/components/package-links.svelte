<script lang="ts">
  import { ExternalLink, Globe, CircleAlert } from "lucide-svelte";
  let {
    source,
    repositoryUrl,
    homepage,
    issuesUrl,
  }: {
    source: string;
    repositoryUrl: string;
    homepage: string | null;
    issuesUrl: string;
  } = $props();

  const sourceLabel = $derived(source === "codeberg" ? "Codeberg" : "GitHub");
</script>

<div class="bg-white border border-gray-200 rounded-sm p-5 space-y-4">
  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
    Links
  </h3>
  <div class="space-y-2.5">
    <a
      href={repositoryUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2.5 text-sm text-slate-600 hover:text-zig-600 transition-colors"
    >
      <ExternalLink class="w-4 h-4 shrink-0" />
      <span>Repository</span>
      <span
        class="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-gray-100 text-slate-500 border border-gray-200"
      >
        {sourceLabel}
      </span>
    </a>
    {#if homepage}
      <a
        href={homepage}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2.5 text-sm text-slate-600 hover:text-zig-600 transition-colors"
      >
        <Globe class="w-4 h-4 shrink-0" />
        Homepage
      </a>
    {/if}
    <a
      href={issuesUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2.5 text-sm text-slate-600 hover:text-zig-600 transition-colors"
    >
      <CircleAlert class="w-4 h-4 shrink-0" />
      Issues
    </a>
  </div>
</div>
