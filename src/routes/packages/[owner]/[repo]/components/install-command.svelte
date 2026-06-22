<script lang="ts">
  import { Check, Copy } from "lucide-svelte";
  let { repositoryUrl, version }: { repositoryUrl: string; version: string } =
    $props();

  let copied = $state(false);

  const installCommand = $derived(
    `zig fetch --save git+${repositoryUrl}${version !== "latest" ? "#" + version : ""}`,
  );

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(installCommand);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }
</script>

<div
  class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
>
  <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
    <div>
      <h2 class="text-sm font-bold text-slate-950">Install package</h2>
      <p class="mt-0.5 text-xs text-slate-500">Add this package to your Zig project.</p>
    </div>
    {#if copied}
      <span class="text-xs font-semibold text-emerald-600">Copied</span>
    {/if}
  </div>

  <div class="relative p-3 sm:p-5">
    <div
      class="overflow-x-auto rounded-xl bg-slate-950 px-4 py-4 pr-14 font-mono text-sm text-slate-100 shadow-inner shadow-black/20"
    >
      <span class="text-zig-300">$</span>
      <span class="ml-2">{installCommand}</span>
    </div>
    <button
      type="button"
      aria-label="Copy install command"
      onclick={copyInstall}
      class="absolute right-6 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zig-400"
    >
      {#if copied}
        <Check class="w-4 h-4 text-green-400" />
      {:else}
        <Copy class="w-4 h-4" />
      {/if}
    </button>
  </div>
</div>
