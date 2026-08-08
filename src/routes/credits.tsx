/**
 * Credits & lineage — attribution page for Grok Tutor.
 * Defensive render: never throw on missing credit fields.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppErrorComponent } from "@/lib/error-component";
import {
  CAIOS_ATTRIBUTION,
  MAC_CITATION,
  PUBLIC_CREDITS,
  type CreditKind,
  type PublicCredit,
} from "@/lib/public-credits";

export const Route = createFileRoute("/credits")({
  component: CreditsPage,
  errorComponent: AppErrorComponent,
  head: () => ({
    meta: [
      { title: "Credits · Grok Tutor" },
      {
        name: "description",
        content:
          "Credits and lineage for Grok Tutor — attribution for projects and libraries we build on.",
      },
    ],
  }),
});

const KIND_LABEL: Record<CreditKind, string> = {
  lineage: "Lineage & conceptual spark",
  research: "Research & educational alignment",
  runtime: "Open-source runtime",
  platform: "Platform & models",
  content: "Product libraries",
};

const KIND_ORDER: CreditKind[] = [
  "lineage",
  "research",
  "platform",
  "content",
  "runtime",
];

function safeCredits(): PublicCredit[] {
  return Array.isArray(PUBLIC_CREDITS) ? PUBLIC_CREDITS : [];
}

function CreditBlock({ c }: { c: PublicCredit }) {
  const urls = Array.isArray(c?.urls) ? c.urls : [];
  const notes = Array.isArray(c?.notes) ? c.notes : [];
  const attrs = Array.isArray(c?.exactAttribution) ? c.exactAttribution : [];

  return (
    <article
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5"
      data-credit-id={c?.id ?? "unknown"}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold tracking-tight">
          {c?.name ?? "Credit"}
        </h3>
        {c?.license ? (
          <Badge variant="outline" className="shrink-0 max-w-full whitespace-normal">
            {c.license}
          </Badge>
        ) : null}
      </div>
      {c?.relationship ? (
        <p className="mt-2 text-sm text-muted leading-relaxed">{c.relationship}</p>
      ) : null}

      {attrs.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">
            Attribution (as requested)
          </p>
          {attrs.map((line, i) => (
            <blockquote
              key={`${c.id}-attr-${i}`}
              className="rounded-md border border-teal-500/25 bg-teal-500/5 px-3 py-2 text-sm leading-relaxed font-medium"
            >
              {line}
            </blockquote>
          ))}
        </div>
      ) : null}

      {notes.length > 0 ? (
        <ul className="mt-3 list-disc pl-5 text-xs text-muted space-y-1">
          {notes.map((n, i) => (
            <li key={`${c.id}-note-${i}`}>{n}</li>
          ))}
        </ul>
      ) : null}

      {urls.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {urls.map((u, i) => {
            if (!u?.href) return null;
            return (
              <a
                key={`${c.id}-url-${i}-${u.href}`}
                href={u.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-teal-300/90 underline-offset-2 hover:underline"
              >
                {u.label || u.href}
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              </a>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}

function CreditsPage() {
  const credits = safeCredits();

  const caiosFull =
    CAIOS_ATTRIBUTION?.fullRequired ??
    "Built on CAIOS v1.0 by inventor Jonathan M. Schack – www.cai-os.com";
  const caiosShort = CAIOS_ATTRIBUTION?.readmeShort ?? "";
  const caiosCite = CAIOS_ATTRIBUTION?.textCitation ?? "";
  const macAuthors = MAC_CITATION?.authors ?? "Guanxing Qu and Xueyan Zou";
  const macTitle = MAC_CITATION?.title ?? "MAC (Multi-Agent CAD)";
  const macUrl = MAC_CITATION?.url ?? "https://github.com/Pan-Chera/Multi-Agent-CAD";
  const macCopyright = MAC_CITATION?.copyright ?? "";
  const macAlso = MAC_CITATION?.alsoCite;

  // Plain bibtex for display (avoid odd escape rendering)
  const macBibtex = [
    "@misc{mac2026,",
    `  author = {${macAuthors}},`,
    `  title  = {${macTitle}},`,
    "  year   = {2026},",
    "  publisher = {GitHub},",
    "  journal   = {GitHub repository},",
    `  howpublished = {${macUrl}}`,
    "}",
  ].join("\n");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10" data-testid="credits-page">
      <p className="text-xs font-medium uppercase tracking-wide text-teal">
        Attribution
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Credits</h1>
      <p className="mt-3 text-muted leading-relaxed">
        Grok Tutor is about craft learning. Here we credit the people and projects we build on,
        using the wording they ask for. Lessons and The Hive stay focused on teaching.
      </p>

      <section className="mt-10 rounded-[var(--radius-lg)] border border-border bg-elevated/40 p-5">
        <Badge variant="teal" className="mb-3">
          Lineage · CAI-OS
        </Badge>
        <h2 className="text-lg font-semibold">CAI-OS and AOS / LPIN framing</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Jonathan M. Schack&apos;s CAIOS / Chaos AI-OS work (ternary honesty, refuse-to-fake
          certainty, transparency, local-first integrity) helped spark how Adventure OS and LPIN
          think about claims and incomplete state.{" "}
          <strong className="text-fg font-medium">
            This app does not ship CAIOS software
          </strong>{" "}
          — we still give full, explicit credit.
        </p>
        <blockquote className="mt-4 rounded-md border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm font-medium leading-relaxed">
          {caiosFull}
        </blockquote>
        {caiosShort || caiosCite ? (
          <p className="mt-3 text-xs text-subtle leading-relaxed">
            {caiosShort ? <>Also: {caiosShort}<br /></> : null}
            {caiosCite}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <a
            className="text-teal-300 underline-offset-2 hover:underline"
            href={CAIOS_ATTRIBUTION?.site ?? "https://cai-os.com"}
            target="_blank"
            rel="noreferrer"
          >
            cai-os.com
          </a>
          <a
            className="text-teal-300 underline-offset-2 hover:underline"
            href={CAIOS_ATTRIBUTION?.github ?? "https://github.com/ELXaber/chaos-persona"}
            target="_blank"
            rel="noreferrer"
          >
            GitHub · chaos-persona
          </a>
          {CAIOS_ATTRIBUTION?.contactEmail ? (
            <span className="text-subtle">{CAIOS_ATTRIBUTION.contactEmail}</span>
          ) : null}
        </div>
      </section>

      <section className="mt-6 rounded-[var(--radius-lg)] border border-border p-5">
        <Badge variant="outline" className="mb-3">
          Research · Multi-Agent CAD
        </Badge>
        <h2 className="text-lg font-semibold">MAC (Multi-Agent CAD)</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Plan Lab samples teach pipeline thinking aligned with MAC by {macAuthors} (Tsinghua
          University · IEI Lab). MIT. Browser lab is offline curriculum — not the Python CAD kernel.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-black/30 p-3 text-[11px] leading-relaxed text-muted whitespace-pre-wrap">
          {macBibtex}
        </pre>
        <p className="mt-2 text-xs text-subtle">
          {macCopyright}
          {macAlso?.url ? (
            <>
              {" "}
              Please also cite{" "}
              <a
                className="underline underline-offset-2"
                href={macAlso.url}
                target="_blank"
                rel="noreferrer"
              >
                {macAlso.name ?? macAlso.url}
              </a>{" "}
              when using that baseline lineage.
            </>
          ) : null}
        </p>
        <p className="mt-2 text-xs">
          <a
            className="text-teal-300 underline-offset-2 hover:underline"
            href={macUrl}
            target="_blank"
            rel="noreferrer"
          >
            {macUrl}
          </a>
        </p>
      </section>

      {KIND_ORDER.map((kind) => {
        const rows = credits.filter((c) => c && c.kind === kind);
        if (!rows.length) return null;
        return (
          <section key={kind} className="mt-10">
            <h2 className="text-sm font-medium uppercase tracking-wide text-subtle mb-3">
              {KIND_LABEL[kind] ?? kind}
            </h2>
            <div className="space-y-3">
              {rows.map((c) => (
                <CreditBlock key={c.id || kind + c.name} c={c} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-12 border-t border-border pt-8 text-sm text-muted leading-relaxed">
        <h2 className="text-base font-semibold text-fg">Product license</h2>
        <p className="mt-2">
          Grok Tutor source is released under the MIT License — see the{" "}
          <code className="text-xs">LICENSE</code> file in the repository. Third-party packages keep
          their own licenses.
        </p>
        <p className="mt-2">
          Grok Tutor is for learning and practice. For licensed work, follow your instructors,
          workplace procedures, and official guidance. Trades and health lessons lead with safety.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/">Back to The Hive</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/help">How to use</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="/labs/cad">Plan Lab · CAD</a>
        </Button>
      </div>
    </div>
  );
}
