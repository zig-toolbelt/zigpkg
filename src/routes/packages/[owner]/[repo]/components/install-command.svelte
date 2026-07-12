<script lang="ts">
  import { Check, Copy } from "lucide-svelte";
  import { hasVersion } from "$lib/utils/version";

  let { repositoryUrl, installRef }: { repositoryUrl: string; installRef: string } =
    $props();

  let copied = $state(false);

  const installCommand = $derived(
    `zig fetch --save git+${repositoryUrl}${hasVersion(installRef) ? "#" + installRef : ""}`,
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

<div class="rounded-lg border border-slate-200 bg-white p-3.5">
  <div class="mb-2 flex items-center justify-between gap-3">
    <h2 class="font-mono text-[11px] font-bold uppercase tracking-wide text-slate-400">
      Install
    </h2>
    {#if copied}
      <span class="font-mono text-[11px] font-semibold text-emerald-600">Copied</span>
    {/if}
  </div>

  <div class="relative">
    <div
      class="overflow-x-auto rounded-md bg-slate-950 px-3 py-2.5 pr-12 font-mono text-xs text-slate-100"
    >
      <span class="text-zig-300">$</span>
      <span class="ml-2">{installCommand}</span>
    </div>
    <button
      type="button"
      aria-label="Copy install command"
      onclick={copyInstall}
      class="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors cursor-pointer hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zig-400"
    >
      {#if copied}
        <Check class="w-4 h-4 text-green-400" />
      {:else}
        <Copy class="w-4 h-4" />
      {/if}
    </button>
  </div>
</div>
