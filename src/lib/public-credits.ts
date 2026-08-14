/**
 * Public third-party & lineage credits for Grok Tutor.
 * Keep product chrome clean — render full detail only on /credits.
 *
 * Attribution strings for CAI-OS are copied exactly as the creator requests
 * (LICENSE / CITATION.md / README). Do not alter, obfuscate, or minimize them.
 */

export type CreditKind =
  | "lineage"
  | "research"
  | "runtime"
  | "platform"
  | "content";

export type PublicCredit = {
  id: string;
  kind: CreditKind;
  name: string;
  /** One-line relationship to this product */
  relationship: string;
  /** Exact creator-requested attribution (if any) — display unaltered */
  exactAttribution?: string[];
  urls: { label: string; href: string }[];
  license?: string;
  notes?: string[];
};

/** CAI-OS — exact forms from upstream LICENSE / CITATION / README (2026-08-07 scrape) */
export const CAIOS_ATTRIBUTION = {
  fullRequired:
    "Built on CAIOS v1.0 by inventor Jonathan M. Schack – Patent Pending US 19/433,771 & 19/390,493 – www.cai-os.com",
  readmeShort: "Built on CRB 6.7 by Jonathan Schack (ELXaber) (GPL 3.0).",
  textCitation:
    "Chaos-Persona framework by ELXaber (https://github.com/ELXaber/chaos-persona/).",
  simplifiedFooter: "AI powered by CAIOS: https://cai-os.com",
  site: "https://cai-os.com",
  github: "https://github.com/ELXaber/chaos-persona",
  contactEmail: "jon@cai-os.com",
  xHandle: "@EL_Xaber",
  patents: ["US 19/390,493", "US 19/433,771"],
  inventor: "Jonathan M. Schack (ELXaber)",
} as const;

export const MAC_CITATION = {
  authors: "Guanxing Qu and Xueyan Zou",
  title:
    "MAC (Multi-Agent CAD): A Decoupled Multi-Agent Framework for Text-to-CAD Generation",
  year: "2026",
  url: "https://github.com/Pan-Chera/Multi-Agent-CAD",
  copyright: "Copyright (c) 2026 Tsinghua University · IEI Lab",
  license: "MIT",
  alsoCite: {
    name: "CAD Skills (earthtojake/text-to-cad)",
    url: "https://github.com/earthtojake/text-to-cad",
  },
  bibtex: `@misc{mac2026,
  author = {Guanxing Qu and Xueyan Zou},
  title  = {MAC (Multi-Agent CAD): A Decoupled Multi-Agent Framework for Text-to-CAD Generation},
  year   = {2026},
  publisher = {GitHub},
  journal   = {GitHub repository},
  howpublished = {\\url{https://github.com/Pan-Chera/Multi-Agent-CAD}}
}`,
} as const;

/** PartMode (BOMWiki) — AGPL browser CAD; educational citation only in Tutor */
export const PARTMODE_CITATION = {
  name: "PartMode",
  maker: "Sphinx (@protosphinx)",
  org: "BOMWiki",
  year: "2026",
  live: "https://partmode.com/",
  help: "https://partmode.com/help",
  url: "https://github.com/BOMWiki/partmode",
  license: "AGPL-3.0",
  sibling: {
    name: "BOMWiki",
    site: "https://bomwiki.com",
    url: "https://github.com/BOMWiki/bomwiki",
    role: "Open bills-of-materials encyclopedia",
  },
} as const;

