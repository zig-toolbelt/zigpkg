<script lang="ts">
  import { resolve } from "$app/paths";
  import { formatNumber } from "$lib/utils/formatNumber";
  import { Star, User } from "lucide-svelte";

  type Props = {
    name?: string;
    fullName: string;
    description?: string | null;
    version: string;
    stars: number;
    packageType: string;
    owner?: string;
  };

  let { name, fullName, description, version, stars, packageType, owner }: Props = $props();

  const ownerName = $derived(owner ?? fullName.split("/")[0]);
  const repo = $derived(name ?? fullName.split("/").slice(1).join("/") ?? fullName);
</script>

<a
  href={resolve(`/packages/${fullName}`)}
  class="group flex flex-col gap-1 rounded-sm border border-slate-200 bg-white p-3.5 shadow-[inset_0_-2px_0_0_rgb(100_116_139_/_0.08)] transition-colors hover:border-zig-300"
>
  <!-- Top: name + stars -->
  <div class="flex items-center justify-between gap-2">
    <span class="truncate text-sm font-semibold text-slate-900 group-hover:text-zig-700">
      {repo}
    </span>
    <span class="flex shrink-0 items-center gap-1 font-mono text-xs text-slate-500">
      <Star class="h-3 w-3 text-zig-400" fill="currentColor" />
      {formatNumber(stars)}
    </span>
  </div>

  <!-- Description -->
  <p class="line-clamp-2 min-h-8 text-xs leading-4 text-slate-500">
    {description || "No description"}
  </p>

  <!-- Bottom: author + type -->
  <div class="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
    <User class="h-3 w-3 shrink-0" />
    <span class="truncate font-mono">{ownerName}</span>
    <span class="ml-auto shrink-0 font-mono text-[11px] capitalize">{packageType}</span>
  </div>
</a>
