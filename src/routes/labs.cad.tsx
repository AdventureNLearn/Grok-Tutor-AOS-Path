/**
 * Multi-Agent CAD Plan Lab — offline educational demo.
 * 100 unique samples; quiz + checklist; MAC pipeline map.
 * surface=desk friendly for hive floating desks.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CAD_SAMPLE_COUNT,
  CAD_SAMPLES_100,
  assertCadSampleIntegrity,
  listCadFamilies,
  type CadSample,
} from "@/lib/cad/cad-samples-100";
import {
  MAC_AGENTS,
  MAC_APPLIES_TO,
  MAC_TO_HIVE,
  MAC_UPSTREAM,
  macOneLiner,
} from "@/lib/cad/mac-apply-map";
import {
  PARTMODE_APPLIES_TO,
  PARTMODE_STAGES,
  PARTMODE_UPSTREAM,
  MAC_TO_PARTMODE,
  partmodeOneLiner,
} from "@/lib/cad/partmode-apply-map";
import {
  PARTMODE_SAMPLE_COUNT,
  PARTMODE_SAMPLES_20,
  assertPartmodeSampleIntegrity,
  listPartmodeFamilies,
} from "@/lib/cad/partmode-samples-20";
import { MAC_CITATION, PARTMODE_CITATION } from "@/lib/public-credits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/labs/cad")({
  component: CadLabPage,
  validateSearch: (s: Record<string, unknown>) => ({
    sample: typeof s.sample === "string" ? s.sample : undefined,
    family: typeof s.family === "string" ? s.family : undefined,
    surface: typeof s.surface === "string" ? s.surface : undefined,
  }),
});

function CadLabPage() {
  const search = Route.useSearch();
  const isDesk = search?.surface === "desk";
  const integrity = useMemo(() => {
    try {
      const mac = assertCadSampleIntegrity();
      const pm = assertPartmodeSampleIntegrity();
      return {
        ok: mac.ok && pm.ok,
        errors: [...mac.errors, ...pm.errors],
      };
    } catch {
      return { ok: false, errors: ["integrity check failed"] };
    }
  }, []);
  const families = useMemo(() => {
    try {
      return [...listCadFamilies(), ...listPartmodeFamilies()];
    } catch {
      return [] as { id: string; label: string; count: number }[];
    }
  }, []);

  const catalog = useMemo(() => {
    const mac = Array.isArray(CAD_SAMPLES_100) ? CAD_SAMPLES_100 : [];
    const pm = Array.isArray(PARTMODE_SAMPLES_20) ? PARTMODE_SAMPLES_20 : [];
    return [...mac, ...pm];
  }, []);
  const totalSampleCount = CAD_SAMPLE_COUNT + PARTMODE_SAMPLE_COUNT;
  const fallbackId = catalog[0]?.id ?? "cad-001";

  const [familyFilter, setFamilyFilter] = useState<string | "all">(
    search?.family ?? "all",
  );
  const [selectedId, setSelectedId] = useState<string>(
    search?.sample && catalog.some((s) => s.id === search.sample)
      ? search.sample
      : fallbackId,
  );
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (!catalog.length) return [] as CadSample[];
    if (familyFilter === "all") return catalog;
    return catalog.filter((s) => s.family === familyFilter);
  }, [familyFilter, catalog]);

  const sample: CadSample | undefined =
    catalog.find((s) => s.id === selectedId) ??
    filtered[0] ??
    catalog[0];

  const idxInFiltered = sample
    ? filtered.findIndex((s) => s.id === sample.id)
    : -1;

  function select(s: CadSample) {
    setSelectedId(s.id);
    setPicked(null);
    setRevealed(false);
    setChecked({});
  }

  function go(delta: number) {
    if (!filtered.length) return;
    const i = idxInFiltered < 0 ? 0 : idxInFiltered;
    const next = filtered[(i + delta + filtered.length) % filtered.length];
    if (next) select(next);
  }

  const quiz = sample?.quiz;
  const choices = Array.isArray(quiz?.choices) ? quiz!.choices : [];
  const checkList = Array.isArray(sample?.checkList) ? sample!.checkList : [];
  const features = Array.isArray(sample?.features) ? sample!.features : [];
  const dimensions = Array.isArray(sample?.dimensions) ? sample!.dimensions : [];

  const quizOk =
    revealed &&
    picked !== null &&
    quiz != null &&
    picked === quiz.answerIndex;
  const checkDone =
    checkList.length > 0 &&
    sample != null &&
    checkList.every((_, i) => checked[`${sample.id}-${i}`]);

  if (!sample) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Plan Lab</h1>
        <p className="mt-2 text-muted text-sm">
          Sample catalog could not load. Refresh the page or restart the local server.
        </p>
        <Button asChild className="mt-6" variant="outline" size="sm">
          <a href="/">Back to The Hive</a>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto px-4 py-8",
        isDesk ? "max-w-5xl py-4" : "max-w-6xl py-10",
      )}
      data-testid="cad-lab"
      data-sample-count={totalSampleCount}
      data-integrity={integrity.ok ? "pass" : "fail"}
    >
      <div className="max-w-3xl">
        <Badge variant="teal" className="mb-3">
          Plan Lab · MAC + PartMode
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Box className="h-8 w-8 text-teal-400" />
          Multi-Agent CAD + PartMode lab
        </h1>
        <p className="mt-2 text-muted leading-relaxed">{macOneLiner()}</p>
        <p className="mt-2 text-sm text-subtle">
          Based on{" "}
          <a
            className="underline underline-offset-2 hover:text-fg"
            href={MAC_UPSTREAM.url}
            target="_blank"
            rel="noreferrer"
          >
            {MAC_UPSTREAM.org}/{MAC_UPSTREAM.repo}
          </a>{" "}
          (MIT). Samples and quizzes run here offline — see{" "}
          <Link to="/credits" className="underline underline-offset-2 hover:text-fg">
            Credits
          </Link>{" "}
          for full attribution.
        </p>
        <div className="mt-4 rounded-lg border border-border bg-surface/80 px-4 py-3 text-xs leading-relaxed text-muted">
          <p className="font-medium text-fg mb-1">Citation (as MAC requests)</p>
          <p>
            {MAC_CITATION.authors}. <em>{MAC_CITATION.title}</em>.{" "}
            {MAC_CITATION.year}.{" "}
            <a
              href={MAC_CITATION.url}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              {MAC_CITATION.url}
            </a>
          </p>
          <p className="mt-1">{MAC_CITATION.copyright}. License: {MAC_CITATION.license}.</p>
          <p className="mt-1">
            Baseline lineage:{" "}
            <a
              href={MAC_CITATION.alsoCite.url}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              {MAC_CITATION.alsoCite.name}
            </a>
            .
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Samples", value: String(totalSampleCount) },
          { label: "Families", value: String(families.length) },
          { label: "Catalog", value: integrity.ok ? "Ready" : "Check" },
          {
            label: "View",
            value: isDesk ? "Desk" : "Page",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3"
          >
            <div className="text-2xl font-semibold tabular-nums tracking-tight">
              {s.value}
            </div>
            <div className="text-xs text-subtle mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {!integrity.ok ? (
        <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
          Sample pack integrity failed: {integrity.errors.slice(0, 5).join("; ")}
        </div>
      ) : null}

      {/* PartMode literacy (sibling to MAC) */}
      <section className="mt-10" data-testid="partmode-literacy">
        <h2 className="text-sm font-medium text-subtle uppercase tracking-wide mb-3">
          PartMode literacy · people + typed agents
        </h2>
        <p className="text-sm text-muted leading-relaxed mb-3 max-w-3xl">
          {partmodeOneLiner()}
        </p>
        <p className="text-xs text-subtle mb-4 max-w-3xl">
          Live CAD:{" "}
          <a
            className="underline underline-offset-2 hover:text-fg"
            href={PARTMODE_UPSTREAM.live}
            target="_blank"
            rel="noreferrer"
          >
            {PARTMODE_UPSTREAM.live}
          </a>{" "}
          · Source{" "}
          <a
            className="underline underline-offset-2 hover:text-fg"
            href={PARTMODE_UPSTREAM.url}
            target="_blank"
            rel="noreferrer"
          >
            {PARTMODE_UPSTREAM.org}/{PARTMODE_UPSTREAM.repo}
          </a>{" "}
          ({PARTMODE_UPSTREAM.license}). This app does{" "}
          <strong className="text-fg font-medium">not</strong> embed the kernel or store agent
          keys. See{" "}
          <Link to="/credits" className="underline underline-offset-2 hover:text-fg">
            Credits
          </Link>
          .
        </p>
        <div className="mt-2 mb-4 rounded-lg border border-border bg-surface/80 px-4 py-3 text-xs leading-relaxed text-muted">
          <p className="font-medium text-fg mb-1">Citation</p>
          <p>
            {PARTMODE_CITATION.name} by {PARTMODE_CITATION.maker}.{" "}
            <a
              href={PARTMODE_CITATION.live}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              {PARTMODE_CITATION.live}
            </a>
            . License: {PARTMODE_CITATION.license}.
          </p>
          <p className="mt-1">
            Sibling encyclopedia:{" "}
            <a
              href={PARTMODE_CITATION.sibling.site}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              {PARTMODE_CITATION.sibling.name}
            </a>
            .
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {PARTMODE_APPLIES_TO.map((a) => (
            <Card key={a.id}>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{a.title}</CardTitle>
                <CardDescription className="mt-1 text-xs leading-relaxed">
                  {a.detail}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {PARTMODE_STAGES.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-border bg-surface p-4 text-sm"
            >
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-subtle mt-0.5">→ {a.output}</div>
              <p className="text-xs text-muted mt-2 leading-relaxed">{a.job}</p>
              <p className="text-xs mt-2 text-teal-300/90">Tutor: {a.tutorLens}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto mb-2">
          <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
            <thead className="bg-surface">
              <tr className="text-left text-subtle">
                <th className="p-2 font-medium">MAC stage</th>
                <th className="p-2 font-medium">PartMode analogue</th>
                <th className="p-2 font-medium">Tutor</th>
              </tr>
            </thead>
            <tbody>
              {MAC_TO_PARTMODE.map((row) => (
                <tr key={row.mac} className="border-t border-border">
                  <td className="p-2 font-mono">{row.mac}</td>
                  <td className="p-2">{row.partmode}</td>
                  <td className="p-2 text-subtle">{row.tutor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-subtle">
          PartMode samples use ids <span className="font-mono">pm-001…pm-020</span> (
          {PARTMODE_SAMPLE_COUNT} items). Filter families starting with &quot;partmode-&quot; in the
          browser below.
        </p>
      </section>
      {/* What you practice */}
      <section className="mt-10">
        <h2 className="text-sm font-medium text-subtle uppercase tracking-wide mb-3">
          What you practice here
        </h2>
        <p className="text-sm text-muted leading-relaxed mb-4 max-w-3xl">
          Plan Lab is a teaching surface for CAD process literacy — how a multi-step agent can
          brief, plan, check, and repair a part idea. It is not a full desktop CAD package; the
          samples below are for study and quiz practice.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MAC_APPLIES_TO.map((a) => (
            <Card key={a.id}>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{a.title}</CardTitle>
                <CardDescription className="mt-1 text-xs leading-relaxed">
                  {a.detail}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="mt-10">
        <h2 className="text-sm font-medium text-subtle uppercase tracking-wide mb-3">
          How the pipeline maps to The Hive
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {MAC_AGENTS.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-border bg-surface p-4 text-sm"
            >
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-subtle mt-0.5">→ {a.output}</div>
              <p className="text-xs text-muted mt-2 leading-relaxed">{a.job}</p>
              <p className="text-xs mt-2 text-teal-300/90">
                Tutor: {a.tutorLens}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
            <thead className="bg-surface">
              <tr className="text-left text-subtle">
                <th className="p-2 font-medium">MAC stage</th>
                <th className="p-2 font-medium">Tutor surface</th>
                <th className="p-2 font-medium">Shape / overlay</th>
              </tr>
            </thead>
            <tbody>
              {MAC_TO_HIVE.map((row) => (
                <tr key={row.mac} className="border-t border-border">
                  <td className="p-2 font-mono">{row.mac}</td>
                  <td className="p-2">{row.tutor}</td>
                  <td className="p-2 text-subtle">{row.shape}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sample browser */}
      <section className="mt-10" data-testid="cad-sample-browser">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-medium text-subtle uppercase tracking-wide">
              100 unique samples
            </h2>
            <p className="text-xs text-muted mt-1">
              Each sample has its own prompt, checklist, and quiz.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant={familyFilter === "all" ? "default" : "outline"}
              onClick={() => setFamilyFilter("all")}
            >
              All
            </Button>
            {families.map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={familyFilter === f.id ? "default" : "outline"}
                onClick={() => setFamilyFilter(f.id)}
                title={f.label}
              >
                {f.label.split(" ")[0]} ({f.count})
              </Button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
          <div className="rounded-lg border border-border bg-surface max-h-[28rem] overflow-y-auto">
            <ul className="divide-y divide-border">
              {filtered.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => select(s)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition-colors",
                      s.id === sample.id && "bg-teal-500/10 border-l-2 border-teal-400",
                    )}
                    data-sample-id={s.id}
                  >
                    <div className="font-medium leading-snug">{s.title}</div>
                    <div className="text-xs text-subtle mt-0.5 flex flex-wrap gap-1.5">
                      <span>{s.difficulty}</span>
                      <span>·</span>
                      <span>{s.pipelineStage}</span>
                      <span>·</span>
                      <span>{s.qaErrorType}</span>
                    </div>
                  </button>
                </li>
              ))}
              {!filtered.length ? (
                <li className="px-3 py-6 text-sm text-muted">No samples in this family.</li>
              ) : null}
            </ul>
          </div>

          <Card className="p-0 overflow-hidden" data-testid="cad-sample-detail">
            <div className="p-5 border-b border-border">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline">{sample.id}</Badge>
                <Badge variant="teal">{sample.familyLabel}</Badge>
                <Badge variant="outline">{sample.difficulty}</Badge>
                <Badge variant="outline">stage: {sample.pipelineStage}</Badge>
              </div>
              <h3 className="text-lg font-semibold leading-snug">{sample.title}</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {sample.humanReadableSummary}
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => go(-1)}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button size="sm" variant="outline" onClick={() => go(1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-5 space-y-5 text-sm">
              <div>
                <div className="text-xs font-medium text-subtle uppercase mb-1">
                  Natural-language design prompt
                </div>
                <p className="leading-relaxed text-muted bg-black/20 rounded-md p-3 border border-border">
                  {sample.prompt}
                </p>
              </div>

              <div>
                <div className="text-xs font-medium text-subtle uppercase mb-1">
                  MAC lesson
                </div>
                <p className="leading-relaxed">{sample.macLesson}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-medium text-subtle uppercase mb-1">
                    Features
                  </div>
                  <ul className="list-disc pl-4 text-muted space-y-0.5">
                    {features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-medium text-subtle uppercase mb-1">
                    Dimensions (training)
                  </div>
                  <ul className="text-muted space-y-0.5 font-mono text-xs">
                    {dimensions.map((d) => (
                      <li key={d.label}>
                        {d.label}: {d.value} {d.unit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">axis {sample.primaryAxis}</Badge>
                <Badge variant="outline">{sample.materialIntent}</Badge>
                <Badge variant="outline">QA {sample.qaErrorType}</Badge>
                <Badge variant="outline">focus {sample.integrityFocus}</Badge>
                {sample.tradeLink ? (
                  <Badge variant="outline">craft {sample.tradeLink}</Badge>
                ) : null}
              </div>

              {sample.scenarioHold ? (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed">
                  <strong>Hold:</strong> {sample.scenarioHold}
                </div>
              ) : null}

              <div>
                <div className="text-xs font-medium text-subtle uppercase mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Checklist (testable)
                </div>
                <ul className="space-y-2">
                  {checkList.map((c, i) => {
                    const key = `${sample.id}-${i}`;
                    return (
                      <li key={key}>
                        <label className="flex gap-2 items-start cursor-pointer text-muted">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={!!checked[key]}
                            onChange={(e) =>
                              setChecked((prev) => ({
                                ...prev,
                                [key]: e.target.checked,
                              }))
                            }
                          />
                          <span className="text-sm leading-snug">{c}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                {checkDone ? (
                  <p className="text-xs text-teal-400 mt-2">Checklist complete for {sample.id}.</p>
                ) : null}
              </div>

              <div data-testid="cad-quiz">
                <div className="text-xs font-medium text-subtle uppercase mb-2 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Quiz
                </div>
                <p className="mb-3 leading-relaxed">
                  {quiz?.prompt ?? "Quiz unavailable for this sample."}
                </p>
                <div className="space-y-2">
                  {choices.map((choice, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPicked(i);
                        setRevealed(true);
                      }}
                      className={cn(
                        "w-full text-left rounded-md border px-3 py-2 text-sm transition-colors",
                        picked === i
                          ? quizOk
                            ? "border-teal-400 bg-teal-500/15"
                            : "border-red-400/60 bg-red-500/10"
                          : "border-border hover:border-border-strong bg-black/10",
                      )}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
                {revealed && quiz ? (
                  <p className="mt-3 text-xs leading-relaxed text-muted">
                    <strong className={quizOk ? "text-teal-400" : "text-amber-300"}>
                      {quizOk ? "Correct." : "Not quite."}
                    </strong>{" "}
                    {quiz.why}
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-2 text-sm">
        <Button asChild variant="outline" size="sm">
          <Link to="/demo">
            <Layers className="h-4 w-4 mr-1" /> Craft sample lessons
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/">Back to hive</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/help">How to use</Link>
        </Button>
      </div>
    </div>
  );
}
