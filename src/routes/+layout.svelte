<script lang="ts">
  import { page } from "$app/state";
  import favicon from "$lib/assets/favicon.svg";
  import Header from "$lib/components/header.svelte";
  import Footer from "$lib/components/footer.svelte";
  import { buildCanonical, siteUrl } from "$lib/seo";

  import "./layout.css";

  let { children } = $props();

  const canonical = $derived(buildCanonical(page.url.pathname));
  const defaultDescription =
    "zigpkg — discover Zig libraries, applications, and tools. Browse packages, view READMEs, and find the right code for your project.";
  const defaultOgImage = `${siteUrl()}/og-default.png`;
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="canonical" href={canonical} />
  <title>Zig Package Registry — Find & Share Zig Libraries</title>
  <meta name="description" content={defaultDescription} />
  <meta property="og:site_name" content="zigpkg" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content="Zig Package Registry — Find & Share Zig Libraries" />
  <meta property="og:description" content={defaultDescription} />
  <meta property="og:image" content={defaultOgImage} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Zig Package Registry — Find & Share Zig Libraries" />
  <meta name="twitter:description" content={defaultDescription} />
  <meta name="twitter:image" content={defaultOgImage} />
</svelte:head>

<div class="min-h-screen flex flex-col bg-[#fafafa]">
  <Header />
  <main class="container mx-auto py-12">
    {@render children()}
  </main>
  <Footer />
</div>
