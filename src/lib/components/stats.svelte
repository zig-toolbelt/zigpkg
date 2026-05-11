<script lang="ts">
  import { formatNumber } from "$lib/utils/formatNumber";

  type Props = {
    stats?: {
      totalPackages: number;
      totalLibraries: number;
      totalApplications: number;
      totalStars: number;
    };
  };

  let { stats }: Props = $props();

  const displayStats = $derived([
    { value: formatNumber(stats?.totalPackages ?? 0), label: "Packages" },
    { value: formatNumber(stats?.totalLibraries ?? 0), label: "Libraries" },
    {
      value: formatNumber(stats?.totalApplications ?? 0),
      label: "Applications",
    },
    { value: formatNumber(stats?.totalStars ?? 0), label: "Total Stars" },
  ]);
</script>

<section class="py-12 border-y">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      {#each displayStats as stat}
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-[#F7A41D]">
            {stat.value}
          </div>
          <div class="text-sm text-muted-foreground mt-1">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>
