<script lang="ts">
  type Props = {
    owner: string;
    ownerAvatarUrl: string | null;
    ownerHtmlUrl: string;
  };

  let { owner, ownerAvatarUrl, ownerHtmlUrl }: Props = $props();
</script>

<div class="bg-white border border-gray-200 rounded-sm p-5">
  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
    Owner
  </h3>
  <a
    href={ownerHtmlUrl}
    target="_blank"
    rel="noopener"
    class="flex items-center gap-3 group"
  >
    {#if ownerAvatarUrl}
      <img src={ownerAvatarUrl} alt={owner} class="w-8 h-8 rounded-full" />
    {:else}
      <div
        class="w-8 h-8 rounded-full bg-linear-to-br from-zig-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold"
      >
        {owner[0].toUpperCase()}
      </div>
    {/if}
    <span
      class="text-sm font-medium text-slate-700 group-hover:text-zig-600 transition-colors"
      >{owner}</span
    >
  </a>
</div>
