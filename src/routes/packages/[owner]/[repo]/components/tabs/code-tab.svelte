<script lang="ts">
  import { formatSize } from "$lib/utils/formatSize.js";
  import { Folder, FileText } from "lucide-svelte";

  let {
    files,
  }: {
    files: {
      name: string;
      path: string;
      type: string;
      size: number;
      htmlUrl: string | null;
    }[];
  } = $props();
</script>

<div class="bg-white border border-gray-200 rounded-sm p-6">
  <h2 class="text-lg font-bold text-slate-900 mb-4">Source Files</h2>
  {#if files.length > 0}
    <div class="border border-gray-100 rounded-xl overflow-hidden">
      {#each files as item (item.path)}
        <a
          href={item.htmlUrl ?? "#"}
          target="_blank"
          rel="noopener"
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0"
        >
          {#if item.type === "dir"}
            <Folder class="w-5 h-5 text-yellow-500" />
          {:else}
            <FileText class="w-5 h-5 text-slate-400" />
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
