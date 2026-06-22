<script lang="ts">
  import { resolve } from "$app/paths";
  import { formatNumber } from "$lib/utils/formatNumber";
  import { Star, ExternalLink, Copy, Check } from "lucide-svelte";

  type Props = {
    name?: string;
    fullName: string;
    description?: string | null;
    version: string;
    stars: number;
    packageType: string;
    owner?: string;
    repositoryUrl?: string;
  };

  let { name, fullName, description, version, stars, packageType, owner, repositoryUrl }: Props =
    $props();

  const ownerName = $derived(owner ?? fullName.split("/")[0]);
  const repo = $derived(name ?? fullName.split("/").slice(1).join("/") ?? fullName);
  const repoHref = $derived(repositoryUrl ?? `https://github.com/${fullName}`);

  let copied = $state(false);

  async function copyFetch() {
    const cmd =
      version && version !== "latest"
        ? `zig fetch --save git+${repoHref}#${version}`
        : `zig fetch --save git+${repoHref}`;
    await navigator.clipboard.writeText(cmd);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div
  class="group flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3.5 transition-all hover:border-zig-300 hover:shadow-[0_4px_14px_rgb(15_23_42_/_0.06)]"
>
  <!-- Top: type badge + stars -->
  <div class="flex items-center justify-between gap-2">
    <span
      class="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide {packageType ===
      'application'
        ? 'bg-indigo-100 text-indigo-700'
        : 'bg-zig-100 text-zig-700'}"
    >
      {packageType}
    </span>
    <span class="flex shrink-0 items-center gap-1 font-mono text-xs font-semibold text-slate-600">
      <Star class="h-3.5 w-3.5 text-zig-500" fill="currentColor" />
      {formatNumber(stars)}
    </span>
  </div>

  <!-- Name + version -->
  <div class="flex items-center gap-2">
    <a
      href={resolve(`/packages/${fullName}`)}
      class="truncate text-[15px] font-bold text-slate-900 hover:text-zig-700"
    >
      {repo}
    </a>
    <span class="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
      {version}
    </span>
  </div>

  <!-- Description -->
  <p class="line-clamp-2 min-h-9 text-[13px] leading-[18px] text-slate-500">
    {description || "No description"}
  </p>

  <!-- Footer: author + quick actions -->
  <div class="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
    <span class="truncate text-xs text-slate-400">
      by <span class="font-mono text-slate-500">{ownerName}</span>
    </span>
    <div class="flex shrink-0 items-center gap-1.5">
      <a
        href={repoHref}
        target="_blank"
        rel="noopener noreferrer"
        title="Open repository"
        class="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:border-zig-400 hover:text-zig-700"
      >
        <ExternalLink class="h-3.5 w-3.5" />
      </a>
      <button
        type="button"
        onclick={copyFetch}
        title="Copy zig fetch command"
        class="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:border-zig-400 hover:text-zig-700"
      >
        {#if copied}
          <Check class="h-3.5 w-3.5 text-green-600" />
        {:else}
          <Copy class="h-3.5 w-3.5" />
        {/if}
      </button>
    </div>
  </div>
</div>
