import { ImageResponse } from "@vercel/og";
import type { ReactElement } from "react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Read via plain Node fs instead of Vite's `?arraybuffer` import query — the
// latter never makes it through Vite's SSR module graph for externalized
// node_modules packages like @fontsource/inter, silently crashing the dev
// server on the first request that touches it.
function readFont(specifier: string): Buffer {
  return readFileSync(fileURLToPath(import.meta.resolve(specifier)));
}

const interRegular = readFont("@fontsource/inter/files/inter-latin-400-normal.woff");
const interBold = readFont("@fontsource/inter/files/inter-latin-700-normal.woff");

// Satori renders a tree of plain {type, props} nodes — it never touches the
// React runtime — so we build that tree by hand instead of pulling in JSX/React.
type SatoriNode = {
  type: string;
  props: Record<string, unknown>;
};

function h(
  type: string,
  props: Record<string, unknown> = {},
  ...children: Array<SatoriNode | string | false | null | undefined>
): SatoriNode {
  return {
    type,
    props: { ...props, children: children.filter((c): c is SatoriNode | string => Boolean(c)) },
  };
}

const COLORS = {
  bg: "#fff8ed", // zig-50
  card: "#ffffff",
  border: "#fed9a8", // zig-200
  accent: "#f7a41d", // zig-400
  accentDark: "#a4530c", // zig-700
  title: "#0f172a", // slate-900
  body: "#475569", // slate-600
  muted: "#94a3b8", // slate-400
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

// Satori can't reach the network for <img> sources, so the caller's avatar
// URL has to be fetched and inlined as a data URI up front. A slow or dead
// avatar host must not fail the whole card, so failures just drop the avatar.
async function toDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/png";
    const bytes = Buffer.from(await res.arrayBuffer());
    return `data:${contentType};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export type CardStat = { label: string; value: string };

export type CardOptions = {
  eyebrow: string;
  title: string;
  description?: string;
  avatarUrl?: string | null;
  stats?: CardStat[];
};

export async function renderCard(opts: CardOptions): Promise<Response> {
  const avatar = opts.avatarUrl ? await toDataUri(opts.avatarUrl) : null;

  const statCards = (opts.stats ?? []).map((stat) =>
    h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          padding: "12px 22px",
          backgroundColor: COLORS.card,
          border: `2px solid ${COLORS.border}`,
          borderRadius: "12px",
        },
      },
      h(
        "div",
        {
          style: {
            display: "flex",
            fontSize: "16px",
            color: COLORS.muted,
            textTransform: "uppercase",
          },
        },
        stat.label,
      ),
      h(
        "div",
        { style: { display: "flex", fontSize: "26px", fontWeight: 700, color: COLORS.title } },
        stat.value,
      ),
    ),
  );

  const element = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "1200px",
        height: "630px",
        padding: "64px",
        backgroundColor: COLORS.bg,
        backgroundImage: `linear-gradient(135deg, ${COLORS.bg} 0%, #ffffff 100%)`,
        fontFamily: "Inter",
      },
    },
    h(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      h(
        "div",
        {
          style: {
            display: "flex",
            fontSize: "22px",
            fontWeight: 700,
            color: COLORS.accentDark,
            textTransform: "uppercase",
            letterSpacing: "2px",
          },
        },
        opts.eyebrow,
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            marginTop: "24px",
            fontSize: "72px",
            fontWeight: 700,
            color: COLORS.title,
            lineHeight: 1.1,
          },
        },
        truncate(opts.title, 40),
      ),
      opts.description
        ? h(
            "div",
            {
              style: {
                display: "flex",
                marginTop: "20px",
                fontSize: "30px",
                color: COLORS.body,
                maxWidth: "980px",
              },
            },
            truncate(opts.description, 140),
          )
        : null,
    ),
    h(
      "div",
      { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "20px" } },
        avatar
          ? h("img", {
              src: avatar,
              width: 72,
              height: 72,
              style: { borderRadius: "16px", border: `2px solid ${COLORS.border}` },
            })
          : null,
        ...statCards,
      ),
      h(
        "div",
        { style: { display: "flex", fontSize: "28px", fontWeight: 700, color: COLORS.accent } },
        "zigpkg.dev",
      ),
    ),
  );

  return new ImageResponse(element as unknown as ReactElement, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Inter", data: interRegular, weight: 400, style: "normal" },
      { name: "Inter", data: interBold, weight: 700, style: "normal" },
    ],
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
