<script lang="ts">
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

  const activity = $derived.by(() => {
    switch (true) {
      case daysSinceCommit < 30:
        return {
          label: "Active",
          color: "text-emerald-500",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          pulse: true,
        };
      case daysSinceCommit < 180:
        return {
          label: "Moderate",
          color: "text-amber-500",
          bg: "bg-amber-50",
          border: "border-amber-200",
          pulse: false,
        };
      default:
        return {
          label: "Inactive",
          color: "text-slate-400",
          bg: "bg-slate-50",
          border: "border-slate-200",
          pulse: false,
        };
    }
  });
</script>

<svelte:head>
  <title>{pkg.name} - zigpkg</title>
  <meta name="description" content={pkg.description} />
</svelte:head>

<div class="container mx-auto">
  <div class="mb-6">
    <div class="flex flex-wrap items-center gap-3 mb-2">
      <a
        href="/packages"
        class="text-sm text-slate-400 hover:text-yellow-600 transition-colors flex items-center gap-1"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          /></svg
        >
        Back to packages
      </a>
    </div>

    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div class="flex flex-wrap items-center gap-3 mb-2">
          <h1 class="text-3xl font-bold text-slate-900">{pkg.name}</h1>
          <span
            class="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200"
          >
            {pkg.version}
          </span>
          <span
            class="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-200"
          >
            {pkg.packageType}
          </span>
        </div>
        <div class="flex items-center gap-2 mt-1 mb-2">
          <svg
            class="w-4 h-4 {activity.color} {activity.pulse
              ? 'animate-pulse'
              : ''}"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M22 12h-4l-3 9L9 3l-3 9H2"
            />
          </svg>
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded-full border {activity.bg} {activity.color} {activity.border}"
          >
            {activity.label}
          </span>
          <span class="text-slate-300 text-xs">·</span>
          <span class="text-xs text-slate-400">
            Last commit <span class="font-medium text-slate-600">
              {relativeDate}
            </span>
          </span>
        </div>
        <p class="text-slate-500 text-lg max-w-2xl">{pkg.description}</p>
      </div>

      <div class="flex items-center gap-3 mt-1">
        <a
          href={pkg.repositoryUrl}
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-slate-700 hover:border-yellow-400 hover:text-yellow-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"
            ><path
              fill-rule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clip-rule="evenodd"
            /></svg
          >
          Repository
        </a>
      </div>
    </div>
  </div>

  <div class="border-b border-gray-200 mb-8">
    <nav class="flex gap-0 -mb-px">
      <button
        onclick={() => (activeTab = "readme")}
        class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors {activeTab ===
        'readme'
          ? 'border-yellow-400 text-yellow-700'
          : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-gray-300'}"
        >Readme</button
      >
      <button
        onclick={() => (activeTab = "code")}
        class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors {activeTab ===
        'code'
          ? 'border-yellow-400 text-yellow-700'
          : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-gray-300'}"
        >Code</button
      >
      <button
        onclick={() => (activeTab = "versions")}
        class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 {activeTab ===
        'versions'
          ? 'border-yellow-400 text-yellow-700'
          : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-gray-300'}"
        >Versions {#if data.tags.length > 0}<span
            class="text-xs bg-gray-100 text-slate-500 px-2 py-0.5 rounded-full"
            >{data.tags.length}</span
          >{/if}</button
      >
      <button
        onclick={() => (activeTab = "dependencies")}
        class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 {activeTab ===
        'dependencies'
          ? 'border-yellow-400 text-yellow-700'
          : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-gray-300'}"
        >Dependencies {#if data.dependencies.length > 0}<span
            class="text-xs bg-gray-100 text-slate-500 px-2 py-0.5 rounded-full"
            >{data.dependencies.length}</span
          >{/if}</button
      >
    </nav>
  </div>

  <div class="flex flex-col lg:flex-row gap-8">
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

    <aside class="w-full lg:w-80 shrink-0 space-y-5">
      <InstallCommand repositoryUrl={pkg.repositoryUrl} version={pkg.version} />
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
</div>
