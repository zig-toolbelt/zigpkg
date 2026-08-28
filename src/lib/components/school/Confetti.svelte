<script lang="ts">
  type Piece = {
    left: number;
    delay: number;
    duration: number;
    size: number;
    color: string;
    round: boolean;
  };

  interface Props {
    count?: number;
  }

  let { count = 70 }: Props = $props();

  const colors = ["bg-zig-400", "bg-emerald-400", "bg-sky-400", "bg-red-400", "bg-slate-800"];

  let pieces = $state<Piece[]>([]);

  $effect(() => {
    pieces = Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 1.6,
      duration: 2.6 + Math.random() * 2.2,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      round: Math.random() > 0.6,
    }));
  });
</script>

<div class="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
  {#each pieces as piece, index (index)}
    <span
      class={`school-fall absolute top-0 ${piece.color} ${piece.round ? "rounded-full" : "rounded-[2px]"}`}
      style:left={`${piece.left}%`}
      style:width={`${piece.size}px`}
      style:height={`${piece.size * (piece.round ? 1 : 1.6)}px`}
      style:animation-delay={`${piece.delay}s`}
      style:animation-duration={`${piece.duration}s`}
    ></span>
  {/each}
</div>
