<script lang="ts">
  import { resolve } from "$app/paths";
  import { ChevronLeft, ExternalLink, Star } from "lucide-svelte";
  import Author from "./components/author.svelte";
  import Topics from "./components/topics.svelte";
  import InstallCommand from "./components/install-command.svelte";
  import PackageDetails from "./components/package-details.svelte";
  import PackageLinks from "./components/package-links.svelte";
  import ReadmeTab from "./components/tabs/readme-tab.svelte";
  import CodeTab from "./components/tabs/code-tab.svelte";
  import VersionsTab from "./components/tabs/versions-tab.svelte";
  import DependenciesTab from "./components/tabs/dependencies-tab.svelte";

  import ButtonTab from "./components/tabs/button-tab.svelte";
  import Activity from "./components/activity.svelte";
  import { formatRelativeDate } from "$lib/utils/formatRelativeDate";
  import { formatNumber } from "$lib/utils/formatNumber";
  import { buildCanonical } from "$lib/seo";

  let { data } = $props();

  type Tab = "readme" | "code" | "versions" | "dependencies";
  let activeTab = $state<Tab>("readme");

  const pkg = $derived(data.package);

  const commitDate = $derived(formatRelativeDate(pkg.pushedAt));
  const sourceLabel = $derived(pkg.source === "codeberg" ? "Codeberg" : "GitHub");
  const heroTopics = $derived(pkg.topics.slice(0, 5));

  const description = $derived(
    pkg.description ||
      `${pkg.name} — a Zig ${pkg.packageType} by ${pkg.owner}. View source, install instructions, and documentation on zigpkg.`,
  );
  const canonical = $derived(buildCanonical(`/packages/${pkg.fullName}`));
  const jsonLd = $derived(
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: pkg.name,
      description,
      programmingLanguage: "Zig",
      codeRepository: pkg.repositoryUrl,
      url: canonical,
      author: { "@type": "Person", name: pkg.owner },
      dateCreated: pkg.createdAt,
      dateModified: pkg.pushedAt,
      license: pkg.license || undefined,
      keywords: (pkg.topics ?? []).join(", ") || undefined,
    }).replace(/</g, "\\u003c"),
  );
</script>

