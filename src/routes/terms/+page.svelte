<svelte:head>
  <title>Terms of Service — ZigPkg</title>
  <meta name="description" content="ZigPkg Terms of Service — rules for using the Zig package registry." />
</svelte:head>

<section class="border-b border-zig-100 bg-zig-50">
  <div class="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-14">
    <p class="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-zig-700">
      Legal document
    </p>
    <h1 class="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
      Terms of Service
    </h1>
    <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
      Rules for using ZigPkg, indexed package metadata, third-party links, and project terms.
    </p>
    <div class="mt-5 flex flex-wrap gap-2 font-mono text-[11px] text-slate-500">
      <span class="rounded bg-white px-2 py-1 ring-1 ring-zig-100">Last updated: March 17, 2026</span>
      <span class="rounded bg-white px-2 py-1 ring-1 ring-zig-100">MIT platform code</span>
    </div>
  </div>
</section>

<div class="mx-auto max-w-7xl px-6 py-10 sm:px-10">
  <div class="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
    <aside class="rounded-lg border border-slate-200 bg-white p-4 lg:sticky lg:top-20">
      <p class="px-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Legal
      </p>
      <nav class="mt-3 space-y-1 text-sm">
        <a href="/privacy" class="block rounded-md px-3 py-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
          Privacy Policy
        </a>
        <a href="/terms" class="block rounded-md bg-zig-100 px-3 py-2 font-medium text-zig-700">
          Terms of Service
        </a>
        <a href="/cookie" class="block rounded-md px-3 py-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
          Cookie Policy
        </a>
      </nav>
    </aside>

    <article class="prose prose-slate max-w-none rounded-lg border border-slate-200 bg-white p-6 sm:p-8 prose-headings:font-bold prose-a:text-zig-600 prose-a:no-underline hover:prose-a:underline">
  <p class="lead">
    Please read these Terms of Service carefully before using ZigPkg. By accessing or using
    <strong>zigpkg.dev</strong> you agree to be bound by these terms. If you do not agree,
    do not use the service.
  </p>

  <h2>1. About ZigPkg</h2>
  <p>
    ZigPkg is an open-source package registry and discovery service for the
    <a href="https://ziglang.org">Zig</a> programming language. It indexes publicly available
    Zig libraries and applications hosted on GitHub, making them searchable and browsable in
    one place. ZigPkg does <strong>not</strong> host package source code — all packages remain
    on their respective GitHub repositories.
  </p>
  <p>
    The ZigPkg platform itself is released under the
    <a href="https://opensource.org/licenses/MIT" rel="noopener noreferrer" target="_blank">MIT License</a>.
    Source code is available at
    <a href="https://github.com/zig-toolbelt/zigpkg" rel="noopener noreferrer" target="_blank">
      github.com/zig-toolbelt/zigpkg
    </a>.
  </p>

  <h2>2. Use of the Service</h2>
  <p>You may use ZigPkg to:</p>
  <ul>
    <li>Browse, search, and discover publicly indexed Zig packages.</li>
    <li>Access package metadata, documentation links, and version history.</li>
    <li>Integrate with the ZigPkg API for tooling and automation purposes.</li>
  </ul>
  <p>You agree <strong>not</strong> to:</p>
  <ul>
    <li>Scrape or crawl the service in a way that degrades performance for other users.</li>
    <li>Attempt to gain unauthorised access to any part of the service or its infrastructure.</li>
    <li>Use the service to distribute malware, spam, or any unlawful content.</li>
    <li>Misrepresent your identity or the origin of any content.</li>
  </ul>

  <h2>3. Package Indexing</h2>
  <p>
    ZigPkg indexes publicly available GitHub repositories that contain Zig packages.
    Package metadata (name, description, topics, version tags, etc.) is sourced exclusively
    from public GitHub data. ZigPkg does not store, distribute, or modify package source code.
  </p>
  <p>
    Each indexed package retains its original licence as declared by its author. The fact
    that a package appears on ZigPkg does not alter its licence or imply any endorsement by
    ZigPkg. Users are responsible for reviewing and complying with the licence of any package
    they use.
  </p>
  <p>
    If you are the author of a repository and believe it has been incorrectly indexed, or
    you wish to have it removed, please open an issue on our
    <a href="https://github.com/zig-toolbelt/zigpkg" rel="noopener noreferrer" target="_blank">
      GitHub repository
    </a>.
  </p>

  <h2>4. MIT License — Platform Code</h2>
  <p>
    The ZigPkg platform source code is provided under the MIT License:
  </p>
  <blockquote>
    <p>
      Permission is hereby granted, free of charge, to any person obtaining a copy of this
      software and associated documentation files (the "Software"), to deal in the Software
      without restriction, including without limitation the rights to use, copy, modify, merge,
      publish, distribute, sublicense, and/or sell copies of the Software, and to permit
      persons to whom the Software is furnished to do so, subject to the following conditions:
    </p>
    <p>
      The above copyright notice and this permission notice shall be included in all copies or
      substantial portions of the Software.
    </p>
    <p>
      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
      INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
      PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
      FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
      DEALINGS IN THE SOFTWARE.
    </p>
  </blockquote>

  <h2>5. Disclaimer of Warranties</h2>
  <p>
    ZigPkg is provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis,
    without warranties of any kind, either express or implied. We do not warrant that the
    service will be uninterrupted, error-free, or free of harmful components. Package metadata
    is sourced from third-party repositories and may be incomplete or inaccurate.
  </p>

  <h2>6. Limitation of Liability</h2>
  <p>
    To the maximum extent permitted by applicable law, ZigPkg and its contributors shall not
    be liable for any indirect, incidental, special, consequential, or punitive damages arising
    out of or related to your use of (or inability to use) the service, even if advised of the
    possibility of such damages.
  </p>

  <h2>7. Third-Party Links and Content</h2>
  <p>
    ZigPkg links to external repositories, documentation, and resources. We are not responsible
    for the content, accuracy, or practices of any third-party websites or services. Links do
    not constitute endorsement.
  </p>

  <h2>8. Changes to These Terms</h2>
  <p>
    We reserve the right to update these Terms of Service at any time. Changes will be reflected
    by updating the "Last updated" date at the top of this page. Continued use of the service
    after changes are posted constitutes acceptance of the revised terms.
  </p>

  <h2>9. Governing Law</h2>
  <p>
    These terms are governed by the laws applicable to open-source software projects. Any
    disputes should first be raised by opening an issue in our
    <a href="https://github.com/zig-toolbelt/zigpkg" rel="noopener noreferrer" target="_blank">
      GitHub repository
    </a>.
  </p>

  <h2>10. Contact</h2>
  <p>
    Questions about these Terms of Service can be directed to the ZigPkg project via
    <a href="https://github.com/zig-toolbelt/zigpkg" rel="noopener noreferrer" target="_blank">
      GitHub
    </a>
    or the community
    <a href="https://discord.gg/zig" rel="noopener noreferrer" target="_blank">Discord</a>.
  </p>
    </article>
  </div>
</div>
