<script lang="ts">
  import Author from "./components/author.svelte";
  import Topics from "./components/topics.svelte";

  import { formatDate } from "$lib/utils/formatDate.js";
  import { formatSize } from "$lib/utils/formatSize.js";

  let { data } = $props();

  let activeTab = $state("readme");
  let copied = $state(false);

  const pkg = $derived(data.package);

  const installCommand = $derived(
    `zig fetch --save git+${pkg.repositoryUrl}${pkg.version !== "latest" ? "#" + pkg.version : ""}`,
  );

  async function copyInstall() {
    await navigator.clipboard.writeText(installCommand);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<svelte:head>
  <title>{pkg.name} - zigpkg</title>
  <meta name="description" content={pkg.description} />
</svelte:head>

<div class="container mx-auto">
  <div class="mb-6">
    <div class="flex flex-wrap items-center gap-3 mb-2">
      <a
        href="/"
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
            >{pkg.version}</span
          >
          <span
            class="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-200"
            >{pkg.packageType}</span
          >
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
        <div class="bg-white border border-gray-200 rounded-2xl p-8">
          {#if data.readme}
            <div
              class="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-yellow-600 prose-a:no-underline hover:prose-a:underline prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:text-slate-100"
            >
              {@html data.readme}
            </div>
          {:else}
            <p class="text-slate-400 text-center py-8">README not available.</p>
          {/if}
        </div>
      {:else if activeTab === "code"}
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 class="text-lg font-bold text-slate-900 mb-4">Source Files</h2>
          {#if data.files.length > 0}
            <div class="border border-gray-100 rounded-xl overflow-hidden">
              {#each data.files as item (item.path)}
                <a
                  href={item.htmlUrl}
                  target="_blank"
                  rel="noopener"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0"
                >
                  {#if item.type === "dir"}
                    <svg
                      class="w-5 h-5 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      /></svg
                    >
                  {:else}
                    <svg
                      class="w-5 h-5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      /></svg
                    >
                  {/if}
                  <span
                    class="text-sm {item.type === 'dir'
                      ? 'font-semibold text-slate-900'
                      : 'text-slate-600'}">{item.name}</span
                  >
                  {#if item.type !== "dir" && item.size}
                    <span class="text-xs text-slate-400 ml-auto"
                      >{formatSize(item.size)}</span
                    >
                  {/if}
                </a>
              {/each}
            </div>
          {:else}
            <p class="text-slate-400 text-center py-8">
              Could not load repository contents.
            </p>
          {/if}
        </div>
      {:else if activeTab === "versions"}
        <div class="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
          <h2 class="text-lg font-bold text-slate-900 mb-4">Version History</h2>
          {#if data.tags.length > 0}
            {#each data.tags as tag, i (tag.name)}
              <div
                class="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors {i ===
                0
                  ? 'bg-yellow-50/50 border border-yellow-100'
                  : ''}"
              >
                <div class="flex items-center gap-3">
                  <span class="font-mono font-semibold text-slate-900"
                    >{tag.name}</span
                  >
                  {#if i === 0}
                    <span
                      class="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700"
                      >latest</span
                    >
                  {/if}
                </div>
                <span class="text-xs font-mono text-slate-400"
                  >{tag.sha.slice(0, 7)}</span
                >
              </div>
            {/each}
          {:else}
            <p class="text-slate-400 text-center py-8">
              No tagged versions found.
            </p>
          {/if}
        </div>
      {:else if activeTab === "dependencies"}
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            Dependencies <span class="text-sm font-normal text-slate-400"
              >({data.dependencies.length})</span
            >
          </h2>
          {#if data.dependencies.length > 0}
            <div class="space-y-3">
              {#each data.dependencies as dep (dep.name)}
                <div
                  class="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <div>
                    <span class="font-semibold text-slate-900">{dep.name}</span>
                    {#if dep.url}
                      <p
                        class="text-sm text-slate-400 mt-0.5 truncate max-w-md"
                      >
                        {dep.url}
                      </p>
                    {:else if dep.path}
                      <p class="text-sm text-slate-400 mt-0.5">
                        Local: {dep.path}
                      </p>
                    {/if}
                  </div>
                  {#if dep.hash}
                    <span
                      class="text-xs font-mono text-slate-400 shrink-0 ml-4"
                      title={dep.hash}
                    >
                      {dep.hash.slice(0, 12)}...
                    </span>
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-slate-400 text-center py-8">
              No dependencies found.
            </p>
          {/if}
        </div>
      {/if}
    </div>

    <aside class="w-full lg:w-80 shrink-0 space-y-5">
      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <h3
          class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3"
        >
          Install
        </h3>
        <div class="relative group">
          <div
            class="bg-slate-900 rounded-xl px-4 py-3 font-mono text-sm text-slate-100 overflow-x-auto"
          >
            <span class="text-slate-500 select-none">$ </span>zig fetch --save
            <span class="text-yellow-300"
              >git+{pkg.repositoryUrl}{pkg.version !== "latest"
                ? "#" + pkg.version
                : ""}</span
            >
          </div>
          <button
            onclick={copyInstall}
            class="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            {#if copied}
              <svg
                class="w-4 h-4 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                /></svg
              >
            {:else}
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                /></svg
              >
            {/if}
          </button>
        </div>
      </div>

      <Author owner={pkg.owner} ownerAvatarUrl={pkg.ownerAvatarUrl} />

      {#if pkg.topics.length > 0}
        <Topics items={pkg.topics} />
      {/if}

      <div class="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Links
        </h3>
        <div class="space-y-2.5">
          <a
            href={pkg.repositoryUrl}
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2.5 text-sm text-slate-600 hover:text-yellow-600 transition-colors"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
              ><path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              /></svg
            >
            Repository
          </a>
          {#if pkg.homepage}
            <a
              href={pkg.homepage}
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2.5 text-sm text-slate-600 hover:text-yellow-600 transition-colors"
            >
              <svg
                class="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                /></svg
              >
              Homepage
            </a>
          {/if}
          <a
            href="{pkg.repositoryUrl}/issues"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2.5 text-sm text-slate-600 hover:text-yellow-600 transition-colors"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              /></svg
            >
            Issues
          </a>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <h3
          class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4"
        >
          Stats
        </h3>
        <div class="space-y-3.5">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-500">Stars</span>
            <div class="flex items-center gap-1.5">
              <svg
                class="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 24 24"
                ><path
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                /></svg
              >
              <span class="text-sm font-bold text-slate-900"
                >{pkg.stars.toLocaleString()}</span
              >
            </div>
          </div>
          <div
            class="border-t border-gray-100 pt-3 flex items-center justify-between"
          >
            <span class="text-sm text-slate-500">Forks</span>
            <span class="text-sm font-bold text-slate-900"
              >{pkg.forks.toLocaleString()}</span
            >
          </div>
          <div
            class="border-t border-gray-100 pt-3 flex items-center justify-between"
          >
            <span class="text-sm text-slate-500">Open Issues</span>
            <span class="text-sm font-bold text-slate-900"
              >{pkg.openIssues.toLocaleString()}</span
            >
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <h3
          class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4"
        >
          Details
        </h3>
        <div class="space-y-3.5">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-500">Version</span>
            <span class="text-sm font-semibold text-slate-900"
              >{pkg.version}</span
            >
          </div>
          <div
            class="border-t border-gray-100 pt-3 flex items-center justify-between"
          >
            <span class="text-sm text-slate-500">License</span>
            <span class="text-sm font-semibold text-slate-900"
              >{pkg.license || "Unknown"}</span
            >
          </div>
          {#if data.zonInfo?.minimumZigVersion}
            <div
              class="border-t border-gray-100 pt-3 flex items-center justify-between"
            >
              <span class="text-sm text-slate-500">Min Zig Version</span>
              <span class="text-sm font-semibold text-slate-900"
                >{data.zonInfo.minimumZigVersion}</span
              >
            </div>
          {/if}
          <div
            class="border-t border-gray-100 pt-3 flex items-center justify-between"
          >
            <span class="text-sm text-slate-500">Last Updated</span>
            <span class="text-sm font-semibold text-slate-900"
              >{formatDate(pkg.pushedAt)}</span
            >
          </div>
          <div
            class="border-t border-gray-100 pt-3 flex items-center justify-between"
          >
            <span class="text-sm text-slate-500">Created</span>
            <span class="text-sm font-semibold text-slate-900"
              >{formatDate(pkg.createdAt)}</span
            >
          </div>
        </div>
      </div>
    </aside>
  </div>
</div>
