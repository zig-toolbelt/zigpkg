<script lang="ts">
  import { formatNumber } from "$lib/utils/formatNumber";
  import { Star, CircleAlert, Calendar, Copy, Check } from "lucide-svelte";

  let { data } = $props();

  let copiedPkg = $state<string | null>(null);

  async function copyFetchCommand(
    owner: string,
    name: string,
    version: string,
  ) {
    const archivePath =
      version === "latest"
        ? "archive/HEAD.tar.gz"
        : `archive/refs/tags/${version}.tar.gz`;
    const url = `https://github.com/${owner}/${name}/${archivePath}`;
    await navigator.clipboard.writeText(`zig fetch --save ${url}`);
    copiedPkg = `${owner}/${name}`;
    setTimeout(() => (copiedPkg = null), 2000);
  }

  function formatDate(iso: string): string {
    const diffDays = Math.floor(
      (Date.now() - new Date(iso).getTime()) / 86400000,
    );
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
</script>

<svelte:head>
  <title>{data.owner} - zigpkg</title>
  <meta name="description" content="Zig packages by {data.owner}" />
</svelte:head>

<div
  class="text-slate-900 font-sans selection:bg-yellow-200 selection:text-black"
>
  <!-- Owner Header -->
  <div class="flex items-center gap-4 mb-8">
    {#if data.ownerAvatarUrl}
      <img
        src={data.ownerAvatarUrl}
        alt={data.owner}
        class="w-16 h-16 rounded-sm border border-gray-200"
      />
    {/if}
    <div>
      <h1 class="text-3xl font-extrabold text-slate-900">{data.owner}</h1>
      <p class="text-slate-500 mt-0.5">
        {data.totalCount} package{data.totalCount !== 1 ? "s" : ""}
      </p>
    </div>
  </div>

  <!-- Packages Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each data.packages as pkg (pkg.fullName)}
      <div
        class="group relative flex flex-col bg-white border border-gray-200 rounded-sm p-6 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 hover:border-yellow-400/50"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:bg-yellow-50 group-hover:border-yellow-100 transition-all duration-300"
            >
              📦
            </div>
            <h2
              class="text-lg font-bold text-slate-900 group-hover:text-yellow-600 transition-colors"
            >
              <a href={`/packages/${pkg.fullName}`}>{pkg.name}</a>
            </h2>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-slate-500 border border-gray-200 group-hover:border-yellow-200 group-hover:bg-yellow-50 group-hover:text-yellow-700 transition-colors"
            >
              {pkg.version}
            </span>
            <button
              onclick={() => copyFetchCommand(pkg.owner, pkg.name, pkg.version)}
              class="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
              title="Copy zig fetch command"
            >
              {#if copiedPkg === pkg.fullName}
                <Check class="w-3.5 h-3.5 text-green-500" />
              {:else}
                <Copy class="w-3.5 h-3.5" />
              {/if}
            </button>
          </div>
        </div>

        <p class="text-sm text-slate-500 mb-6 grow leading-relaxed">
          {pkg.description}
        </p>

        <footer
          class="flex items-center gap-4 text-xs font-medium text-slate-400"
        >
          <div
            class="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default"
          >
            <Star class="w-4 h-4" />
            {formatNumber(pkg.stars)}
          </div>
          <div
            class="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default"
          >
            <CircleAlert class="w-4 h-4" />
            {pkg.openIssues}
          </div>
          <div
            class="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default"
          >
            <Calendar class="w-4 h-4" />
            {formatDate(pkg.pushedAt)}
          </div>
        </footer>
      </div>
    {/each}
  </div>
</div>
