<script lang="ts">
  import { ArrowRight, CalendarDays, Clock3, Newspaper, Tag } from "lucide-svelte";

  const featured = {
    title: "Designing a package registry for the Zig ecosystem",
    excerpt:
      "A look at the product decisions behind zigpkg: technical density, repository trust signals, and a UI that stays close to developer workflows.",
    category: "Product",
    date: "Mar 24, 2026",
    readTime: "6 min read",
    href: "/blog/designing-a-package-registry",
  };

  const posts = [
    {
      title: "How to evaluate a Zig package before adding it",
      excerpt:
        "Use activity, license, minimum Zig version, release cadence, and README quality as practical signals.",
      category: "Guides",
      date: "Mar 18, 2026",
      readTime: "4 min read",
      href: "/blog/how-to-evaluate-a-zig-package",
    },
    {
      title: "Indexing public repositories from GitHub and Codeberg",
      excerpt:
        "What metadata matters for discovery and why zigpkg keeps package pages linked to their source.",
      category: "Engineering",
      date: "Mar 12, 2026",
      readTime: "5 min read",
      href: "/blog/indexing-public-repositories",
    },
    {
      title: "Making package versions easier to compare",
      excerpt:
        "Why current version, repository activity, and Zig compatibility should live near the package title.",
      category: "UX",
      date: "Mar 5, 2026",
      readTime: "3 min read",
      href: "/blog/making-package-versions-easier-to-compare",
    },
    {
      title: "What makes a Zig package discoverable",
      excerpt:
        "Names, topics, descriptions, and examples help users understand a package before opening the repo.",
      category: "Guides",
      date: "Feb 27, 2026",
      readTime: "4 min read",
      href: "/blog/what-makes-a-zig-package-discoverable",
    },
  ];

  const categories = ["All", "Guides", "Engineering", "Product", "UX"];
</script>

<svelte:head>
  <title>Blog - ZigPkg</title>
  <meta
    name="description"
    content="ZigPkg blog mockup with product notes, engineering updates, and guides for the Zig package ecosystem."
  />
</svelte:head>

<section class="relative overflow-hidden border-b border-zig-100 bg-zig-50">
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(245_158_11/0.16)_1px,transparent_0)] bg-size-[26px_26px] opacity-50"
  ></div>
  <div class="pointer-events-none absolute left-16 top-10 h-56 w-56 rounded-full bg-white/70 blur-3xl"></div>

  <div class="relative mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
    <div class="max-w-3xl">
      <p class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
        Blog
      </p>
      <h1 class="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
        Notes from the Zig package ecosystem
      </h1>
      <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        Product notes, registry updates, and practical guides for finding, evaluating, and
        publishing Zig packages.
      </p>
      <div class="mt-6 flex flex-wrap gap-2 font-mono text-[11px] text-slate-500">
        {#each categories as category (category)}
          <a
            href={`/blog?category=${category.toLowerCase()}`}
            class="rounded bg-white px-2 py-1 ring-1 ring-zig-100 transition-colors hover:text-zig-700 hover:ring-zig-300"
          >
            {category}
          </a>
        {/each}
      </div>
    </div>
  </div>
</section>

<div class="mx-auto max-w-7xl px-6 py-10 sm:px-10">
  <section
    class="grid overflow-hidden rounded-lg border border-slate-200 bg-white lg:grid-cols-[minmax(0,1fr)_22rem]"
  >
    <div class="p-6 sm:p-8">
      <div class="mb-5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-500">
        <span class="rounded bg-zig-100 px-2 py-1 font-semibold text-zig-700">
          Featured
        </span>
        <span class="inline-flex items-center gap-1">
          <Tag class="h-3.5 w-3.5" />
          {featured.category}
        </span>
      </div>
      <h2 class="max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        {featured.title}
      </h2>
      <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        {featured.excerpt}
      </p>
      <div class="mt-6 flex flex-wrap items-center gap-4 font-mono text-[11px] text-slate-400">
        <span class="inline-flex items-center gap-1.5">
          <CalendarDays class="h-3.5 w-3.5" />
          {featured.date}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <Clock3 class="h-3.5 w-3.5" />
          {featured.readTime}
        </span>
      </div>
      <a
        href={featured.href}
        class="mt-7 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 font-mono text-xs font-medium text-white transition-colors hover:bg-slate-800"
      >
        Read article
        <ArrowRight class="h-3.5 w-3.5" />
      </a>
    </div>

    <div class="border-t border-slate-200 bg-slate-50 p-6 lg:border-l lg:border-t-0 sm:p-8">
      <div
        class="flex h-full min-h-56 flex-col justify-between rounded-lg border border-zig-200 bg-zig-50 p-5"
      >
        <Newspaper class="h-8 w-8 text-zig-700" />
        <div>
          <p class="font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
            Mock publication
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            This page is ready for real posts, feeds, or markdown-backed content later.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="mt-10">
    <div class="mb-4 flex items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Latest posts
        </p>
        <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-950">
          Recent writing
        </h2>
      </div>
      <a href="/docs" class="hidden font-mono text-xs font-medium text-zig-600 hover:text-zig-700 sm:block">
        Read docs →
      </a>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      {#each posts as post (post.title)}
        <article
          class="rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-zig-300 hover:bg-zig-50/40"
        >
          <div class="mb-4 flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-400">
            <span class="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-600">
              {post.category}
            </span>
            <span>{post.date}</span>
            <span>{post.readTime}</span>
          </div>
          <h3 class="text-lg font-bold tracking-tight text-slate-900">{post.title}</h3>
          <p class="mt-2 text-sm leading-6 text-slate-500">{post.excerpt}</p>
          <a
            href={post.href}
            class="mt-5 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-zig-600 hover:text-zig-700"
          >
            Read more
            <ArrowRight class="h-3.5 w-3.5" />
          </a>
        </article>
      {/each}
    </div>
  </section>
</div>
