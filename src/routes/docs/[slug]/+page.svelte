<script lang="ts">
  import type { PageProps } from "./$types";
  import { BookOpen, CheckCircle2, ChevronLeft, Code2, Terminal } from "lucide-svelte";

  let { params }: PageProps = $props();

  const docs = [
    {
      slug: "getting-started",
      title: "Getting started",
      eyebrow: "Guide",
      description: "Install Zig, search the registry, and add your first package to a project.",
      readTime: "5 min read",
      icon: Terminal,
      sections: [
        {
          title: "Find a package",
          body:
            "Start from search or browse the package index. A good package page should make the core trade-offs visible before you open the repository.",
        },
        {
          title: "Review trust signals",
          body:
            "Check the current version, recent commits, license, issue volume, topics, and minimum Zig version. These signals help you decide whether a package is a good fit.",
        },
        {
          title: "Pin the dependency",
          body:
            "Copy the install command from the package page and commit the selected version so future builds remain predictable.",
        },
      ],
      command: "zig fetch --save https://github.com/example/package/archive/v1.2.0.tar.gz",
    },
    {
      slug: "package-metadata",
      title: "Package metadata",
      eyebrow: "Reference",
      description: "Understand versions, repository activity, licenses, topics, and Zig compatibility.",
      readTime: "7 min read",
      icon: BookOpen,
      sections: [
        {
          title: "Version",
          body:
            "The current version should be close to the package title because it is one of the first pieces of information developers compare.",
        },
        {
          title: "Repository activity",
          body:
            "Commit recency, stars, and open issues are not quality guarantees, but they quickly show whether a package is active enough for your use case.",
        },
        {
          title: "Compatibility",
          body:
            "Minimum Zig version keeps dependency decisions grounded in the toolchain you actually run in production.",
        },
      ],
      command: "zigpkg metadata owner/repository --format json",
    },
    {
      slug: "publishing-checklist",
      title: "Publishing checklist",
      eyebrow: "Checklist",
      description: "Prepare a repository so it can be discovered, indexed, and trusted by Zig users.",
      readTime: "6 min read",
      icon: CheckCircle2,
      sections: [
        {
          title: "Write a clear README",
          body:
            "Explain what the package does, show a small example, document supported Zig versions, and link to generated docs if they exist.",
        },
        {
          title: "Tag releases",
          body:
            "Stable tags make package pages easier to scan and give users a predictable version to install.",
        },
        {
          title: "Use helpful topics",
          body:
            "Topics make discovery work. Prefer specific tags such as parser, http, cli, game-dev, crypto, or database.",
        },
      ],
      command: "git tag v0.1.0 && git push origin v0.1.0",
    },
    {
      slug: "build-integration",
      title: "Build integration",
      eyebrow: "Build",
      description: "Wire package dependencies into your build.zig.zon and keep updates predictable.",
      readTime: "8 min read",
      icon: Code2,
      sections: [
        {
          title: "Keep dependency declarations explicit",
          body:
            "Make package names match their usage in build.zig so contributors can understand the dependency graph quickly.",
        },
        {
          title: "Prefer tagged versions",
          body:
            "Pinned tags are easier to audit than moving branch references and make CI failures easier to reproduce.",
        },
        {
          title: "Document update steps",
          body:
            "A short maintenance note in the README helps future maintainers update dependencies without guessing.",
        },
      ],
      command: "zig build --summary all",
    },
  ];

  const doc = $derived(docs.find((item) => item.slug === params.slug) ?? docs[0]);
  const DocIcon = $derived(doc.icon);
</script>

<svelte:head>
  <title>{doc.title} - ZigPkg Docs</title>
  <meta name="description" content={doc.description} />
</svelte:head>

<section class="border-b border-zig-100 bg-zig-50">
  <div class="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-14">
    <a
      href="/docs"
      class="mb-6 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-slate-500 transition-colors hover:text-zig-700"
    >
      <ChevronLeft class="h-3.5 w-3.5" />
      Back to docs
    </a>

    <div class="max-w-3xl">
      <p class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
        {doc.eyebrow}
      </p>
      <h1 class="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
        {doc.title}
      </h1>
      <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        {doc.description}
      </p>
      <div class="mt-5 flex flex-wrap gap-2 font-mono text-[11px] text-slate-500">
        <span class="rounded bg-white px-2 py-1 ring-1 ring-zig-100">Mock docs page</span>
        <span class="rounded bg-white px-2 py-1 ring-1 ring-zig-100">{doc.readTime}</span>
      </div>
    </div>
  </div>
</section>

<div class="mx-auto max-w-7xl px-6 py-10 sm:px-10">
  <div class="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
    <aside class="rounded-lg border border-slate-200 bg-white p-4 lg:sticky lg:top-20">
      <p class="px-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Documentation
      </p>
      <nav class="mt-3 space-y-1 text-sm">
        {#each docs as item (item.slug)}
          <a
            href={`/docs/${item.slug}`}
            class="block rounded-md px-3 py-2 transition-colors {item.slug === doc.slug
              ? 'bg-zig-100 font-medium text-zig-700'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}"
          >
            {item.title}
          </a>
        {/each}
      </nav>
    </aside>

    <article
      class="prose prose-slate max-w-none rounded-lg border border-slate-200 bg-white p-6 sm:p-8 prose-headings:font-bold prose-a:text-zig-600 prose-a:no-underline hover:prose-a:underline"
    >
      <div class="not-prose mb-8 flex items-center gap-4 rounded-lg border border-zig-200 bg-zig-50 p-4">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zig-100 text-zig-700">
          <DocIcon class="h-4 w-4" />
        </div>
        <p class="text-sm leading-6 text-slate-600">
          This mock article shows the intended detail-page layout before real docs content is wired in.
        </p>
      </div>

      {#each doc.sections as section (section.title)}
        <h2>{section.title}</h2>
        <p>{section.body}</p>
      {/each}

      <h2>Example command</h2>
      <pre><code>{doc.command}</code></pre>

      <h2>Next steps</h2>
      <ul>
        <li>Replace this local mock content with markdown or CMS-backed documentation.</li>
        <li>Add route-specific metadata once the final docs structure is stable.</li>
        <li>Keep examples short enough to scan from a package page context.</li>
      </ul>
    </article>
  </div>
</div>
