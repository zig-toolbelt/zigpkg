<script lang="ts">
  type Props = {
    owner: string;
    ownerAvatarUrl: string | null;
  };

  let { owner, ownerAvatarUrl }: Props = $props();
</script>

<div class="bg-white border border-gray-200 rounded-sm p-5">
  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
    Owner
  </h3>
  <a
    href="https://github.com/{owner}"
    target="_blank"
    rel="noopener"
    class="flex items-center gap-3 group"
  >
    {#if ownerAvatarUrl}
      <img src={ownerAvatarUrl} alt={owner} class="w-8 h-8 rounded-full" />
    {:else}
      <div
        class="w-8 h-8 rounded-full bg-linear-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold"
      >
        {owner[0].toUpperCase()}
      </div>
    {/if}
    <span
      class="text-sm font-medium text-slate-700 group-hover:text-yellow-600 transition-colors"
      >{owner}</span
    >
  </a>
</div>
