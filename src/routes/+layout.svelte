<script lang="ts">
  import { page } from "$app/state";
  import favicon from "$lib/assets/favicon.svg";
  import Header from "$lib/components/header.svelte";
  import Footer from "$lib/components/footer.svelte";
  import { resolveSeo } from "$lib/seo";

  import "./layout.css";

  let { children, data } = $props();

  const seo = $derived(resolveSeo(page.data.seo, page.url.pathname));
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="canonical" href={seo.url} />
  <title>{seo.title}</title>
  <meta name="description" content={seo.description} />
  <meta property="og:site_name" content="zigpkg" />
  <meta property="og:type" content={seo.type} />
  <meta property="og:url" content={seo.url} />
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  <meta property="og:image" content={seo.image} />
  <meta property="og:image:alt" content={seo.imageAlt} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seo.title} />
  <meta name="twitter:description" content={seo.description} />
  <meta name="twitter:image" content={seo.image} />
</svelte:head>

<div class="min-h-screen flex flex-col bg-white text-slate-900">
  <Header
    lastSyncedAt={data.lastSyncedAt}
    lastSyncedAtExact={data.lastSyncedAtExact}
    syncOverdue={data.syncOverdue}
    user={data.user}
    githubStars={data.githubStars}
  />
  <main class="flex-1 w-full">
    {@render children()}
  </main>
  <Footer />
</div>
