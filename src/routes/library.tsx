/**
 * Training library hub — curriculum map inside The Hive.
 * Points at product surfaces only (no bulk corpus streaming).
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Box, Library, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RELEASE_CURRICULUM, releaseHudLine } from "@/lib/release-curriculum";
import { INDUSTRIES } from "@/lib/industries";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
  validateSearch: (s: Record<string, unknown>) => ({
    surface: typeof s.surface === "string" ? s.surface : undefined,
  }),
});

function LibraryPage() {
  const r = RELEASE_CURRICULUM;
  const crafts = INDUSTRIES.slice(0, 12);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10" data-testid="training-library">
      <Badge variant="teal" className="mb-3">
        Training library
      </Badge>
      <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
        <Library className="h-8 w-8 text-teal-400" />
        Training library
      </h1>
      <p className="mt-2 text-muted max-w-3xl leading-relaxed">
        Educational curriculum for Grok Tutor — sample dialogues, Plan Lab, and ready craft lessons.
        Not a credential, license, or place-specific legal ruling. You make the final call on real work.
      </p>
      <p className="mt-2 text-sm text-subtle">{releaseHudLine()}</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Industries", value: String(r.industries) },
          { label: "Ready lessons", value: String(r.readyPublicClean) },
          { label: "Plan Lab samples", value: String(r.planLabTotal) },
          { label: "Public samples", value: String(r.cleanUniquePublic) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3"
          >
            <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
            <div className="text-xs text-subtle mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-5">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-400" />
              Example reasoning
            </CardTitle>
            <CardDescription className="mt-2 text-xs leading-relaxed">
              Six flagship lessons on The Hive — switch Integrity, Spine, Four-agent, and other
              lenses to see how the same samples remap in 3D.
            </CardDescription>
            <Button asChild size="sm" variant="teal" className="mt-4 w-fit">
              <a href="/?view=3d&field=examples">Open the reasoning field</a>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-5">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-400" />
              Sample lessons
            </CardTitle>
            <CardDescription className="mt-2 text-xs leading-relaxed">
              Multi-turn craft dialogues across all industries and six modes — open a pack, then
              start a live session.
            </CardDescription>
            <Button asChild size="sm" variant="teal" className="mt-4 w-fit">
              <Link to="/demo">Browse samples</Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-5">
            <CardTitle className="text-base flex items-center gap-2">
              <Box className="h-4 w-4 text-sky-400" />
              Plan Lab · MAC + PartMode
            </CardTitle>
            <CardDescription className="mt-2 text-xs leading-relaxed">
              {r.macSamples} MAC pipeline samples + {r.partmodeSamples} PartMode literacy items
              (session approve, preview→commit, inspect Evidence). Offline in this app.
            </CardDescription>
            <Button asChild size="sm" variant="secondary" className="mt-4 w-fit">
              <Link to="/labs/cad" search={{ sample: undefined, family: undefined, surface: undefined }}>
                Open Plan Lab
              </Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-5">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Integrity & credits
            </CardTitle>
            <CardDescription className="mt-2 text-xs leading-relaxed">
              Evidence / Inference / Assumption · human final call. Lineage for MAC, PartMode
              (AGPL literacy only), and CAI-OS conceptual credit.
            </CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/help">How to use</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/credits">Credits</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-subtle uppercase tracking-wide mb-3">
          Craft entry points
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {crafts.map((ind) => (
            <Link
              key={ind.id}
              to="/tutor"
              search={{ industry: ind.id }}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:border-teal-500/40 transition-colors"
            >
              {ind.name}
            </Link>
          ))}
        </div>
        <Button asChild variant="ghost" size="sm" className="mt-3">
          <Link to="/explore">All industries</Link>
        </Button>
      </section>

      <section className="mt-10 rounded-lg border border-border bg-surface/60 px-4 py-4 text-xs text-muted leading-relaxed max-w-3xl">
        <p className="font-medium text-fg mb-1 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          How to use this library
        </p>
        <p>
          Start with a craft entry point or Samples, open Plan Lab when you want offline CAD literacy
          practice, and use Help for a short tour. Counts above describe the product surface in this
          app — not a live scan of every training file on disk.
        </p>
      </section>

      <div className="mt-8">
        <Button asChild variant="outline" size="sm">
          <Link to="/">Back to The Hive</Link>
        </Button>
      </div>
    </div>
  );
}
