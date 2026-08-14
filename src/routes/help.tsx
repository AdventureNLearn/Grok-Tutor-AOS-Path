import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Hexagon, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HELP_HIVE_BLURB,
  HELP_HIVE_LINE,
  HELP_IDLE_MATCH,
  HELP_PROGRESS_LINE,
  HELP_WORK_LINE,
} from "@/lib/help-copy";
import { HOST_MATRIX, hostMatrixBlurb } from "@/lib/host-matrix";

export const Route = createFileRoute("/help")({
  component: HelpPage,
  head: () => ({
    meta: [
      { title: "How to use Grok Tutor" },
      {
        name: "description",
        content:
          "How to use Grok Tutor and The Hive: sample lessons, live sessions, six modes, and thinking tools.",
      },
    ],
  }),
});

function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-teal">Quick start</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">How to use Grok Tutor</h1>
      <p className="mt-3 text-muted leading-relaxed">
        Grok Tutor is a craft-learning workspace. Use sample lessons, live sessions, and optional
        thinking tools to practice trades and professions the way a good mentor would: clear
        explanations, solid practice, and careful claims.
      </p>

      <section className="mt-8 rounded-lg border border-border bg-surface/50 px-4 py-3 text-sm text-muted leading-relaxed">
        <strong className="text-fg font-medium">Credits.</strong> Libraries and research we build on
        are listed on the{" "}
        <Link to="/credits" className="text-teal-300 underline-offset-2 hover:underline">
          Credits
        </Link>{" "}
        page.
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Hexagon className="h-4 w-4 text-teal" /> What you get
        </h2>
        <ul className="list-disc pl-5 text-sm text-muted space-y-2 leading-relaxed">
          <li>{HELP_WORK_LINE}</li>
          <li>
            <strong className="text-fg">The Hive</strong> — {HELP_HIVE_BLURB}
          </li>
          <li>
            Thinking tools you can turn on when you want stricter habits: evidence checks, clear
            structure, and safety-first framing for high-stakes crafts.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal" /> Scope
        </h2>
        <ul className="list-disc pl-5 text-sm text-muted space-y-2 leading-relaxed">
          <li>
            Educational practice and study support — not a substitute for a license, certificate, or
            formal school credit.
          </li>
          <li>
            When real people, safety, or regulated work is on the line, stop and follow your site
            rules, licensed professionals, and official guidance.
          </li>
          <li>
            Built for learning and building skill — not for offensive security training or attack
            playbooks.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Where to start</h2>
        <ol className="space-y-3 text-sm text-muted leading-relaxed">
          <li>
            <strong className="text-fg">1. Samples</strong> — full multi-turn lessons ready to read
            anytime.
          </li>
          <li>
            <strong className="text-fg">2. Learn</strong> — open a session: pick industry, level, mode,
            and optional tools.
          </li>
          <li>
            <strong className="text-fg">3. Industries / Tools</strong> — browse crafts and thinking
            lenses.
          </li>
          <li>
            <strong className="text-fg">4. Progress</strong> — {HELP_PROGRESS_LINE}
          </li>
        </ol>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild size="sm" variant="teal">
            <Link to="/demo">
              <BookOpen className="h-3.5 w-3.5" /> Browse samples
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link to="/tutor">Start learning</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/">Open The Hive</Link>
          </Button>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal" /> Six modes
        </h2>
        <dl className="grid gap-3 text-sm">
          {[
            ["Explain", "A clear walkthrough of a topic."],
            ["Socratic", "Questions that help you reason it out."],
            ["Practice", "Guided drills you can reuse on the job."],
            ["Quiz", "Check understanding with feedback."],
            ["On-the-job", "A scenario under realistic pressure."],
            ["Career path", "Map skills and next steps for a craft."],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3"
            >
              <dt className="font-semibold text-fg">{k}</dt>
              <dd className="text-muted mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">The Hive · Map-first home</h2>
        <p className="text-sm text-muted leading-relaxed">
          {HELP_HIVE_LINE} {HELP_IDLE_MATCH}
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Integrity Triangle and Claim Diamond teach the habit of separating evidence, inference, and
          assumption — and of leaving the final call with a human.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Samples vs live</h2>
        <p className="text-sm text-muted leading-relaxed">
          <strong className="text-fg">Samples</strong> use crafted dialogues so you can review tone
          and quality anytime. <strong className="text-fg">Live Learn</strong> can use a model when
          the host has a key configured; otherwise you still get strong offline educational replies.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Get your own</h2>
        <p className="text-sm text-muted leading-relaxed">
          For classroom or team use under your own access and quota, see Get your own for the build
          prompt and setup path.
        </p>
        <Button asChild size="sm" variant="outline">
          <Link to="/get-yours">Get your own tutor</Link>
        </Button>
      </section>

      <section className="mt-10 rounded-[var(--radius-xl)] border border-border bg-surface/60 p-5">
        <h2 className="text-sm font-semibold tracking-tight">Where this runs</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">{hostMatrixBlurb()}</p>
        <ul className="mt-3 text-xs text-subtle space-y-1">
          <li>
            {HOST_MATRIX.samples.label}:{" "}
            <a
              className="text-teal underline-offset-2 hover:underline"
              href={HOST_MATRIX.samples.url}
            >
              {HOST_MATRIX.samples.url}
            </a>
          </li>
          <li>
            {HOST_MATRIX.lineage.label}:{" "}
            <a
              className="text-teal underline-offset-2 hover:underline"
              href={HOST_MATRIX.lineage.url}
            >
              {HOST_MATRIX.lineage.url}
            </a>
          </li>
        </ul>
      </section>

      <p className="mt-10 text-xs text-subtle">
        More steps:{" "}
        <Link to="/path" className="text-teal underline-offset-2 hover:underline">
          Your path
        </Link>
        .
      </p>
    </div>
  );
}
