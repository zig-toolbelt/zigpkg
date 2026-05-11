<script lang="ts">
  import { page } from "$app/state";
  import favicon from "$lib/assets/favicon.svg";
  import Header from "$lib/components/header.svelte";
  import Footer from "$lib/components/footer.svelte";

  import "./layout.css";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="canonical" href={page.url.origin + page.url.pathname} />
  <title>Zig Package Registry — Find & Share Zig Libraries</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-[#fafafa]">
  <Header />
  <main class="container mx-auto py-12">
    {@render children()}
  </main>
  <Footer />
</div>
