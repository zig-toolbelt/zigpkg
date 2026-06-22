<script lang="ts">
  import { resolve } from "$app/paths";
  import { formatNumber } from "$lib/utils/formatNumber";
  import { formatDate } from "$lib/utils/formatDate";
  import {
    Star,
    CircleAlert,
    Calendar,
    Copy,
    Check,
    ChevronLeft,
    ExternalLink,
  } from "lucide-svelte";
  import { archiveFetchUrl } from "$lib/providers";

  let { data } = $props();

  let copiedPkg = $state<string | null>(null);

  type PkgCard = (typeof data.packages)[number];

  const sourceLabel = $derived(data.source === "codeberg" ? "Codeberg" : "GitHub");

  async function copyFetchCommand(pkg: PkgCard) {
    const url = archiveFetchUrl(pkg.source, pkg.repositoryUrl, pkg.version);
    await navigator.clipboard.writeText(`zig fetch --save ${url}`);
    copiedPkg = pkg.fullName;
    setTimeout(() => (copiedPkg = null), 2000);
  }
</script>

<svelte:head>
  <title>{data.owner} - zigpkg</title>
  <meta
    name="description"
    content={`Zig packages published by ${data.owner} on zigpkg — ${data.totalCount} package${data.totalCount !== 1 ? "s" : ""}.`}
  />
  <meta property="og:title" content={`${data.owner} — zigpkg`} />
  <meta
    property="og:description"
    content={`Zig packages published by ${data.owner} on zigpkg.`}
  />
</svelte:head>

<div
  class="mx-auto max-w-7xl px-6 py-10 text-slate-900 selection:bg-zig-200 selection:text-black sm:px-10"
>
  <!-- Breadcrumb -->
  <a
    href={resolve("/packages")}
    class="mb-5 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-zig-600"
  >
    <ChevronLeft class="h-4 w-4" />
    Back to packages
  </a>

  <!-- Owner Header -->
  <div
    class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-center gap-4">
      {#if data.ownerAvatarUrl}
        <img
          src={data.ownerAvatarUrl}
          alt={data.owner}
          class="h-16 w-16 shrink-0 rounded-xl border border-slate-200 object-cover shadow-sm"
        />
      {:else}
        <div
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-zig-100 text-2xl font-bold text-zig-700 shadow-sm"
        >
          {data.owner.charAt(0).toUpperCase()}
        </div>
      {/if}
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2.5">
          <h1
            class="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            {data.owner}
          </h1>
          <span
            class="inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 font-mono text-[11px] text-slate-500"
          >
            {sourceLabel}
          </span>
        </div>
        <div
          class="mt-1.5 flex items-center gap-3 font-mono text-xs text-slate-400"
        >
          <span>
            {data.totalCount} package{data.totalCount !== 1 ? "s" : ""}
          </span>
          <span class="text-slate-300">·</span>
          <span class="flex items-center gap-1">
            <Star class="h-3.5 w-3.5 text-zig-500" fill="currentColor" />
            {formatNumber(data.totalStars)}
          </span>
        </div>
      </div>
    </div>

    <a
      href={data.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-zig-400 hover:text-zig-700"
    >
      <ExternalLink class="h-4 w-4" />
      View profile
    </a>
  </div>

  <!-- Packages Grid -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {#each data.packages as pkg (pkg.fullName)}
      <div
        class="group flex flex-col rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-zig-300 hover:shadow-[0_4px_14px_rgb(15_23_42_/_0.06)]"
      >
        <div class="mb-3 flex items-start justify-between gap-2">
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-xl shadow-sm transition-all group-hover:border-zig-100 group-hover:bg-zig-50"
            >
              📦
            </div>
            <div class="min-w-0">
              <h2
                class="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-zig-600"
              >
                <a href={resolve(`/packages/${pkg.fullName}`)}>{pkg.name}</a>
              </h2>
              <span
                class="mt-0.5 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide {pkg.packageType ===
                'application'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-zig-100 text-zig-700'}"
              >
                {pkg.packageType || "library"}
              </span>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-1.5">
            <span
              class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500"
            >
              {pkg.version}
            </span>
            <button
              onclick={() => copyFetchCommand(pkg)}
              class="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:border-zig-400 hover:text-zig-700"
              title="Copy zig fetch command"
              aria-label="Copy zig fetch command"
            >
              {#if copiedPkg === pkg.fullName}
                <Check class="h-3.5 w-3.5 text-green-600" />
              {:else}
                <Copy class="h-3.5 w-3.5" />
              {/if}
            </button>
          </div>
        </div>

        <p class="mb-5 grow text-sm leading-relaxed text-slate-500 line-clamp-2">
          {pkg.description || "No description"}
        </p>

        <footer
          class="flex items-center gap-4 border-t border-slate-100 pt-3 text-xs font-medium text-slate-400"
        >
          <div class="flex items-center gap-1.5" title="Stars">
            <Star class="h-4 w-4" />
            {formatNumber(pkg.stars)}
          </div>
          <div class="flex items-center gap-1.5" title="Open issues">
            <CircleAlert class="h-4 w-4" />
            {pkg.openIssues}
          </div>
          <div class="flex items-center gap-1.5" title="Last updated">
            <Calendar class="h-4 w-4" />
            {formatDate(pkg.pushedAt)}
          </div>
        </footer>
      </div>
    {/each}
  </div>
</div>
