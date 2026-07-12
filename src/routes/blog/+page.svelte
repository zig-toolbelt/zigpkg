<script lang="ts">
  import { ArrowRight, CalendarDays, Clock3, Tag } from "lucide-svelte";

  const featured = {
    title: "Introducing zigpkg.dev",
    excerpt:
      "We built a package registry for Zig that indexes both GitHub and Codeberg, parses build.zig.zon so you can see dependencies upfront, and syncs hourly so listings stay fresh. It's open source, actively maintained, and contributions are welcome.",
    category: "Announcement",
    date: "Jun 25, 2026",
    readTime: "3 min read",
    href: "/blog/introducing-zigpkg",
  };

  const posts = [
    {
      title: "Owner pages no longer 404 for new users",
      excerpt:
        "Signing in and clicking \"Your packages\" used to throw a 404 if you hadn't published any Zig packages yet. Now you get a proper owner page with your avatar, GitHub link, and a \"No packages yet\" placeholder.",
      category: "Updates",
      date: "Jul 12, 2026",
      readTime: "1 min read",
      href: "/blog/owner-page-jul-12-2026",
    },
    {
      title: "Account dropdown replaces accidental sign-out",
      excerpt:
        "Clicking your avatar used to sign you out immediately — one misclick and you were logged out. Now it opens a menu with your GitHub profile link, a shortcut to your packages, and a deliberate \"Sign out\" button at the bottom.",
      category: "Updates",
      date: "Jul 12, 2026",
      readTime: "1 min read",
      href: "/blog/account-dropdown-jul-12-2026",
    },
    {
      title: "Sign in with GitHub, and a calmer header",
      excerpt:
        "You can now sign in with GitHub — no email or password to set up. We also used the opportunity to clean up the header: a live star count, version and sync status moved out of your way, and a sync indicator that only speaks up when something's actually wrong.",
      category: "Updates",
      date: "Jul 5, 2026",
      readTime: "2 min read",
      href: "/blog/github-signin-jul-5-2026",
    },
    {
      title: "Correct package versions, safer install commands",
      excerpt:
        "Fixed a bug where packages with no real releases (like sokol-zig) showed a random git tag as their \"current version.\" Versions now come from build.zig.zon and semver-shaped tags only, install commands never pin to a stale ref, and the semver logic moved onto well-tested libraries instead of hand-rolled parsing.",
      category: "Updates",
      date: "Jul 4, 2026",
      readTime: "2 min read",
      href: "/blog/version-fix-jul-4-2026",
    },
    {
      title: "Favicon, license detection, and a few first-week fixes",
      excerpt:
        "A branded ZIG favicon, smarter license display, version and last-sync badges in the header, and a shared Badge component to stop repeating pill styles across the codebase.",
      category: "Updates",
      date: "Jun 25, 2026",
      readTime: "2 min read",
      href: "/blog/updates-jun-25-2026",
    },
  ];

  const categories = ["All", "Announcement", "Updates"];
</script>

<svelte:head>
  <title>Blog - ZigPkg</title>
  <meta
    name="description"
    content="Registry updates, engineering notes, and guides for the Zig package ecosystem."
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
        Registry updates, engineering notes, and practical guides for finding, evaluating, and
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
        <div class="flex h-8 w-8 items-center justify-center rounded-sm bg-zig-400 font-bold text-[11px] tracking-tight text-slate-900">
          ZIG
        </div>
        <div>
          <p class="font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
            zigpkg.dev is live
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Open-source package registry for Zig. Tag your repo
            <code class="rounded bg-zig-100 px-1 py-0.5 font-mono text-xs text-zig-800">zig-package</code>
            or
            <code class="rounded bg-zig-100 px-1 py-0.5 font-mono text-xs text-zig-800">zig-program</code>
            and it gets picked up automatically.
          </p>
        </div>
      </div>
    </div>
  </section>

  {#if posts.length > 0}
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
  {/if}
</div>
