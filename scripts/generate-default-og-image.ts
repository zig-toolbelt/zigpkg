// One-off asset generator, not part of the app runtime — run manually with
// `node --experimental-strip-types scripts/generate-default-og-image.ts`
// whenever the sitewide default card design changes. Reuses renderCard so
// the fallback image stays visually consistent with the per-package/per-owner
// dynamic cards.
import { writeFile } from 'node:fs/promises';
import { renderCard } from '../src/lib/server/og/render-card.ts';

async function main() {
	const response = await renderCard({
		eyebrow: 'Zig Package Registry',
		title: 'zigpkg',
		description: 'Discover Zig libraries, applications, and tools. Browse packages, view READMEs, and find the right code for your project.'
	});

	const bytes = Buffer.from(await response.arrayBuffer());
	await writeFile(new URL('../static/og-default.png', import.meta.url), bytes);
	console.log(`Wrote static/og-default.png (${bytes.byteLength} bytes)`);
}

main();