export const PUBLIC_CREDITS: PublicCredit[] = [
  {
    id: "cai-os",
    kind: "lineage",
    name: "CAI-OS / CAIOS / Chaos AI-OS (Chaos-Persona)",
    relationship:
      "Conceptual spark for AOS/LPIN integrity framing: honest undecidability, refuse-to-fake certainty, transparency, and local-first posture. Grok Tutor does not ship, embed, or redistribute CAIOS source code.",
    exactAttribution: [
      CAIOS_ATTRIBUTION.fullRequired,
      CAIOS_ATTRIBUTION.readmeShort,
      CAIOS_ATTRIBUTION.textCitation,
    ],
    urls: [
      { label: "cai-os.com", href: CAIOS_ATTRIBUTION.site },
      { label: "GitHub chaos-persona", href: CAIOS_ATTRIBUTION.github },
    ],
    license: "GPL-3.0 (research) · commercial dual-license available from inventor",
    notes: [
      `Inventor: ${CAIOS_ATTRIBUTION.inventor}`,
      `Contact: ${CAIOS_ATTRIBUTION.contactEmail} · ${CAIOS_ATTRIBUTION.xHandle}`,
      `Patents pending: ${CAIOS_ATTRIBUTION.patents.join(" · ")}`,
      "If CAIOS software is ever integrated into a product build, follow upstream LICENSE (attribution UI + commercial path as required). Today: conceptual credit only.",
    ],
  },
  {
    id: "mac",
    kind: "research",
    name: "MAC — Multi-Agent CAD",
    relationship:
      "Educational Plan Lab (/labs/cad) teaches pipeline stages (brief → architect → coder → dual QA → repair) aligned with MAC. Offline samples only in the browser; Python CAD kernel is not bundled in this app.",
    exactAttribution: [
      `${MAC_CITATION.authors}. ${MAC_CITATION.title}. ${MAC_CITATION.year}. ${MAC_CITATION.url}`,
      MAC_CITATION.copyright,
    ],
    urls: [
      { label: "Pan-Chera/Multi-Agent-CAD", href: MAC_CITATION.url },
      { label: "IEI Lab", href: "https://maureenzou.github.io/lab.html" },
      {
        label: "CAD Skills baseline",
        href: MAC_CITATION.alsoCite.url,
      },
    ],
    license: MAC_CITATION.license,
    notes: [
      "If you publish research that uses MAC ideas or benchmarks, cite MAC as requested in their README § Citation.",
      `Also cite ${MAC_CITATION.alsoCite.name} when using their benchmark/baseline lineage.`,
      "MAC acknowledges build123d, LangGraph, Aider, and Qwen — see upstream README.",
    ],
  },
  {
    id: "partmode",
    kind: "research",
    name: "PartMode (BOMWiki)",
    relationship:
      "Educational Plan Lab (/labs/cad) includes PartMode literacy samples (session approve, preview→commit, inspect Evidence). Live CAD remains on partmode.com or a private self-host; Grok Tutor does not embed the AGPL kernel or ship MCP agent keys.",
    exactAttribution: [
      `${PARTMODE_CITATION.name} by ${PARTMODE_CITATION.maker}. ${PARTMODE_CITATION.live} · ${PARTMODE_CITATION.url}`,
      `License: ${PARTMODE_CITATION.license}`,
    ],
    urls: [
      { label: "partmode.com", href: PARTMODE_CITATION.live },
      { label: "BOMWiki/partmode", href: PARTMODE_CITATION.url },
      { label: "Help", href: PARTMODE_CITATION.help },
      { label: "bomwiki.com", href: PARTMODE_CITATION.sibling.site },
    ],
    license: PARTMODE_CITATION.license,
    notes: [
      "AGPL-3.0: do not bundle PartMode source into this public monorepo without an explicit license decision.",
      "MCP agent keys are L0 secrets — never commit, never expose in public UI.",
      `Sibling: ${PARTMODE_CITATION.sibling.name} (${PARTMODE_CITATION.sibling.role}).`,
      "Compose with MAC Plan Lab — do not collapse the two tools into one claim.",
    ],
  },
  {
    id: "build123d",
    kind: "research",
    name: "build123d",
    relationship:
      "Algebraic B-rep CAD kernel used by MAC upstream (not executed in this web app).",
    urls: [{ label: "gumyr/build123d", href: "https://github.com/gumyr/build123d" }],
    license: "Apache-2.0 (upstream)",
  },
  {
    id: "three",
    kind: "runtime",
    name: "three.js",
    relationship: "3D hive rendering in the Tutor workspace.",
    urls: [{ label: "mrdoob/three.js", href: "https://github.com/mrdoob/three.js" }],
    license: "MIT",
  },
  {
    id: "react",
    kind: "runtime",
    name: "React",
    relationship: "UI runtime.",
    urls: [{ label: "react.dev", href: "https://react.dev" }],
    license: "MIT",
  },
  {
    id: "tanstack",
    kind: "runtime",
    name: "TanStack Start / Router",
    relationship: "App routing and start framework.",
    urls: [
      { label: "TanStack Router", href: "https://github.com/TanStack/router" },
    ],
    license: "MIT",
  },
  {
    id: "vite",
    kind: "runtime",
    name: "Vite",
    relationship: "Dev server and production bundling.",
    urls: [{ label: "vitejs/vite", href: "https://github.com/vitejs/vite" }],
    license: "MIT",
  },
  {
    id: "tailwind",
    kind: "runtime",
    name: "Tailwind CSS",
    relationship: "Styling system.",
    urls: [
      {
        label: "tailwindlabs/tailwindcss",
        href: "https://github.com/tailwindlabs/tailwindcss",
      },
    ],
    license: "MIT",
  },
  {
    id: "zustand",
    kind: "runtime",
    name: "Zustand",
    relationship: "Client state (desks, progress, edit store).",
    urls: [{ label: "pmndrs/zustand", href: "https://github.com/pmndrs/zustand" }],
    license: "MIT",
  },
  {
    id: "zod",
    kind: "runtime",
    name: "Zod",
    relationship: "Schema validation.",
    urls: [{ label: "colinhacks/zod", href: "https://github.com/colinhacks/zod" }],
    license: "MIT",
  },
  {
    id: "lucide",
    kind: "runtime",
    name: "Lucide icons",
    relationship: "Icon set.",
    urls: [{ label: "lucide-icons/lucide", href: "https://github.com/lucide-icons/lucide" }],
    license: "ISC",
  },
  {
    id: "sonner",
    kind: "runtime",
    name: "Sonner",
    relationship: "Toast notifications.",
    urls: [
      { label: "emilkowalski/sonner", href: "https://github.com/emilkowalski/sonner" },
    ],
    license: "MIT",
  },
  {
    id: "pglite",
    kind: "runtime",
    name: "PGLite (Electric SQL)",
    relationship: "Optional local DB fallback path.",
    urls: [
      {
        label: "electric-sql/pglite",
        href: "https://github.com/electric-sql/pglite",
      },
    ],
    license: "Apache-2.0",
  },
  {
    id: "better-auth",
    kind: "runtime",
    name: "Better Auth",
    relationship: "Auth plumbing when enabled.",
    urls: [
      {
        label: "better-auth/better-auth",
        href: "https://github.com/better-auth/better-auth",
      },
    ],
    license: "MIT",
  },
  {
    id: "xai",
    kind: "platform",
    name: "xAI · Grok",
    relationship:
      "Live tutoring model when a server-side API key is configured. Product designed for the Grok / Grok.me ecosystem.",
    urls: [
      { label: "x.ai", href: "https://x.ai" },
      { label: "grok.me samples", href: "https://gt2samples.grok.me/" },
    ],
  },
  {
    id: "adventurenlearn",
    kind: "content",
    name: "AdventureNLearn · AOS / LPIN libraries",
    relationship:
      "Product author and public educational libraries that Tutor’s thinking-tool map points to.",
    urls: [
      {
        label: "AOS-v3---LPIN",
        href: "https://github.com/AdventureNLearn/AOS-v3---LPIN",
      },
      {
        label: "AOS-Public",
        href: "https://github.com/AdventureNLearn/AOS-Public",
      },
      { label: "LPINv3", href: "https://github.com/AdventureNLearn/LPINv3" },
    ],
    license: "See each repository",
  },
];

export function creditsByKind(kind: CreditKind): PublicCredit[] {
  return PUBLIC_CREDITS.filter((c) => c.kind === kind);
}
