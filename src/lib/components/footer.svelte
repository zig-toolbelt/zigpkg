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

<footer class="border-t border-slate-200 bg-white">
  <div class="mx-auto max-w-7xl px-6 sm:px-10 py-12">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
      {#each columns as col (col.title)}
        <div>
          <h4 class="font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-3">
            {col.title}
          </h4>
          <ul class="space-y-2 text-sm text-slate-600">
            {#each col.items as item (item.href)}
              <li>
                <a href={item.href} class="hover:text-zig-600 transition-colors">
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>

    <div
      class="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs text-slate-400"
    >
      <p>© 2026 zigpkg</p>
      <p>Made for the Zig community</p>
    </div>
  </div>
</footer>
