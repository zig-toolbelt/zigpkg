<script lang="ts">
  import { BookOpen, Code2, Compass, PackagePlus, Rocket, ShieldCheck } from "lucide-svelte";

  const guides = [
    {
      title: "Getting started",
      description: "Install Zig, search the registry, and add your first package to a project.",
      href: "/docs/getting-started",
      icon: Rocket,
    },
    {
      title: "Package metadata",
      description: "Understand versions, repository activity, licenses, topics, and Zig compatibility.",
      href: "/docs/package-metadata",
      icon: BookOpen,
    },
    {
      title: "Publishing checklist",
      description: "Prepare a repository so it can be discovered, indexed, and trusted by Zig users.",
      href: "/docs/publishing-checklist",
      icon: PackagePlus,
    },
    {
      title: "Build integration",
      description: "Wire package dependencies into your build.zig.zon and keep updates predictable.",
      href: "/docs/build-integration",
      icon: Code2,
    },
  ];

  const steps = [
    "Search for a package by name, topic, or repository owner.",
    "Review activity, license, minimum Zig version, and README quality.",
    "Copy the install command and pin the version in your project.",
  ];

  const principles = [
    {
      title: "Public metadata only",
      description: "zigpkg indexes open repositories and keeps package details close to their source.",
    },
    {
      title: "Compatibility first",
      description: "Version and Zig compatibility signals are surfaced before deep implementation details.",
    },
    {
      title: "Registry, not marketplace",
      description: "The UI stays technical and focused on helping developers choose dependencies faster.",
    },
  ];
</script>

<svelte:head>
  <title>Documentation - ZigPkg</title>
  <meta
    name="description"
    content="ZigPkg documentation mockup for discovering, evaluating, and publishing Zig packages."
  />
</svelte:head>

<section class="relative overflow-hidden border-b border-zig-100 bg-zig-50">
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(245_158_11/0.16)_1px,transparent_0)] bg-size-[26px_26px] opacity-50"
  ></div>
  <div class="pointer-events-none absolute right-10 top-8 h-56 w-56 rounded-full bg-white/70 blur-3xl"></div>

  <div class="relative mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
    <div class="max-w-3xl">
      <p class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
        Documentation
      </p>
      <h1 class="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
        Learn how to discover and publish Zig packages
      </h1>
      <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        A practical guide to using zigpkg as a focused registry: find packages, evaluate
        maintenance signals, and prepare repositories for indexing.
      </p>
      <div class="mt-6 flex flex-wrap gap-2 font-mono text-[11px] text-slate-500">
        <span class="rounded bg-white px-2 py-1 ring-1 ring-zig-100">Mock content</span>
        <span class="rounded bg-white px-2 py-1 ring-1 ring-zig-100">Developer guide</span>
        <span class="rounded bg-white px-2 py-1 ring-1 ring-zig-100">Registry workflow</span>
      </div>
    </div>
  </div>
</section>

<div class="mx-auto max-w-7xl px-6 py-10 sm:px-10">
  <div class="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
    <aside class="rounded-lg border border-slate-200 bg-white p-4 lg:sticky lg:top-20">
      <p class="px-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        On this page
      </p>
      <nav class="mt-3 space-y-1 text-sm">
        <a href="/docs/getting-started" class="block rounded-md bg-zig-100 px-3 py-2 font-medium text-zig-700">
          Getting started
        </a>
        <a href="/docs/package-metadata" class="block rounded-md px-3 py-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
          Package metadata
        </a>
        <a href="/docs/publishing-checklist" class="block rounded-md px-3 py-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
          Publishing checklist
        </a>
        <a href="/docs/build-integration" class="block rounded-md px-3 py-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
          Build integration
        </a>
      </nav>
    </aside>

    <div class="space-y-8">
      <section class="grid gap-3 sm:grid-cols-2">
        {#each guides as guide (guide.title)}
          {@const Icon = guide.icon}
          <a
            href={guide.href}
            class="group rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-zig-300 hover:bg-zig-50/40"
          >
            <div
              class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zig-200 bg-zig-100 text-zig-700"
            >
              <Icon class="h-4 w-4" />
            </div>
            <h2 class="text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-zig-800">
              {guide.title}
            </h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">{guide.description}</p>
          </a>
        {/each}
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
        <div class="flex items-start gap-4">
          <div
            class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 sm:flex"
          >
            <Compass class="h-4 w-4" />
          </div>
          <div>
            <p class="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Quick path
            </p>
            <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Add a dependency with confidence
            </h2>
            <ol class="mt-5 space-y-3">
              {#each steps as step, index (step)}
                <li class="flex gap-3 text-sm leading-6 text-slate-600">
                  <span
                    class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zig-100 font-mono text-[11px] font-bold text-zig-700"
                  >
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              {/each}
            </ol>
          </div>
        </div>
      </section>

      <section class="grid gap-3 md:grid-cols-3">
        {#each principles as principle (principle.title)}
          <div class="rounded-lg border border-slate-200 bg-white p-5">
            <ShieldCheck class="mb-4 h-4 w-4 text-zig-600" />
            <h3 class="font-bold tracking-tight text-slate-900">{principle.title}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-500">{principle.description}</p>
          </div>
        {/each}
      </section>
    </div>
  </div>
</div>
