<script lang="ts">
  import type { PageProps } from "./$types";
  import { ArrowRight, CalendarDays, ChevronLeft, Clock3, Tag } from "lucide-svelte";

  let { params }: PageProps = $props();

  const posts = [
    {
      slug: "introducing-zigpkg",
      title: "Introducing zigpkg.dev",
      excerpt:
        "We built a package registry for Zig that indexes both GitHub and Codeberg, parses build.zig.zon so you can see dependencies upfront, and syncs hourly so listings stay fresh. It's open source, actively maintained, and contributions are welcome.",
      category: "Announcement",
      date: "Jun 25, 2026",
      readTime: "3 min read",
      author: "zigpkg team",
      sections: [
        {
          title: "Why we built it",
          body:
            "The company we work at uses Zig heavily in internal development. Finding packages meant spelunking through GitHub and Codeberg topic searches, which got old fast — we just wanted one place to discover things. Before writing our own we looked at zigistry.dev, aquila.red, zig.pm, and astrolabe.pm — most are either unmaintained or missing the features we needed, so we built zigpkg.dev.",
        },
        {
          title: "What it does",
          body:
            "Browse and search libraries and applications. Filter by topic, owner, type, or A–Z. Every package page renders the README with proper Zig syntax highlighting, shows stars / forks / license / version, the file tree, and version history. It also parses each repo's build.zig.zon and lists the package's dependencies — so you can see what a package pulls in before you add it. The registry indexes both GitHub and Codeberg, so packages hosted on a Forgejo instance won't be invisible. Want your package listed? Tag the repo zig-package or zig-library (libraries) / zig-program (applications) and it gets picked up automatically on the next hourly sync.",
        },
        {
          title: "What's next",
          body:
            "This isn't a weekend throwaway — we use it internally, so it's going to stick around and keep getting maintained. The codebase is MIT-licensed and open source, and we'd love contributors: feature ideas, bug reports, pull requests, or just telling us what annoys you. Join the discussion:",
        },
      ],
      links: [
        {
          label: "Ziggit thread",
          url: "https://ziggit.dev/t/an-open-source-package-registry-where-you-can-browse-search-and-actually-discover-zig-libraries-and-applications/16335",
        },
        {
          label: "Zig Discord",
          url: "https://discord.com/channels/605571803288698900/1519615122463526993/1519615122463526993",
        },
      ],
    },
    {
      slug: "updates-jun-25-2026",
      title: "Favicon, license detection, and a few first-week fixes",
      excerpt:
        "A few visible improvements landed today: a branded ZIG favicon, smarter license display that links to a repo's LICENSE file, version and last-sync badges in the header, and a shared Badge component to stop repeating pill styles across the codebase.",
      category: "Updates",
      date: "Jun 25, 2026",
      readTime: "3 min read",
      author: "zigpkg team",
      sections: [
        {
          title: "Custom favicon",
          body:
            "The browser tab was showing the default SvelteKit Svelte logo — the orange flame. Not exactly on-brand. It's now replaced with a ZIG badge: the same gold rounded square you see in the header.",
        },
        {
          title: "Smarter license display",
          body:
            "Codeberg's API doesn't expose license information, so all Codeberg packages showed \"Unknown\". Same for GitHub repos without a configured SPDX identifier. Now, when the license field is empty, the package page checks whether a LICENSE, LICENSE.md, LICENCE, or COPYING file exists in the repo root — if it does, \"Unknown\" becomes a clickable link to that file. No extra API calls: the file tree is already fetched for every package page.",
        },
        {
          title: "Version and sync badges in the header",
          body:
            "The header now shows two small pills on wide screens: the current app version (read from package.json at build time) and the timestamp of the last successful package sync (queried live from the database). The sync time updates on every page load, so it reflects the actual state of the index — not a stale build date.",
        },
        {
          title: "Shared Badge component",
          body:
            "Pill badge styles were scattered across a handful of components with copy-pasted Tailwind classes. They're now consolidated into a single Badge component with named variants — zig (header meta badges), topic (clickable keyword pills), subtle (version labels), and muted (tab counters). Less drift, easier to restyle globally.",
        },
      ],
      links: undefined,
    },
  ];

  const post = $derived(posts.find((item) => item.slug === params.slug) ?? posts[0]);
  const relatedPosts = $derived(posts.filter((item) => item.slug !== post.slug).slice(0, 3));
</script>

<svelte:head>
  <title>{post.title} - ZigPkg Blog</title>
  <meta name="description" content={post.excerpt} />
</svelte:head>

<section class="border-b border-zig-100 bg-zig-50">
  <div class="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-14">
    <a
      href="/blog"
      class="mb-6 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-slate-500 transition-colors hover:text-zig-700"
    >
      <ChevronLeft class="h-3.5 w-3.5" />
      Back to blog
    </a>

    <div class="max-w-3xl">
      <p class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
        {post.category}
      </p>
      <h1 class="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
        {post.title}
      </h1>
      <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        {post.excerpt}
      </p>
      <div class="mt-5 flex flex-wrap items-center gap-4 font-mono text-[11px] text-slate-500">
        <span class="inline-flex items-center gap-1.5">
          <CalendarDays class="h-3.5 w-3.5" />
          {post.date}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <Clock3 class="h-3.5 w-3.5" />
          {post.readTime}
        </span>
        <span class="rounded bg-white px-2 py-1 ring-1 ring-zig-100">{post.author}</span>
      </div>
    </div>
  </div>
</section>

<div class="mx-auto max-w-7xl px-6 py-10 sm:px-10">
  <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
    <article
      class="prose prose-slate max-w-none rounded-lg border border-slate-200 bg-white p-6 sm:p-8 prose-headings:font-bold prose-a:text-zig-600 prose-a:no-underline hover:prose-a:underline"
    >
      {#each post.sections as section (section.title)}
        <h2>{section.title}</h2>
        <p>{section.body}</p>
      {/each}

      {#if post.links}
        <ul>
          {#each post.links as link (link.url)}
            <li>
              <a href={link.url} target="_blank" rel="noopener">{link.label}</a>
            </li>
          {/each}
        </ul>
      {/if}
    </article>

    <aside class="space-y-4 lg:sticky lg:top-20">
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <p class="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Article
        </p>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Category</dt>
            <dd class="inline-flex items-center gap-1 font-medium text-slate-900">
              <Tag class="h-3.5 w-3.5 text-zig-600" />
              {post.category}
            </dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Read time</dt>
            <dd class="font-medium text-slate-900">{post.readTime}</dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt class="text-slate-500">Published</dt>
            <dd class="font-medium text-slate-900">{post.date}</dd>
          </div>
        </dl>
      </div>

      {#if relatedPosts.length > 0}
        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <p class="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Related posts
          </p>
          <div class="mt-4 space-y-3">
            {#each relatedPosts as related (related.slug)}
              <a
                href={`/blog/${related.slug}`}
                class="block rounded-md p-2 transition-colors hover:bg-slate-100"
              >
                <span class="text-sm font-medium leading-5 text-slate-900">{related.title}</span>
                <span class="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-zig-600">
                  Read post
                  <ArrowRight class="h-3.5 w-3.5" />
                </span>
              </a>
            {/each}
          </div>
        </div>
      {/if}
    </aside>
  </div>
</div>
