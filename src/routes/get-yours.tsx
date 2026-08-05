import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AOS_SOURCE } from "@/lib/aos-skills";
import { toast } from "sonner";

export const Route = createFileRoute("/get-yours")({
  component: GetYoursPage,
});

const OFFICIAL_PROMPT = `Build Grok Tutor for publication on Grok.Me — a polished general educational app for ALL industries and trades.

Product name: Grok Tutor

Core features:
1) Home landing: clear value prop, how sessions work, popular industries
2) Explore: search + sector filters across 25–30 industries/trades (electrical, plumbing, HVAC, welding, construction, nursing, EMT, pharmacy, software, cybersecurity, IT support, data, CNC, quality, accounting, sales, project management, culinary, hospitality, law enforcement, teaching, CDL, aviation, design, video, energy, agriculture, automotive, logistics)
3) Tutor workspace: pick industry, level (beginner/intermediate/advanced), mode (Explain, Socratic, Practice, Quiz, On-the-job scenario, Career path), optional topic chips
4) Live AI tutoring via xAI API (server-only, grok-4.5, XAI_API_KEY) — Socratic teaching, quizzes, workplace scenarios, safety-first for trades
5) Progress page: sessions, study minutes, saved notes (localStorage/zustand)
6) Auth: Google + X sign-in via platform auth; guest learning allowed
7) Hybrid demo model: guest daily message limits, higher limits when signed in, and a "Get your own Grok Tutor" page with this build prompt so others can remix under their SuperGrok and use their own API quota
8) Design: dark editorial UI, design tokens, no purple/emoji slop, mobile-first, lucide icons
9) OG meta APP_NAME = "Grok Tutor" for Grok.Me share cards
10) Keep CreatedWithGrokBanner; serve on 0.0.0.0:8080

Ship demo-ready, not a scaffold.`;

const MINIMAL_REMIX = `${OFFICIAL_PROMPT}

Additional educational bridge (keep true to original Tutor):
11) When it helps learning, the Tutor may suggest careful-thinking tools (evidence checking, structured teams, civic literacy) for the learner to explore.
12) Add a small Thinking Tools section that links to:
    - https://github.com/AdventureNLearn/AOS-v3---LPIN
    - https://github.com/AdventureNLearn/AOS-Public
    - and a short in-app map of thinking tools for learners.
Keep the product a tutor. Do not rebuild the full library inside the app.`;

function GetYoursPage() {
  const [copied, setCopied] = useState<"official" | "remix" | null>(null);

  async function copy(text: string, which: "official" | "remix") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      toast.success("Copied");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Could not copy — select the text manually");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Get your own tutor</h1>
      <p className="mt-2 text-muted leading-relaxed">
        This app is the live prototype. Publish a personal copy under your SuperGrok account so
        your learners use your access. Paste a build prompt into Grok Build below.
      </p>

      <div className="mt-5 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
        <div className="text-xs font-medium text-teal uppercase tracking-wide">Live prototype</div>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          You are already using it.{" "}
          <Link to="/tutor" className="text-teal underline-offset-2 hover:underline">
            Start a lesson
          </Link>{" "}
          anytime. An earlier public Grok Tutor is kept only as{" "}
          <a
            href={AOS_SOURCE.originalTutorRef}
            className="text-muted underline-offset-2 hover:underline hover:text-fg"
            target="_blank"
            rel="noreferrer"
          >
            reference
          </a>
          .
        </p>
      </div>

      <div className="mt-8 space-y-8">
        <section>
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="font-semibold tracking-tight">Build prompt</h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void copy(OFFICIAL_PROMPT, "official")}
            >
              {copied === "official" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy
            </Button>
          </div>
          <pre className="text-xs leading-relaxed whitespace-pre-wrap rounded-[var(--radius-xl)] border border-border bg-surface p-4 max-h-[420px] overflow-y-auto">
            {OFFICIAL_PROMPT}
          </pre>
          <p className="mt-2 text-xs text-subtle">
            Historical reference page:{" "}
            <a
              href={AOS_SOURCE.originalGetYours}
              className="text-muted hover:text-fg hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              earlier Get Yours
            </a>{" "}
            <ExternalLink className="inline h-3 w-3" />
          </p>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="font-semibold tracking-tight">Optional learning-tools remix</h2>
            <Button size="sm" variant="secondary" onClick={() => void copy(MINIMAL_REMIX, "remix")}>
              {copied === "remix" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy
            </Button>
          </div>
          <p className="text-sm text-muted mb-2 leading-relaxed">
            Same tutor, plus two small additions: suggest careful-thinking tools when useful, and a
            short panel that points learners to the open library. Still a tutor — not a rebuild of
            the whole skill system.
          </p>
          <pre className="text-xs leading-relaxed whitespace-pre-wrap rounded-[var(--radius-xl)] border border-border bg-surface p-4 max-h-[420px] overflow-y-auto">
            {MINIMAL_REMIX}
          </pre>
        </section>
      </div>
    </div>
  );
}
