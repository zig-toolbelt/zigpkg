<script lang="ts">
  import type { PageProps } from "./$types";
  import { ArrowRight, CalendarDays, ChevronLeft, Clock3, Newspaper, Tag } from "lucide-svelte";

  let { params }: PageProps = $props();

  const posts = [
    {
      slug: "designing-a-package-registry",
      title: "Designing a package registry for the Zig ecosystem",
      excerpt:
        "A look at the product decisions behind zigpkg: technical density, repository trust signals, and a UI that stays close to developer workflows.",
      category: "Product",
      date: "Mar 24, 2026",
      readTime: "6 min read",
      author: "ZigPkg team",
      sections: [
        {
          title: "Start with developer intent",
          body:
            "A registry page has to answer one question quickly: can I use this dependency with confidence? That means the page should prioritize current version, activity, license, compatibility, and installation before decorative content.",
        },
        {
          title: "Keep the source visible",
          body:
            "Packages are still maintained in repositories, so source identity matters. GitHub and Codeberg signals belong near the title, not hidden behind secondary panels.",
        },
        {
          title: "Use hierarchy instead of density",
          body:
            "Technical products need dense information, but density works only when hierarchy is clear. The current design uses compact cards, mono metadata, and a restrained Zig palette to keep scanning fast.",
        },
      ],
    },
    {
      slug: "how-to-evaluate-a-zig-package",
      title: "How to evaluate a Zig package before adding it",
      excerpt:
        "Use activity, license, minimum Zig version, release cadence, and README quality as practical signals.",
      category: "Guides",
      date: "Mar 18, 2026",
      readTime: "4 min read",
      author: "Registry notes",
      sections: [
        {
          title: "Check maintenance first",
          body:
            "Recent commits and issue volume are quick signals. They do not prove quality, but they can reveal whether maintainers are still engaged.",
        },
        {
          title: "Read the examples",
          body:
            "A concise README example often tells you more than a long feature list. Look for realistic setup code and a clear statement of supported Zig versions.",
        },
        {
          title: "Prefer clear releases",
          body:
            "Tagged releases make dependency updates easier to review and rollback. They also help teams discuss upgrades in pull requests.",
        },
      ],
    },
    {
      slug: "indexing-public-repositories",
      title: "Indexing public repositories from GitHub and Codeberg",
      excerpt:
        "What metadata matters for discovery and why zigpkg keeps package pages linked to their source.",
      category: "Engineering",
      date: "Mar 12, 2026",
      readTime: "5 min read",
      author: "Engineering",
      sections: [
        {
          title: "Sync what users can verify",
          body:
            "The registry should focus on public metadata that users can trace back to a repository: description, topics, stars, issues, releases, license, and README content.",
        },
        {
          title: "Normalize without hiding source",
          body:
            "A registry can normalize package presentation while still showing where the data came from. That balance keeps the UI useful without pretending to own the package.",
        },
        {
          title: "Design for incomplete data",
          body:
            "Not every repository has tags, topics, or compatibility metadata. The interface should make missing data visible without making the page feel broken.",
        },
      ],
    },
    {
      slug: "making-package-versions-easier-to-compare",
      title: "Making package versions easier to compare",
      excerpt:
        "Why current version, repository activity, and Zig compatibility should live near the package title.",
      category: "UX",
      date: "Mar 5, 2026",
      readTime: "3 min read",
      author: "Design notes",
      sections: [
        {
          title: "Version is primary metadata",
          body:
            "Developers compare versions before they compare long descriptions. The current version needs to be prominent, but still integrated with the rest of the package summary.",
        },
        {
          title: "Avoid detached badges",
          body:
            "A large standalone badge can feel like a workaround. A compact summary panel keeps the version important while preserving the registry aesthetic.",
        },
        {
          title: "Group related signals",
          body:
            "Stars, license, issues, and Zig compatibility work best as a group. Together they form a quick snapshot of package health.",
        },
      ],
    },
    {
      slug: "what-makes-a-zig-package-discoverable",
      title: "What makes a Zig package discoverable",
      excerpt:
        "Names, topics, descriptions, and examples help users understand a package before opening the repo.",
      category: "Guides",
      date: "Feb 27, 2026",
      readTime: "4 min read",
      author: "Registry notes",
      sections: [
        {
          title: "Use plain names",
          body:
            "A package name should be easy to search and easy to say in a code review. Clever names can work, but descriptions need to compensate.",
        },
        {
          title: "Write specific descriptions",
          body:
            "Generic descriptions make search results hard to scan. Explain the package category, target use case, and important constraints.",
        },
        {
          title: "Add useful topics",
          body:
            "Topics connect packages to search behavior. Choose terms that match what users would type when looking for your library.",
        },
      ],
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
      <div class="not-prose mb-8 rounded-lg border border-zig-200 bg-zig-50 p-5">
        <div class="mb-4 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
          <Newspaper class="h-4 w-4" />
          Mock article
        </div>
        <p class="text-sm leading-6 text-slate-600">
          This detail page mirrors the intended article layout before a real markdown-backed blog is connected.
        </p>
      </div>

      {#each post.sections as section (section.title)}
        <h2>{section.title}</h2>
        <p>{section.body}</p>
      {/each}

      <h2>What happens next</h2>
      <p>
        The mock content can later move into markdown files, a content collection, or a small API
        without changing the visual structure of this page.
      </p>
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
    </aside>
  </div>
</div>
