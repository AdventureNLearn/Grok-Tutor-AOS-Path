import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AOS_SOURCE } from "@/lib/aos-skills";

export const Route = createFileRoute("/path")({
  component: PathPage,
});

function PathPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">How to get started</h1>
      <p className="mt-2 text-muted leading-relaxed">
        You are already in the live prototype. Use the steps below when you want your own copy or
        deeper library notes.
      </p>

      <ol className="mt-10 space-y-6">
        <li className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="text-xs font-medium text-teal uppercase tracking-wide">Step 1</div>
          <h2 className="mt-1 font-semibold text-lg tracking-tight">Learn here</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            This app is the live prototype. Open a tutoring session, pick your industry and a
            learning mode, turn on one or two thinking tools, and ask a real question from your
            shop, clinic, classroom, or desk.
          </p>
          <Button asChild size="sm" variant="teal" className="mt-3">
            <Link to="/tutor">Start a lesson</Link>
          </Button>
        </li>

        <li className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="text-xs font-medium text-teal uppercase tracking-wide">Step 2</div>
          <h2 className="mt-1 font-semibold text-lg tracking-tight">
            Get your own tutor when you are ready
          </h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            If you have SuperGrok, you can publish your own copy so your learners use your access.
            Copy the build prompt from{" "}
            <Link to="/get-yours" className="text-teal underline-offset-2 hover:underline">
              Get your own tutor
            </Link>
            . An earlier public Get Yours page is also available as reference.
          </p>
        </li>

        <li className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="text-xs font-medium text-teal uppercase tracking-wide">Step 3</div>
          <h2 className="mt-1 font-semibold text-lg tracking-tight">Use the wider skill library</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Adventure OS is a public collection of careful-thinking methods for civic work,
            evidence, and professional practice. Browse the map inside this tutor, then go deeper
            in the open library when you want the full notes.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link to="/skills">Thinking tools map</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href={AOS_SOURCE.url} target="_blank" rel="noreferrer">
                Open library <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </li>

        <li className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="text-xs font-medium text-teal uppercase tracking-wide">Step 4</div>
          <h2 className="mt-1 font-semibold text-lg tracking-tight">A simple way to ask for rigor</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            In any serious Grok conversation — or as a starting line in this tutor — you can say:
          </p>
          <blockquote className="mt-3 text-sm leading-relaxed rounded-[var(--radius-md)] border border-border bg-bg p-4 text-fg">
            Help me look at this carefully. Check my assumptions, label what is evidence versus
            guesswork, and keep a short notebook of decisions as we go. My goal is:{" "}
            <span className="text-muted">[say your goal]</span>
          </blockquote>
          <p className="mt-3 text-sm text-muted">
            That is the human version of turning on Sovereign Lens, Evidence Gate, and a working
            notebook together.
          </p>
        </li>

        <li className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="text-xs font-medium text-teal uppercase tracking-wide">Step 5</div>
          <h2 className="mt-1 font-semibold text-lg tracking-tight">Reference materials</h2>
          <ul className="mt-2 text-sm text-muted space-y-1.5 list-disc pl-5 leading-relaxed">
            <li>Stay in this live prototype for craft learning with thinking tools.</li>
            <li>
              Optionally compare with the earlier public Grok Tutor (reference only — see open
              materials below).
            </li>
            <li>Use a separate careful chat for deep analysis when a topic is high-stakes.</li>
          </ul>
        </li>
      </ol>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="text-base">Open materials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            {
              href: AOS_SOURCE.url,
              label: "Adventure OS library",
              desc: "Thinking tools and civic craft",
            },
            {
              href: AOS_SOURCE.publicUrl,
              label: "AOS Public",
              desc: "Replicable public-interest frameworks",
            },
            {
              href: AOS_SOURCE.lpinUrl,
              label: "LPINv3",
              desc: "Light · Proof · Integrity · Navigation",
            },
            {
              href: "https://github.com/AdventureNLearn/ark-civic",
              label: "ARK Civic",
              desc: "Civic oversight research system",
            },
            {
              href: AOS_SOURCE.pathRepoUrl,
              label: "Grok Tutor + AOS path notes",
              desc: "Short bridge documents for builders",
            },
            {
              href: AOS_SOURCE.originalTutorRef,
              label: "Earlier Grok Tutor (reference)",
              desc: "Previous public build — not this live prototype",
            },
            {
              href: AOS_SOURCE.originalGetYours,
              label: "Earlier Get Yours (reference)",
              desc: "Historical build-prompt page",
            },
          ].map((r) => (
            <a
              key={r.href}
              href={r.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 hover:border-border-strong"
            >
              <span>
                <span className="font-medium text-fg">{r.label}</span>
                <span className="block text-xs text-subtle">{r.desc}</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-subtle shrink-0 mt-0.5" />
            </a>
          ))}
        </CardContent>
      </Card>

      <p className="mt-8 text-sm text-subtle leading-relaxed">
        Philosophy: enough information for curious people to start. This app is the live
        prototype. Open materials over guided products.
      </p>
    </div>
  );
}
