<script lang="ts">
	import { Card } from '$lib/components/ui';
</script>

<section class="py-16 bg-muted/50">
	<div class="container mx-auto px-4">
		<h2 class="text-2xl font-bold text-center mb-10">Getting Started</h2>
		<div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
			<Card class="p-6">
				<h3 class="font-semibold mb-3">1. Add dependency</h3>
				<p class="text-sm text-muted-foreground mb-4">
					Add the package URL to your build.zig.zon:
				</p>
				<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>.dependencies = .&lbrace;
    .zap = .&lbrace;
        .url = "https://zigpkg.dev/zap/0.1.0.tar.gz",
    &rbrace;,
&rbrace;</code></pre>
			</Card>

			<Card class="p-6">
				<h3 class="font-semibold mb-3">2. Fetch dependencies</h3>
				<p class="text-sm text-muted-foreground mb-4">
					Run zig fetch to download and verify:
				</p>
				<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>zig fetch --save https://zigpkg.dev/zap/0.1.0.tar.gz</code></pre>
			</Card>

			<Card class="p-6">
				<h3 class="font-semibold mb-3">3. Import in build.zig</h3>
				<p class="text-sm text-muted-foreground mb-4">
					Add the module to your build:
				</p>
				<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>const zap = b.dependency("zap", .&lbrace;&rbrace;);
exe.root_module.addImport("zap", zap.module("zap"));</code></pre>
			</Card>
		</div>
	</div>
</section>