<svelte:head>
  <title>{pkg.name} - zigpkg</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={`${pkg.name} — zigpkg`} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:type" content="website" />
  <meta name="twitter:title" content={`${pkg.name} — zigpkg`} />
  <meta name="twitter:description" content={description} />
  {@html '<script type="application/ld+json">' + jsonLd + "<\/script>"}
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-10 sm:px-10">
  <a
    href="/packages"
    class="mb-5 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-zig-600"
  >
    <ChevronLeft class="h-4 w-4" />
    Back to packages
  </a>

  <section
    class="mb-8 rounded-lg border border-slate-200 bg-white p-5 sm:p-8"
  >
    <div class="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
      <div class="flex min-w-0 flex-col gap-5 sm:flex-row">
        <div
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-zig-200 bg-zig-100 text-slate-700"
          aria-label={sourceLabel}
          title={sourceLabel}
        >
          {#if pkg.source === "codeberg"}
            <svg
              class="h-8 w-8 text-sky-700"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 3 21 19H3L12 3Z"
                class="fill-sky-100 stroke-current"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path
                d="M8.5 17 12 10.5 15.5 17"
                class="stroke-current"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          {:else}
            <svg
              class="h-8 w-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.562 21.8 24 17.303 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          {/if}
        </div>

        <div class="min-w-0">
          <h1 class="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {pkg.name}
          </h1>

          <div class="mt-2 font-mono text-[11px] text-slate-400">
            by <a
              href={resolve(`/packages/${pkg.owner}`)}
              class="text-slate-500 transition-colors hover:text-zig-700"
            >
              {pkg.owner}
            </a>
          </div>

          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            {description}
          </p>

          <div class="mt-5 flex flex-wrap items-center gap-2">
            <span
              class="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide {pkg.packageType ===
              'application'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-zig-100 text-zig-700'}"
            >
              {pkg.packageType}
            </span>
            <Activity daysSinceCommit={commitDate.days} />
            <span class="font-mono text-xs text-slate-400">
              Last commit <span class="text-slate-600">{commitDate.label}</span>
            </span>
          </div>

          {#if heroTopics.length > 0}
            <div class="mt-3 flex flex-wrap gap-1.5">
              {#each heroTopics as topic (topic)}
                <a
                  href="/search?q={encodeURIComponent(topic)}"
                  class="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-500 transition-colors hover:bg-zig-100 hover:text-zig-700"
                >
                  {topic}
                </a>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div
        class="flex w-full shrink-0 flex-col gap-3 border-t border-slate-100 pt-5 lg:w-72 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
      >
        <a
          href={pkg.repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-600 transition-colors hover:border-zig-400 hover:text-zig-700"
        >
          <ExternalLink class="h-3.5 w-3.5" />
          Repository
        </a>

        <dl class="overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
          <div class="bg-zig-50/60 p-3">
            <dt class="font-mono text-[10px] uppercase tracking-wide text-zig-700/60">
              Current version
            </dt>
            <dd class="mt-1 truncate font-mono text-base font-bold text-zig-800">
              {pkg.version}
            </dd>
          </div>
          <div class="grid grid-cols-2 gap-px">
            <div class="bg-white p-3">
              <dt class="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                Stars
              </dt>
              <dd class="mt-1 flex items-center gap-1 font-mono text-sm font-semibold text-slate-900">
                <Star class="h-3.5 w-3.5 text-zig-500" fill="currentColor" />
                {formatNumber(pkg.stars)}
              </dd>
            </div>
            <div class="bg-white p-3">
              <dt class="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                Issues
              </dt>
              <dd class="mt-1 font-mono text-sm font-semibold text-slate-900">
                {formatNumber(pkg.openIssues)}
              </dd>
            </div>
            <div class="bg-white p-3">
              <dt class="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                License
              </dt>
              <dd class="mt-1 truncate font-mono text-sm font-semibold text-slate-900">
                {pkg.license || "Unknown"}
              </dd>
            </div>
            <div class="bg-white p-3">
              <dt class="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                Zig
              </dt>
              <dd class="mt-1 truncate font-mono text-sm font-semibold text-slate-900">
                {data.zonInfo?.minimumZigVersion || "Any"}
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  </section>

  {#if data.contentDegraded}
    <div
      class="mt-4 mb-4 px-4 py-3 rounded-lg bg-zig-50 border border-zig-200 text-sm text-zig-800"
    >
      README, files, and versions are temporarily unavailable. Please try again
      in a few minutes.
    </div>
  {/if}

  <div class="mb-5 overflow-x-auto">
    <div
      class="flex min-w-max items-center gap-1"
      role="tablist"
      aria-label="Package sections"
    >
      <ButtonTab
        active={activeTab === "readme"}
        onclick={() => (activeTab = "readme")}
      >
        Readme
      </ButtonTab>
      <ButtonTab
        active={activeTab === "code"}
        onclick={() => (activeTab = "code")}
      >
        Code
      </ButtonTab>
      <ButtonTab
        active={activeTab === "versions"}
        onclick={() => (activeTab = "versions")}
      >
        Versions
        {#if data.tags.length > 0}
          <span
            class="text-xs bg-gray-100 text-slate-500 px-2 py-0.5 rounded-full"
          >
            {data.tags.length}
          </span>
        {/if}
      </ButtonTab>
      <ButtonTab
        active={activeTab === "dependencies"}
        onclick={() => (activeTab = "dependencies")}
      >
        Dependencies {#if data.dependencies.length > 0}
          <span
            class="text-xs bg-gray-100 text-slate-500 px-2 py-0.5 rounded-full"
          >
            {data.dependencies.length}</span
          >
        {/if}
      </ButtonTab>
    </div>
  </div>

  <div class="flex flex-col lg:flex-row gap-8">
    <div class="flex-1 min-w-0 space-y-5">
      <div id="install">
        <InstallCommand repositoryUrl={pkg.repositoryUrl} version={pkg.version} />
      </div>
      <div class="flex-1 min-w-0">
        {#if activeTab === "readme"}
          <ReadmeTab readme={data.readme} />
        {:else if activeTab === "code"}
          <CodeTab files={data.files} />
        {:else if activeTab === "versions"}
          <VersionsTab tags={data.tags} />
        {:else if activeTab === "dependencies"}
          <DependenciesTab dependencies={data.dependencies} />
        {/if}
      </div>
    </div>

    <aside class="w-full lg:w-80 shrink-0 space-y-5">
      <Author owner={pkg.owner} ownerAvatarUrl={pkg.ownerAvatarUrl} />
      {#if pkg.topics.length > 0}
        <Topics items={pkg.topics} />
      {/if}
      <PackageLinks
        source={pkg.source}
        repositoryUrl={pkg.repositoryUrl}
        homepage={pkg.homepage}
        issuesUrl={data.issuesUrl}
      />
      <PackageDetails createdAt={pkg.createdAt} />
    </aside>
  </div>
</div>
