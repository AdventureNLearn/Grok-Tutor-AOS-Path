import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { AOS_SKILLS, AOS_SOURCE, getSkill } from "@/lib/aos-skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/skills/$skillId")({
  loader: ({ params }) => {
    const skill = getSkill(params.skillId);
    if (!skill || !skill.tutorEnabled) throw notFound();
    return skill;
  },
  component: SkillDetailPage,
});

function SkillDetailPage() {
  const skill = Route.useLoaderData();
  const related = AOS_SKILLS.filter(
    (s) => s.tutorEnabled && s.category === skill.category && s.id !== skill.id,
  ).slice(0, 4);
  const categoryLabel =
    skill.category === "core"
      ? "Clear thinking"
      : skill.category === "narrative"
        ? "Reading the room"
        : skill.category === "civic"
          ? "Public & civic work"
          : skill.category === "content"
            ? "Explaining well"
            : skill.category === "visual"
              ? "Seeing structure"
              : "Craft & practice";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/skills">
          <ArrowLeft className="h-3.5 w-3.5" /> All thinking tools
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="teal">{categoryLabel}</Badge>
        <Badge>{skill.tierLabel}</Badge>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">{skill.name}</h1>
      <p className="mt-4 text-muted leading-relaxed text-lg">{skill.purpose}</p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">How it helps in a lesson</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted leading-relaxed">{skill.tutorRole}</p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">In practice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted leading-relaxed">
            In a live lesson, the tutor uses this habit to keep answers honest and useful.
            It pairs especially well with {skill.goodFor.slice(0, 2).join(" and ").toLowerCase()}.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">How you might ask for it</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-fg leading-relaxed rounded-[var(--radius-md)] border border-border bg-bg p-4">
            “{skill.askPrompt}”
          </p>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        {skill.goodFor.map((g) => (
          <Badge key={g}>{g}</Badge>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild variant="teal">
          <Link to="/tutor" search={{ skill: skill.id }}>
            <BookOpen className="h-4 w-4" /> Use in a lesson
          </Link>
        </Button>
        <Button asChild variant="outline">
          <a
            href={`${AOS_SOURCE.url}/tree/main/${skill.path}`}
            target="_blank"
            rel="noreferrer"
          >
            Full reference notes <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>

      {related.length ? (
        <section className="mt-12">
          <h2 className="text-sm font-medium text-subtle uppercase tracking-wide mb-3">
            Related in {categoryLabel}
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {related.map((s) => (
              <Link
                key={s.id}
                to="/skills/$skillId"
                params={{ skillId: s.id }}
                className="rounded-[var(--radius-md)] border border-border bg-surface px-3 py-3 text-sm hover:border-border-strong"
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-subtle mt-0.5 line-clamp-2">{s.purpose}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
