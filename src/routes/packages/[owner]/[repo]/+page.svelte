<script lang="ts">
  import { ChevronLeft, Github } from "lucide-svelte";
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

  let { data } = $props();

  let activeTab = $state("readme");

  const pkg = $derived(data.package);

  const daysSinceCommit = $derived(
    Math.floor(
      (Date.now() - new Date(pkg.pushedAt).getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  const relativeDate = $derived.by(() => {
    if (daysSinceCommit === 0) return "today";
    if (daysSinceCommit === 1) return "yesterday";
    if (daysSinceCommit < 30) return `${daysSinceCommit} days ago`;
    if (daysSinceCommit < 365)
      return `${Math.floor(daysSinceCommit / 30)} months ago`;
    return `${Math.floor(daysSinceCommit / 365)} years ago`;
  });
</script>

<svelte:head>
  <title>{pkg.name} - zigpkg</title>
  <meta name="description" content={pkg.description} />
</svelte:head>

<div>
  <div class="mb-2">
    <a
      href="/"
      class="text-sm text-slate-400 hover:text-yellow-600 transition-colors flex items-center gap-1"
    >
      <ChevronLeft class="w-4 h-4" />
      Back to packages
    </a>
  </div>

  <div class="flex justify-between gap-4">
    <div class="flex gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="text-3xl font-bold text-slate-900">{pkg.name}</h1>
        <span
          class="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200"
        >
          {pkg.version}
        </span>
        <div
          class="text-xs font-medium px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200"
        >
          {pkg.packageType}
        </div>
        <Activity {daysSinceCommit} />
        <span class="text-slate-300 text-xs">·</span>
        <span class="text-xs text-slate-400">
          Last commit <span class="font-medium text-slate-600">
            {relativeDate}
          </span>
        </span>
      </div>
    </div>

    <div>
      <a
        href={pkg.repositoryUrl}
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-slate-700 hover:border-yellow-400 hover:text-yellow-700 transition-colors"
      >
        <Github class="w-4 h-4" />
        Repository
      </a>
    </div>
  </div>
</div>

<div class="border-b border-gray-200 mb-8">
  <nav class="flex gap-0 -mb-px">
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
  </nav>
</div>

<div class="flex flex-col lg:flex-row gap-8">
  <div class="grid space-y-5">
    <InstallCommand repositoryUrl={pkg.repositoryUrl} version={pkg.version} />
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
    <PackageLinks repositoryUrl={pkg.repositoryUrl} homepage={pkg.homepage} />
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
