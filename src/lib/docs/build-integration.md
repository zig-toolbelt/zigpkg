---
title: Build integration
eyebrow: Build
description: Wire package dependencies into your build.zig.zon and keep updates predictable.
readTime: 8 min read
icon: code-2
command: zig build --summary all
---

## Keep dependency declarations explicit
Make package names match their usage in build.zig so contributors can understand the dependency graph quickly.

## Prefer tagged versions
Pinned tags are easier to audit than moving branch references and make CI failures easier to reproduce.

## Document update steps
A short maintenance note in the README helps future maintainers update dependencies without guessing.
