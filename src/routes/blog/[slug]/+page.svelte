<script lang="ts">
  import type { PageProps } from "./$types";
  import { ArrowRight, CalendarDays, ChevronLeft, Clock3, Tag, CircleAlert, CircleCheck } from "lucide-svelte";

  let { params }: PageProps = $props();

  type InlinePart = { text: string; strong?: boolean; code?: boolean };

  // Minimal inline markup for post copy: **bold** and `code`. Every piece of
  // text still goes through Svelte's normal (escaped) interpolation in the
  // template below — no {@html}, so there's no injection surface at all.
  function parseInline(text: string): InlinePart[] {
    const parts: InlinePart[] = [];
    const pattern = /\*\*(.+?)\*\*|`(.+?)`/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) {
      if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index) });
      if (match[1] !== undefined) parts.push({ text: match[1], strong: true });
      else parts.push({ text: match[2], code: true });
      lastIndex = pattern.lastIndex;
    }
    if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex) });
    return parts;
  }

  type Section = { title: string; body?: string; bullets?: string[] };
  type Callout = { before: { label: string; value: string }; after: { label: string; value: string } };
  type Post = {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readTime: string;
    author: string;
    callout?: Callout;
    sections: Section[];
    links?: { label: string; url: string }[];
  };

  const posts: Post[] = [
    {
      slug: "manual-submissions-jul-26-2026",
      title: "Submit packages by hand, and a moderation queue",
      excerpt:
        "Popular Zig packages without a topic tag — like karlseguin/http.zig — used to be invisible to the registry. Now any signed-in user can submit a package from GitHub or Codeberg, and moderators review each submission before it goes live.",
      category: "Updates",
      date: "Jul 26, 2026",
      readTime: "3 min read",
      author: "zigpkg team",
      callout: {
        before: { label: "Before", value: "No topic tag → not indexed" },
        after: { label: "After", value: "Submit → review → live" },
      },
      sections: [
        {
          title: "The problem",
          body:
            "The sync worker discovers packages by crawling GitHub and Codeberg for repos tagged `zig-package`, `zig-library`, or `zig-program`. That works well — but plenty of popular Zig packages never added a topic tag. `karlseguin/http.zig`, one of the most-used HTTP servers in the ecosystem, was completely invisible on the registry because of it. There was no way for a user to add it by hand.",
        },
        {
          title: "What changed",
          bullets: [
            "**A submit form** at `/submit` — paste a repo URL (`https://github.com/karlseguin/http.zig`) or an `owner/repo` shorthand, and the registry fetches the metadata, checks for duplicates, and queues the package for review.",
            "**A moderation queue** at `/moderation` — moderators see every pending submission with the repo's stars, license, topics, and validation signals, then approve or reject with a reason.",
            "**Automatic validation** — each submission is checked for its primary language (is it actually Zig?), the presence of `build.zig.zon`, and `.zig` files in the root. Suspicious packages are flagged for the moderator but never blocked outright — the decision is human.",
            "**Flagged packages view** — already-approved packages that look suspicious (sync-origin repos whose primary language isn't Zig, or that are missing `build.zig.zon`) surface in a separate tab so moderators can clean them up.",
          ],
        },
        {
          title: "Who can submit and moderate",
          body:
            "Any signed-in GitHub user can submit a package — same trust model as the sync worker, which indexes any public repo carrying the topic tag. Moderators are members of a configured GitHub team (set via `MODERATOR_ORG` and `MODERATOR_TEAM` env vars), verified through the user's own OAuth token with the `read:org` scope.",
        },
        {
          title: "Under the hood",
          bullets: [
            "Every package now carries a `status` (`approved`, `pending`, `rejected`) and an `origin` (`sync` or `manual`). The sync worker writes `approved` on insert but never overwrites `status` on update — so a moderator's rejection sticks even if the repo gets re-discovered.",
            "Validation signals (`primary_language`, `has_zig_files`, `has_build_zig_zon`) are cached on the package row at submission time, so the moderator sees them without re-fetching.",
            "All public queries — search, browse, stats, sitemap — now filter `status = 'approved'`, so pending and rejected packages are invisible to visitors.",
            "Moderator checks are cached for 5 minutes per user to avoid hitting the GitHub API on every page load.",
          ],
        },
      ],
      links: undefined,
    },
    {
      slug: "link-previews-jul-12-2026",
      title: "Package links now unfurl with real previews",
      excerpt:
        "Pasting a package or profile link into Slack, Discord, or a forum used to show the generic zigpkg site card. Now you get the real name and description, plus a generated preview image with stars, license, and the maintainer's avatar — like sharing a GitHub repo.",
      category: "Updates",
      date: "Jul 12, 2026",
      readTime: "2 min read",
      author: "zigpkg team",
      callout: {
        before: { label: "Before", value: "zigpkg — Zig Package Registry" },
        after: { label: "After", value: "http.zig — An HTTP/1.1 server for zig" },
      },
      sections: [
        {
          title: "The problem",
          body:
            "Every page set its own title and description tags on top of the site-wide defaults — but SvelteKit doesn't replace a layout's `<svelte:head>` with a page's, it concatenates both. The rendered HTML ended up with two `og:title` tags and two `og:description` tags, generic ones first. Most link-unfurl bots read the first tag they find, so shares kept showing \"zigpkg — Zig Package Registry\" no matter which package you linked to. The fallback image had the same problem one level deeper: it pointed at a file that didn't exist.",
        },
        {
          title: "What changed",
          bullets: [
            "**One set of tags, one source of truth** — title, description, and Open Graph/Twitter Card tags are now built in a single place and filled in per page, so there's nothing left for a scraper to pick the wrong copy of.",
            "**Package and owner pages get a real preview image** — name, stars, license, and the maintainer's avatar, generated on the fly, instead of the plain site logo.",
            "**The sitewide fallback image works again** — every other page (home, docs) now points at an image that actually exists.",
          ],
        },
        {
          title: "Under the hood",
          body: "Preview images render server-side with Satori — the same approach GitHub and Vercel use for their social cards:",
          bullets: [
            "No headless browser or native binary to deploy, just WASM, so it runs fine anywhere the app already does.",
            "Each package and owner page exposes its own `/og-image` route; the PNG is generated per URL and cached by whatever platform is unfurling it, so repeat shares are free.",
          ],
        },
      ],
      links: undefined,
    },
    {
      slug: "owner-page-jul-12-2026",
      title: "Owner pages no longer 404 for new users",
      excerpt:
        "Signing in and clicking \"Your packages\" used to throw a 404 if you hadn't published any Zig packages yet. Now you get a proper owner page with your avatar, GitHub link, and a \"No packages yet\" placeholder — no more confusing error pages.",
      category: "Updates",
      date: "Jul 12, 2026",
      readTime: "1 min read",
      author: "zigpkg team",
      callout: {
        before: { label: "Before", value: "404 Owner not found" },
        after: { label: "After", value: "Owner page, no packages yet" },
      },
      sections: [
        {
          title: "The problem",
          body:
            "A new user would sign in, click their avatar, pick \"Your packages,\" and land on a 404 page. The lookup only scanned the `packages` table — if your repos weren't indexed (or you simply hadn't tagged any with `zig-package`), the page assumed the owner didn't exist at all.",
        },
        {
          title: "What changed",
          body: "The owner route now checks the `users` table separately from the `packages` table:",
          bullets: [
            "**Owner exists, zero packages** → a proper owner page with your avatar, GitHub profile link, and a \"No packages yet\" placeholder instead of a 404.",
            "**Owner doesn't exist** → still a 404.",
            "**Different letter case** → redirects to the canonical username, same as before.",
          ],
        },
      ],
      links: undefined,
    },
    {
      slug: "account-dropdown-jul-12-2026",
      title: "Account dropdown replaces accidental sign-out",
      excerpt:
        "Clicking your avatar used to sign you out immediately — one misclick and you were logged out. Now it opens a menu with your GitHub profile link, a shortcut to your packages, and a deliberate \"Sign out\" button at the bottom.",
      category: "Updates",
      date: "Jul 12, 2026",
      readTime: "1 min read",
      author: "zigpkg team",
      callout: {
        before: { label: "Before", value: "Click avatar → sign out" },
        after: { label: "After", value: "Click avatar → menu" },
      },
      sections: [
        {
          title: "The problem",
          body:
            "Since we shipped sign-in, the avatar in the header had exactly one job: sign you out. That meant one accidental click while trying to open a new tab, and you were back at the Sign in button wondering where your session went.",
        },
        {
          title: "What changed",
          body: "The avatar is now a proper account menu:",
          bullets: [
            "**Your username** and a link to your **GitHub profile** at the top.",
            "A **\"Your packages\"** shortcut that takes you straight to `/packages/{username}` — no search required.",
            "**Sign out** is now a deliberate button at the bottom of the menu, not the only thing that happens on click.",
            "Clicking outside the menu, or clicking the avatar again, closes it.",
          ],
        },
        {
          title: "Under the hood",
          body:
            "The `htmlUrl` from your GitHub profile is now included in the session, so the menu can show a link back without an extra query. The dropdown lives in the same `header.svelte` component with a `$state` toggle and a document click listener, keeping the implementation self-contained.",
        },
      ],
      links: undefined,
    },
    {
      slug: "github-signin-jul-5-2026",
      title: "Sign in with GitHub, and a calmer header",
      excerpt:
        "You can now sign in with GitHub — no email or password to set up. We also used the opportunity to clean up the header: a live star count, version and sync status moved out of your way, and a sync indicator that only speaks up when something's actually wrong.",
      category: "Updates",
      date: "Jul 5, 2026",
      readTime: "2 min read",
      author: "zigpkg team",
      sections: [
        {
          title: "Sign in with GitHub",
          body: "There's a `Sign in` button in the header now. That's the whole setup:",
          bullets: [
            "**GitHub only, on purpose** — no email, no password, nothing else to create or remember. Your GitHub identity is the account.",
            "First sign-in **is** registration — there's no separate sign-up step.",
            "If you already maintain a package listed in the registry, signing in links to that same profile automatically instead of creating a second, disconnected one.",
            "Sessions are real server-side records, not just a signed cookie — signing out actually invalidates the session rather than just clearing a token that stays valid until it expires.",
          ],
        },
        {
          title: "A calmer header",
          body: "Wiring up sign-in was a good excuse to clean up a header that had picked up a few things it didn't need:",
          bullets: [
            "A **live GitHub star count** now sits next to the repo link.",
            "The app version and the raw sync timestamp moved out of the primary nav — version lives in the footer now, and sync status is a small, quiet indicator instead of a pair of competing badges.",
            "That indicator still shows the exact freshness (`Updated 12m ago`, hover for the precise time) — it just turns into a clear warning if the registry hasn't synced in over 90 minutes, instead of asking you to notice a rotating number.",
          ],
        },
        {
          title: "Under the hood",
          body: "The account model reuses infrastructure that already existed instead of adding a parallel one:",
          bullets: [
            "Sign-in writes into the same `users` table the sync worker already maintains, keyed by the same `(source, source_id)` identity — one row per GitHub account, not a second \"registered user\" table living next to the package-owner cache.",
            "Sessions use Auth.js's database strategy against our own schema, not a bolted-on JWT — sign-out deletes the row server-side.",
            "No new moving parts to run — just a GitHub OAuth App to configure.",
          ],
        },
      ],
      links: undefined,
    },
    {
      slug: "version-fix-jul-4-2026",
      title: "Correct package versions, safer install commands",
      excerpt:
        "Fixed a bug where packages with no real releases (like sokol-zig) showed a random git tag as their \"current version.\" Versions now come from build.zig.zon and semver-shaped tags only, install commands never pin to a stale ref, and the semver logic moved onto well-tested libraries instead of hand-rolled parsing.",
      category: "Updates",
      date: "Jul 4, 2026",
      readTime: "2 min read",
      author: "zigpkg team",
      callout: {
        before: { label: "Before", value: "bindings-cleanup" },
        after: { label: "After", value: "Updated 3 days ago" },
      },
      sections: [
        {
          title: "The bug: a git tag isn't always a version",
          body:
            "A maintainer pointed out that sokol-zig showed `bindings-cleanup` as its current version. That's not a release — it's a marker tag created ages ago to flag a breaking change, on a repo that doesn't use tags for versioning at all. The registry was picking **whichever tag was created most recently** and showing it verbatim, with no check that it actually looked like a version. Any repo with a stray non-version tag newer than its last real release hit the same bug — and the generated `zig fetch` install command inherited the same garbage tag as its pinned ref.",
        },
        {
          title: "How it's fixed",
          body: "Version display now follows a strict priority, then stops trusting the manifest alone for anything that ends up in a command you'll run:",
          bullets: [
            "**Priority order**: the version declared in `build.zig.zon`, then the highest semver-shaped git tag (`v1.2.3`, `1.2.3-rc.1`, and similar) — anything else is ignored.",
            "**No resolvable version?** The page shows `Updated N days ago` instead, matching how other Zig registries handle untagged repos.",
            "**Install commands are safer**: the pinned ref only ever comes from a real, existing tag, never from the manifest's declared version on its own — so a stale or non-existent ref can never end up in a copy-pasted `zig fetch` command.",
          ],
        },
        {
          title: "Under the hood",
          body: "The version-comparison logic used to be hand-rolled on both sides. Not anymore:",
          bullets: [
            "The sync worker now delegates to `golang.org/x/mod/semver`, the frontend to the `semver` npm package — both well-tested, spec-correct, and no longer our custom regex to maintain.",
            "That fixed a subtle bug **for free**: prerelease tags like `rc.9` and `rc.10` used to compare as plain strings and sort in the wrong order.",
            "The worker's tag scan is now a named, documented, bounded window — not a couple of unexplained magic numbers.",
          ],
        },
      ],
      links: undefined,
    },
    {
      slug: "introducing-zigpkg",
      title: "Introducing zigpkg.dev",
      excerpt:
        "We built a package registry for Zig that indexes both GitHub and Codeberg, parses build.zig.zon so you can see dependencies upfront, and syncs hourly so listings stay fresh. It's open source, actively maintained, and contributions are welcome.",
      category: "Announcement",
      date: "Jun 25, 2026",
      readTime: "3 min read",
      author: "zigpkg team",
      sections: [
        {
          title: "Why we built it",
          body:
            "The company we work at uses Zig heavily in internal development. Finding packages meant spelunking through GitHub and Codeberg topic searches, which got old fast — we just wanted **one place to discover things**. Before writing our own we looked at zigistry.dev, aquila.red, zig.pm, and astrolabe.pm — most are either unmaintained or missing the features we needed, so we built zigpkg.dev.",
        },
        {
          title: "What it does",
          body: "One registry, both hosts, no submission form to fill out:",
          bullets: [
            "**Browse and search** libraries and applications, filterable by topic, owner, type, or A–Z.",
            "Every package page renders the **README** with proper Zig syntax highlighting, plus stars / forks / license / version, the file tree, and version history.",
            "Parses each repo's `build.zig.zon` and lists its **dependencies** — see what a package pulls in before you add it.",
            "Indexes both **GitHub and Codeberg**, so packages hosted on a Forgejo instance won't be invisible.",
            "Tag your repo `zig-package` / `zig-library` (libraries) or `zig-program` (applications) and it's **picked up automatically** on the next hourly sync.",
          ],
        },
        {
          title: "What's next",
          body:
            "This isn't a weekend throwaway — we use it internally, so it's going to stick around and keep getting maintained. The codebase is **MIT-licensed and open source**, and we'd love contributors: feature ideas, bug reports, pull requests, or just telling us what annoys you. Join the discussion:",
        },
      ],
      links: [
        {
          label: "Ziggit thread",
          url: "https://ziggit.dev/t/an-open-source-package-registry-where-you-can-browse-search-and-actually-discover-zig-libraries-and-applications/16335",
        },
        {
          label: "Zig Discord",
          url: "https://discord.com/channels/605571803288698900/1519615122463526993/1519615122463526993",
        },
      ],
    },
    {
      slug: "updates-jun-25-2026",
      title: "Favicon, license detection, and a few first-week fixes",
      excerpt:
        "A few visible improvements landed today: a branded ZIG favicon, smarter license display that links to a repo's LICENSE file, version and last-sync badges in the header, and a shared Badge component to stop repeating pill styles across the codebase.",
      category: "Updates",
      date: "Jun 25, 2026",
      readTime: "3 min read",
      author: "zigpkg team",
      callout: {
        before: { label: "Before", value: "License: Unknown" },
        after: { label: "After", value: "Unknown → LICENSE file" },
      },
      sections: [
        {
          title: "Custom favicon",
          body:
            "The browser tab was showing the default SvelteKit flame — not exactly on-brand. It's now a **ZIG badge**, the same gold rounded square you see in the header.",
        },
        {
          title: "Smarter license display",
          body:
            "Codeberg's API doesn't expose license info, and neither does GitHub for repos without a configured SPDX identifier — both used to show a dead-end \"Unknown\". Now, when the license field is empty:",
          bullets: [
            "The package page checks whether a `LICENSE`, `LICENSE.md`, `LICENCE`, or `COPYING` file exists in the repo root.",
            "If one does, **\"Unknown\" becomes a clickable link** straight to that file — no extra API calls, the file tree is already fetched for every package page.",
          ],
        },
        {
          title: "Version and sync badges in the header",
          body: "Two small pills now show on wide screens:",
          bullets: [
            "The **current app version**, read from `package.json` at build time.",
            "The **last successful sync**, queried live from the database and updated on every page load — so it reflects the actual state of the index, not a stale build date.",
          ],
        },
        {
          title: "Shared Badge component",
          body:
            "Pill badge styles were scattered across a handful of components with copy-pasted Tailwind classes. Now there's one `Badge` component with four named variants:",
          bullets: [
            "`zig` — header meta badges",
            "`topic` — clickable keyword pills",
            "`subtle` — version labels",
            "`muted` — tab counters",
          ],
        },
      ],
      links: undefined,
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
      {#if post.callout}
        <div class="not-prose mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <CircleAlert class="h-5 w-5 shrink-0 text-red-500" />
            <div class="min-w-0">
              <p class="font-mono text-[10px] font-bold uppercase tracking-wide text-red-600/70">
                {post.callout.before.label}
              </p>
              <p class="truncate font-mono text-sm font-bold text-red-800">
                {post.callout.before.value}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <CircleCheck class="h-5 w-5 shrink-0 text-emerald-500" />
            <div class="min-w-0">
              <p class="font-mono text-[10px] font-bold uppercase tracking-wide text-emerald-600/70">
                {post.callout.after.label}
              </p>
              <p class="truncate font-mono text-sm font-bold text-emerald-800">
                {post.callout.after.value}
              </p>
            </div>
          </div>
        </div>
      {/if}

      {#snippet inline(text: string)}
        {#each parseInline(text) as part, i (i)}
          {#if part.strong}<strong>{part.text}</strong>{:else if part.code}<code>{part.text}</code>{:else}{part.text}{/if}
        {/each}
      {/snippet}

      {#each post.sections as section (section.title)}
        <h2>{section.title}</h2>
        {#if section.body}<p>{@render inline(section.body)}</p>{/if}
        {#if section.bullets}
          <ul>
            {#each section.bullets as bullet (bullet)}<li>{@render inline(bullet)}</li>{/each}
          </ul>
        {/if}
      {/each}

      {#if post.links}
        <ul>
          {#each post.links as link (link.url)}
            <li>
              <a href={link.url} target="_blank" rel="noopener">{link.label}</a>
            </li>
          {/each}
        </ul>
      {/if}
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

      {#if relatedPosts.length > 0}
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
      {/if}
    </aside>
  </div>
</div>
