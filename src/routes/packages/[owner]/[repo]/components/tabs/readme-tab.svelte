<script lang="ts">
  let { readme }: { readme: string | null } = $props();
</script>

<div class="bg-white border border-gray-200 rounded-sm p-8">
  {#if readme}
    <div
      class="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-yellow-600 prose-a:no-underline hover:prose-a:underline"
    >
      {@html readme}
    </div>
  {:else}
    <p class="text-slate-400 text-center py-8">README not available.</p>
  {/if}
</div>
