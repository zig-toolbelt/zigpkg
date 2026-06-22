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

<div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
        class="ml-auto rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500"
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
