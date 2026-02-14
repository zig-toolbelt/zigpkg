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
    ecosystem: [
      { label: "Packages", href: "/packages" },
      { label: "Release Notes", href: "/releases" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/coockie" },
    ],
  };
</script>

<!-- Detailed Footer -->
<footer class="border-t border-gray-200 bg-white pt-16 pb-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
      <!-- Column 1 -->
      <div>
        <h4 class="font-bold text-slate-900 mb-4">Community</h4>
        <ul class="space-y-3 text-sm text-slate-500">
          {#each links.community as c}
            <li>
              <a href={c.href} class="hover:text-yellow-600 transition-colors"
                >{c.label}</a
              >
            </li>
          {/each}
        </ul>
      </div>
      <!-- Column 2 -->
      <div>
        <h4 class="font-bold text-slate-900 mb-4">Resources</h4>
        <ul class="space-y-3 text-sm text-slate-500">
          {#each links.resources as r}
            <li>
              <a href={r.href} class="hover:text-yellow-600 transition-colors">
                {r.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      <!-- Column 3 -->
      <div>
        <h4 class="font-bold text-slate-900 mb-4">Ecosystem</h4>
        <ul class="space-y-3 text-sm text-slate-500">
          {#each links.ecosystem as l}
            <li>
              <a href={l.href} class="hover:text-yellow-600 transition-colors">
                {l.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      <!-- Column 4 -->
      <div>
        <h4 class="font-bold text-slate-900 mb-4">Legal</h4>
        <ul class="space-y-3 text-sm text-slate-500">
          {#each links.legal as l}
            <li>
              <a href={l.href} class="hover:text-yellow-600 transition-colors">
                {l.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <div
      class="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400"
    >
      <p>© 2026 ZigPkg. All rights reserved.</p>
      <div class="flex items-center gap-2 mt-4 md:mt-0">
        <span>Made with</span>
        <svg class="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24"
          ><path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          /></svg
        >
        <span>for zig community</span>
      </div>
    </div>
  </div>
</footer>

<!-- 
<footer class="border-t bg-muted/30">
	<div class="container mx-auto px-4 py-12">
		<div class="grid grid-cols-2 md:grid-cols-5 gap-8">
			<div class="col-span-2 md:col-span-1">
				<a href="/" class="flex items-center space-x-2">
					<svg class="h-6 w-6" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M200 50L350 150V300L200 400L50 300V150L200 50Z" fill="#F7A41D"/>
						<path d="M200 100L300 166.67V300L200 366.67L100 300V166.67L200 100Z" fill="#1A1A1A"/>
					</svg>
					<span class="font-bold">zigpkg</span>
				</a>
				<p class="text-sm text-muted-foreground mt-4">
					The package manager for the Zig ecosystem.
				</p>
			</div>

			<div>
				<h4 class="font-semibold mb-3">About</h4>
				<ul class="space-y-2">
					{#each links.about as link}
						<li>
							<a href={link.href} class="text-sm text-muted-foreground hover:text-foreground">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h4 class="font-semibold mb-3">Resources</h4>
				<ul class="space-y-2">
					{#each links.resources as link}
						<li>
							<a href={link.href} class="text-sm text-muted-foreground hover:text-foreground">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h4 class="font-semibold mb-3">Community</h4>
				<ul class="space-y-2">
					{#each links.community as link}
						<li>
							<a href={link.href} class="text-sm text-muted-foreground hover:text-foreground">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h4 class="font-semibold mb-3">Legal</h4>
				<ul class="space-y-2">
					{#each links.legal as link}
						<li>
							<a href={link.href} class="text-sm text-muted-foreground hover:text-foreground">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
			<p class="text-sm text-muted-foreground">
				&copy; {new Date().getFullYear()} zigpkg. All rights reserved.
			</p>
			<p class="text-sm text-muted-foreground">
				Made with love for the <a href="https://ziglang.org" class="hover:text-foreground">Zig</a> community.
			</p>
		</div>
	</div>
</footer> -->
