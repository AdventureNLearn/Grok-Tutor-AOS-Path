import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Hexagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimpleMarkdown } from "@/components/markdown";
import { getIndustry } from "@/lib/industries";
import { reasoningLessonBody } from "@/lib/reasoning-lesson-bodies";
import { getReasoningTrack } from "@/lib/reasoning-tracks";

export const Route = createFileRoute("/demo/reason/$trackId")({
  validateSearch: (s: Record<string, unknown>) => ({
    surface: typeof s.surface === "string" ? s.surface : undefined,
  }),
  loader: ({ params }) => {
    const track = getReasoningTrack(params.trackId);
    if (!track) throw notFound();
    const industry = getIndustry(track.industryId);
    const body = reasoningLessonBody(track.id);
    if (!body) throw notFound();
    return { track, industryName: industry?.name ?? track.industryId, body };
  },
  component: ReasoningTrackPage,
});

function ReasoningTrackPage() {
  const { track, industryName, body } = Route.useLoaderData();

  const hiveHref = `/?view=3d&field=examples&shape=${track.hiveShape}&track=${track.id}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8" data-testid="reasoning-track">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/demo">
          <ArrowLeft className="h-3.5 w-3.5" /> All sample lessons
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="teal">Example reasoning</Badge>
        <Badge variant="outline">{industryName}</Badge>
        <Badge variant="outline">Lens · {track.hiveShape}</Badge>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">{track.title}</h1>
      <p className="mt-2 text-muted leading-relaxed">{track.summary}</p>
      <p className="mt-2 text-xs text-subtle">
        Educational sample only — not a credential. You make the final call on real work.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="teal">
          <a href={hiveHref}>
            <Hexagon className="h-3.5 w-3.5" /> See on The Hive
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/tutor" search={{ industry: track.industryId }}>
            <BookOpen className="h-3.5 w-3.5" /> Continue in Learn
          </Link>
        </Button>
      </div>

      <div className="mt-8 rounded-[var(--radius-xl)] border border-border bg-surface px-5 py-6">
        <SimpleMarkdown text={body} />
      </div>
    </div>
  );
}
