<script lang="ts">
  import { formatNumber } from "$lib/utils/formatNumber";
  import { Check, Copy, Star, CircleAlert, Calendar } from 'lucide-svelte';

  type Props = {
    name: string;
    stars: number;
    description: string;
    fullName: string;
    version: string;
    owner: string;
    pushedAt: string;
    openIssues: number;
    repositoryUrl: string;
  };

  let copiedPkg = $state<string | null>(null);

  async function copyFetchCommand(
    fullName: string,
    repositoryUrl: string,
    version: string,
  ) {
    const command = version === "latest"
      ? `zig fetch --save git+${repositoryUrl}`
      : `zig fetch --save git+${repositoryUrl}#${version}`;
    await navigator.clipboard.writeText(command);
    copiedPkg = fullName;
    setTimeout(() => {
      copiedPkg = null;
    }, 2000);
  }

  function formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return "1 month ago";
    if (diffMonths < 12) return `${diffMonths} months ago`;
    const diffYears = Math.floor(diffMonths / 12);
    if (diffYears === 1) return "1 year ago";
    return `${diffYears} years ago`;
  }

  let { name, fullName, version, owner, stars, openIssues, pushedAt, description, repositoryUrl }: Props = $props();
</script>

<div
  class="group relative flex flex-col bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 hover:border-yellow-400/50"
>
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:bg-yellow-50 group-hover:border-yellow-100 transition-all duration-300"
      >
        📦
      </div>
      <h2
        class="text-lg font-bold text-slate-900 group-hover:text-yellow-600 transition-colors"
      >
        <a href={`/packages/${fullName}`}>{fullName.length > 22 ? fullName.slice(0, 22).concat('...') : fullName}</a>
      </h2>
    </div>
    <div class="flex items-center gap-1.5">
      <span
        class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-slate-500 border border-gray-200 group-hover:border-yellow-200 group-hover:bg-yellow-50 group-hover:text-yellow-700 transition-colors"
      >
        {version}
      </span>
      <button
        onclick={() => copyFetchCommand(fullName, repositoryUrl, version)}
        class="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
        title="Copy zig fetch command"
      >
        {#if copiedPkg === fullName}
          <Check class="w-3.5 h-3.5 text-green-500" />
        {:else}
          <Copy class="w-3.5 h-3.5" />
        {/if}
      </button>
    </div>
  </div>

  <p class="text-sm text-slate-500 mb-6 grow leading-relaxed">
    {description}
  </p>

  <footer class="flex items-center gap-4 text-xs font-medium text-slate-400">
    <!-- Stars -->
    <div
      class="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default"
    >
      <Star class="w-4 h-4" />
      {formatNumber(stars)}
    </div>
    <!-- Issues -->
    <div
      class="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default"
    >
      <CircleAlert class="w-4 h-4" />
      {openIssues}
    </div>
    <!-- Last commit -->
    <div
      class="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default"
    >
      <Calendar class="w-4 h-4" />
      {formatDate(pushedAt)}
    </div>
  </footer>
</div>
