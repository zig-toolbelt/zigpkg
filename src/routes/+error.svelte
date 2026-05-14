<script lang="ts">
  import { page } from "$app/state";

  const status = $derived(page.status);
  const message = $derived(page.error?.message ?? "Something went wrong");
  const title = $derived(
    status === 404 ? "Page not found — zigpkg" : `Error ${status} — zigpkg`
  );
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="flex flex-col items-center justify-center text-center py-20 px-4">
  <p class="text-sm font-semibold tracking-widest uppercase text-yellow-600 mb-3">
    Error {status}
  </p>
  <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
    {status === 404 ? "Page not found" : "Something went wrong"}
  </h1>
  <p class="text-slate-500 max-w-md mb-8">{message}</p>
  <div class="flex gap-3">
    <a
      href="/"
      class="inline-flex items-center px-6 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
    >
      Home
    </a>
    <a
      href="/packages"
      class="inline-flex items-center px-6 py-3 rounded-full border-2 border-slate-200 text-slate-700 font-bold hover:border-slate-300 hover:bg-slate-50 transition-colors"
    >
      Browse packages
    </a>
  </div>
</div>
