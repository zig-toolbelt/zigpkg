<script lang="ts">
  import { Github, Globe, CircleAlert } from 'lucide-svelte';
  let { repositoryUrl, homepage }: { repositoryUrl: string; homepage: string | null } = $props();
</script>

<div class="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Links</h3>
  <div class="space-y-2.5">
    <a
      href={repositoryUrl}
      target="_blank"
      rel="noopener"
      class="flex items-center gap-2.5 text-sm text-slate-600 hover:text-yellow-600 transition-colors"
    >
      <Github class="w-4 h-4 shrink-0" />
      Repository
    </a>
    {#if homepage}
      <a
        href={homepage}
        target="_blank"
        rel="noopener"
        class="flex items-center gap-2.5 text-sm text-slate-600 hover:text-yellow-600 transition-colors"
      >
        <Globe class="w-4 h-4 shrink-0" />
        Homepage
      </a>
    {/if}
    <a
      href="{repositoryUrl}/issues"
      target="_blank"
      rel="noopener"
      class="flex items-center gap-2.5 text-sm text-slate-600 hover:text-yellow-600 transition-colors"
    >
      <CircleAlert class="w-4 h-4 shrink-0" />
      Issues
    </a>
  </div>
</div>
