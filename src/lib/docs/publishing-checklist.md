---
title: Publishing checklist
eyebrow: Checklist
description: Prepare a repository so it can be discovered, indexed, and trusted by Zig users.
readTime: 6 min read
icon: check-circle-2
command: git tag v0.1.0 && git push origin v0.1.0
---

## Write a clear README
Explain what the package does, show a small example, document supported Zig versions, and link to generated docs if they exist.

## Tag releases
Stable tags make package pages easier to scan and give users a predictable version to install.

## Use helpful topics
Topics make discovery work. Prefer specific tags such as `parser`, `http`, `cli`, `game-dev`, `crypto`, or `database`.

## Tag your repository
Want your package listed? Tag the repo `zig-package` or `zig-library` (for libraries) / `zig-program` (for applications), and it gets picked up automatically on the next hourly sync.
