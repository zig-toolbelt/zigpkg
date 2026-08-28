import { buildCanonical } from "$lib/seo";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => ({
  seo: {
    title: "Zig School — the new std.Io in six missions",
    description:
      "An interactive tutorial on Zig 0.16 std.Io for JavaScript and TypeScript developers: async, await, cancel, and why asynchrony is not concurrency.",
    url: buildCanonical("/school"),
  },
});
