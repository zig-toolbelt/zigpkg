<script lang="ts">
  const links = {
    community: [
      { label: "Discord", href: "https://discord.gg/zig" },
      {
        label: "Twitter",
        href: "https://x.com/i/communities/1830711127354851778",
      },
      { label: "GitHub", href: "https://github.com/zig-toolbelt/zigpkg" },
    ],
    resources: [
      { label: "Documentation", href: "/docs" },
      { label: "Blog", href: "/blog" },
    ],
    ecosystem: [{ label: "Packages", href: "/packages" }],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie" },
    ],
  };

  const columns = [
    { title: "Community", items: links.community },
    { title: "Resources", items: links.resources },
    { title: "Ecosystem", items: links.ecosystem },
    { title: "Legal", items: links.legal },
  ];
</script>

<footer class="border-t border-slate-200 bg-slate-50/80">
  <div class="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-14">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:gap-16">
      <div class="max-w-sm">
        <a
          href="/"
          class="group inline-flex items-center gap-2.5 rounded-lg -ml-2 px-2 py-1.5 transition-colors hover:bg-white"
        >
          <div
            class="flex h-8 w-8 items-center justify-center rounded-sm bg-zig-400 font-bold text-[11px] tracking-tight text-slate-900 shadow-sm shadow-zig-200/60"
          >
            ZIG
          </div>
          <span
            class="text-base font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-zig-700"
          >
            packages
          </span>
        </a>
        <p class="mt-4 text-sm leading-6 text-slate-500">
          A focused package registry for discovering Zig libraries, applications, and tools.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-4">
        {#each columns as col (col.title)}
          <div>
            <h4
              class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              {col.title}
            </h4>
            <ul class="space-y-2 text-sm text-slate-600">
              {#each col.items as item (item.href)}
                <li>
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : null}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : null}
                    class="transition-colors hover:text-zig-700"
                  >
                    {item.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>

    <div
      class="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 font-mono text-xs text-slate-500 sm:flex-row sm:items-center"
    >
      <p>© 2026 zigpkg</p>
      <p class="text-slate-400">Made for the Zig community</p>
    </div>
  </div>
</footer>
