<script lang="ts">
  import { ChevronLeft, ExternalLink } from "lucide-svelte";
  import Author from "./components/author.svelte";
  import Topics from "./components/topics.svelte";
  import InstallCommand from "./components/install-command.svelte";
  import PackageStats from "./components/package-stats.svelte";
  import PackageDetails from "./components/package-details.svelte";
  import PackageLinks from "./components/package-links.svelte";
  import ReadmeTab from "./components/tabs/readme-tab.svelte";
  import CodeTab from "./components/tabs/code-tab.svelte";
  import VersionsTab from "./components/tabs/versions-tab.svelte";
  import DependenciesTab from "./components/tabs/dependencies-tab.svelte";

  import ButtonTab from "./components/tabs/button-tab.svelte";
  import Activity from "./components/activity.svelte";
  import { formatRelativeDate } from "$lib/utils/formatRelativeDate";
  import { buildCanonical } from "$lib/seo";

  let { data } = $props();

  type Tab = "readme" | "code" | "versions" | "dependencies";
  let activeTab = $state<Tab>("readme");

  const pkg = $derived(data.package);

  const commitDate = $derived(formatRelativeDate(pkg.pushedAt));
  const sourceLabel = $derived(pkg.source === "codeberg" ? "Codeberg" : "GitHub");

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

<div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 pt-6">
  <div class="mb-4">
    <a
      href="/packages"
      class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-zig-700"
    >
      <ChevronLeft class="w-4 h-4" />
      Back to packages
    </a>
  </div>

  <section
    class="relative overflow-hidden rounded-3xl border border-zig-100 bg-linear-to-br from-white via-zig-50/70 to-orange-50/40 p-5 shadow-sm sm:p-8"
  >
    <div
      class="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-zig-300/20 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-28 left-1/3 h-48 w-48 rounded-full bg-orange-200/30 blur-3xl"
    ></div>

    <div class="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
      <div class="flex min-w-0 flex-col gap-5 sm:flex-row">
        <div
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-zig-200 bg-zig-400 text-sm font-black tracking-tight text-slate-950 shadow-sm shadow-zig-200/70"
          aria-hidden="true"
        >
          ZIG
        </div>

        <div class="min-w-0">
          <div class="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span>{sourceLabel} package</span>
            <span class="h-1 w-1 rounded-full bg-slate-300"></span>
            <span>{pkg.owner}</span>
          </div>

          <h1 class="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            {pkg.name}
          </h1>

          <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            {description}
          </p>

          <div class="mt-5 flex flex-wrap items-center gap-2.5">
            <span
              class="inline-flex items-center rounded-full border border-zig-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-zig-800 shadow-sm"
            >
              {pkg.version}
            </span>
            <span
              class="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
            >
              {pkg.packageType}
            </span>
            <Activity daysSinceCommit={commitDate.days} />
            <span class="text-xs font-medium text-slate-500">
              Last commit <span class="text-slate-800">{commitDate.label}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="flex shrink-0 flex-col gap-2 sm:flex-row lg:pt-2">
        <a
          href="#install"
          class="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zig-500"
        >
          Install
        </a>
        <a
          href={pkg.repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-zig-300 hover:text-zig-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zig-500"
        >
          <ExternalLink class="w-4 h-4" />
          Repository
        </a>
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

  <div class="my-8 overflow-x-auto">
    <div
      class="inline-flex min-w-full gap-1 rounded-2xl border border-slate-200 bg-slate-100/70 p-1 sm:min-w-0"
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
      <PackageStats
        stars={pkg.stars}
        forks={pkg.forks}
        openIssues={pkg.openIssues}
      />
      <PackageDetails
        version={pkg.version}
        license={pkg.license}
        zonInfo={data.zonInfo}
        pushedAt={pkg.pushedAt}
        createdAt={pkg.createdAt}
      />
    </aside>
  </div>
</div>
