/**
 * Live orchestration simulation HUD — full scenario beats, not just lights.
 * Shows situation, claim, thinking move, and real skill tools for this phase.
 */
import { BookOpen, ExternalLink, FlaskConical, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { OrchScenario, OrchSimStep } from "@/lib/hive-orchestration-sim";

type SkillChip = {
  id: string;
  title: string;
  acr: string;
  color: string;
  href: string;
};

type Props = {
  scenario: OrchScenario;
  step: OrchSimStep;
  phaseIndex: number;
  phaseCount: number;
  skills: SkillChip[];
  className?: string;
};

export function OrchestrationSimPanel({
  scenario,
  step,
  phaseIndex,
  phaseCount,
  skills,
  className,
}: Props) {
  return (
    <aside
      className={cn("hive-orch-sim", className)}
      data-testid="hive-orch-sim"
      aria-live="polite"
      aria-label="Orchestration simulation"
    >
      <header className="hive-orch-sim-head">
        <span className="hive-orch-sim-mark" aria-hidden>
          <FlaskConical className="h-3.5 w-3.5" />
        </span>
        <div>
          <strong>{scenario.title}</strong>
          <em>
            {scenario.craft} · beat {phaseIndex + 1}/{phaseCount}
          </em>
        </div>
        <span
          className="hive-orch-sim-acr"
          style={{ color: step.color, borderColor: `${step.color}66` }}
        >
          {step.acr}
        </span>
      </header>

      <p className="hive-orch-sim-phase" style={{ color: step.color }}>
        <Sparkles className="inline h-3 w-3 mr-1 opacity-80" />
        {step.label}
      </p>

      <section className="hive-orch-sim-block">
        <h4>Situation</h4>
        <p>{step.situation}</p>
      </section>

      <section className="hive-orch-sim-block">
        <h4>Claim under review</h4>
        <blockquote>
          {step.claim}
          <cite>basis · {step.claimBasis}</cite>
        </blockquote>
      </section>

      <section className="hive-orch-sim-block">
        <h4>Question</h4>
        <p className="hive-orch-sim-q">{step.question}</p>
      </section>

      <section className="hive-orch-sim-block">
        <h4>Thinking move</h4>
        <p>{step.thinkingMove}</p>
      </section>

      <section className="hive-orch-sim-block">
        <h4>Simulation beat</h4>
        <p className="hive-orch-sim-beat">{step.simulationBeat}</p>
      </section>

      <section className="hive-orch-sim-skills">
        <h4>Skills in this phase</h4>
        {skills.length === 0 ? (
          <p className="hive-orch-sim-empty">
            Priority tools will pin onto the field when available.
          </p>
        ) : (
          <ul>
            {skills.map((s) => (
              <li key={s.id}>
                <Link
                  to={s.href as any}
                  className="hive-orch-sim-skill"
                  style={{ ["--sk" as string]: s.color }}
                >
                  <span className="acr">{s.acr}</span>
                  <span className="ttl">{s.title}</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="hive-orch-sim-practice">
        <BookOpen className="inline h-3 w-3 mr-1" />
        {step.practiceHint}
      </p>

      <p className="hive-orch-sim-watchlog">
        <a href="/soak/observe.html" target="_blank" rel="noopener noreferrer">
          Open quad observe
        </a>
        <span> · log + 3 selectable Hives</span>
      </p>
    </aside>
  );
}
