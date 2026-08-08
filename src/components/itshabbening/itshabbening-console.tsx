import { useMemo, useState } from "react";
import { Flame, Search, Skull, Zap } from "lucide-react";
import { INDUSTRIES } from "@/lib/industries";
import {
  ITSHABBENING_NAME,
  VERIFIED_NOTES,
  itshabbeningStats,
  type VerifiedNote,
  type VerifiedTier,
} from "@/lib/verified";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useHiveDeskStore } from "@/lib/hive-desk-store";

type TierFilter = VerifiedTier | "all" | "safety" | "stale";

function isStale(n: VerifiedNote) {
  const t = Date.parse(n.reviewBy);
  return Number.isNaN(t) || t < Date.now();
}

function industryLabel(id: string) {
  return INDUSTRIES.find((i) => i.id === id)?.name ?? id;
}

function tierLabel(t: VerifiedTier) {
  if (t === "must") return "DO THIS OR CRY";
  if (t === "when_relevant") return "WHEN IT COMES UP";
  return "NERD LORE";
}

function modeHuman(modes?: string[]) {
  if (!modes?.length) return "pretty much whenever";
  const map: Record<string, string> = {
    explain: "explain it",
    socratic: "grill me",
    practice: "practice",
    quiz: "quiz",
    scenario: "oh crap scenario",
    career: "career panic",
  };
  return modes.map((m) => map[m] ?? m).join(" · ");
}

function humanSources(sources: string[]) {
  return sources.map((s) =>
    s
      .replace(/\s*\(educational[^)]*\)/gi, "")
      .replace(/\s*\(educational\)/gi, "")
      .trim(),
  );
}

const ROASTS = [
  "Not medical advice. Not legal advice. Not your dad.",
  "If you paste real patient names in here, you are the problem.",
  "This lane is a cartoon. The safety facts still aren't.",
  "Professional Grok Tutor is next door. This is the chaos twin.",
];

export function ItshabbeningConsole() {
  const stats = useMemo(() => itshabbeningStats(), []);
  const openRoute = useHiveDeskStore((s) => s.openRoute);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<TierFilter>("all");
  const [industry, setIndustry] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    VERIFIED_NOTES[0]?.id ?? null,
  );
  const roast = useMemo(
    () => ROASTS[Math.floor(Date.now() / 60000) % ROASTS.length]!,
    [],
  );

  const inDesk =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("surface") === "desk";

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return VERIFIED_NOTES.filter((n) => {
      if (tier === "safety" && !n.safetyCritical) return false;
      if (tier === "stale" && !isStale(n)) return false;
      if (
        tier !== "all" &&
        tier !== "safety" &&
        tier !== "stale" &&
        n.tier !== tier
      )
        return false;
      if (industry === "global") {
        if (n.scope.industries && n.scope.industries.length > 0) return false;
      } else if (industry !== "all") {
        const inds = n.scope.industries ?? [];
        if (inds.length > 0 && !inds.includes(industry)) return false;
      }
      if (!query) return true;
      const blob = [
        n.title,
        n.statement,
        n.limits,
        n.sources.join(" "),
        ...(n.scope.topicHints ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(query);
    });
  }, [q, tier, industry]);

  const selected =
    filtered.find((n) => n.id === selectedId) ??
    filtered[0] ??
    VERIFIED_NOTES.find((n) => n.id === selectedId) ??
    null;

  const tiers: { id: TierFilter; label: string }[] = [
    { id: "all", label: "EVERYTHING" },
    { id: "must", label: "DO THIS OR CRY" },
    { id: "when_relevant", label: "SITUATIONAL" },
    { id: "reference", label: "NERD LORE" },
    { id: "safety", label: "DON'T DIE" },
    { id: "stale", label: "EXPIRED MILK" },
  ];

  function openMemeLearn() {
    const ind = selected?.scope.industries?.[0];
    const base = ind ? `/tutor?industry=${encodeURIComponent(ind)}` : "/tutor";
    const href = `${base}${base.includes("?") ? "&" : "?"}lane=meme`;
    const title = ind
      ? `ITSHABBENING · ${industryLabel(ind)}`
      : "ITSHABBENING · Learn";
    if (inDesk) {
      window.location.href = `${href}&surface=desk`;
    } else {
      openRoute(href, title, "#facc15", "ITS");
    }
  }

  return (
    <div className="itsh-root itsh-meme">
      <div className="itsh-aurora" aria-hidden />
      <div className="itsh-grid-bg" aria-hidden />

      {/* Explicit separation from professional product */}
      <div className="itsh-split-banner" role="note">
        <strong>MEME LANE ONLY</strong>
        <span>
          This is <em>not</em> the professional Grok Tutor UI. Same facts, different
          clothes. Serious Learn lives on the normal Learn comb.
        </span>
      </div>

      <header className="itsh-hero">
        <div className="itsh-hero-mark" aria-hidden>
          <Flame className="h-7 w-7" />
        </div>
        <div className="itsh-hero-text">
          <p className="itsh-kicker">south park energy · still not your lawyer</p>
          <h1 className="itsh-title">
            {ITSHABBENING_NAME || "ITSHABBENING"}
          </h1>
          <p className="itsh-lede">
            The anti-bullshit bag. Human words only. No internal codes, no hash soup,
            no “synergize your learning journey.”
          </p>
          <p className="itsh-roast">“{roast}”</p>
        </div>

        <div className="itsh-stat-row">
          <div className="itsh-stat">
            <span className="itsh-stat-val">{stats.total}</span>
            <span className="itsh-stat-lbl">facts in the bag</span>
          </div>
          <div className="itsh-stat">
            <span className="itsh-stat-val">{stats.must}</span>
            <span className="itsh-stat-lbl">non-negotiables</span>
          </div>
          <div className="itsh-stat itsh-stat-hot">
            <span className="itsh-stat-val">{stats.safetyCritical}</span>
            <span className="itsh-stat-lbl">don&apos;t die notes</span>
          </div>
          <div className="itsh-stat">
            <span className="itsh-stat-val">{stats.industriesCovered}</span>
            <span className="itsh-stat-lbl">jobs covered</span>
          </div>
        </div>

        {stats.stale > 0 ? (
          <div className="itsh-stale-banner">
            <Skull className="h-4 w-4" />
            {stats.stale} note{stats.stale === 1 ? "" : "s"} past the “check this again”
            date — treat like gas-station sushi.
          </div>
        ) : (
          <div className="itsh-fresh-banner">
            <Zap className="h-4 w-4" />
            Dates still green. Still not a license. Still better than vibes.
          </div>
        )}
      </header>

      <div className="itsh-toolbar">
        <div className="itsh-search">
          <Search className="h-4 w-4 opacity-60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="type something you actually need to know…"
            aria-label="Search ITSHABBENING"
          />
        </div>
        <div className="itsh-filters">
          {tiers.map((t) => (
            <button
              key={t.id}
              type="button"
              className={cn("itsh-chip", tier === t.id && "is-on")}
              onClick={() => setTier(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="itsh-industry-select">
          <label className="sr-only" htmlFor="itsh-ind">
            Job
          </label>
          <select
            id="itsh-ind"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="all">all the jobs</option>
            <option value="global">global only</option>
            {INDUSTRIES.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="itsh-body">
        <aside className="itsh-list" aria-label="Notes">
          <div className="itsh-list-meta">
            {filtered.length} hit{filtered.length === 1 ? "" : "s"} — tap one
          </div>
          <ul>
            {filtered.map((n) => {
              const stale = isStale(n);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cn(
                      "itsh-list-item",
                      selected?.id === n.id && "is-selected",
                      n.safetyCritical && "is-safety",
                      stale && "is-stale",
                    )}
                    onClick={() => setSelectedId(n.id)}
                  >
                    <span className="itsh-list-title">{n.title}</span>
                    <span className="itsh-list-tags">
                      <span className="itsh-pill">{tierLabel(n.tier)}</span>
                      {n.safetyCritical ? (
                        <span className="itsh-pill itsh-pill-hot">DON&apos;T DIE</span>
                      ) : null}
                      {stale ? (
                        <span className="itsh-pill itsh-pill-stale">EXPIRED</span>
                      ) : null}
                    </span>
                    <span className="itsh-list-scope">
                      {!n.scope.industries?.length
                        ? "everywhere"
                        : n.scope.industries.map(industryLabel).join(" · ")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 ? (
            <p className="itsh-empty">
              Nothing matched. Clear the search or pick another filter.
            </p>
          ) : null}
        </aside>

        <section className="itsh-detail" aria-live="polite">
          {selected ? (
            <>
              <div className="itsh-detail-top">
                <p className="itsh-detail-kicker">okay so listen</p>
                <h2>{selected.title}</h2>
                <div className="itsh-detail-badges">
                  <span className="itsh-pill is-on">{tierLabel(selected.tier)}</span>
                  {selected.safetyCritical ? (
                    <span className="itsh-pill itsh-pill-hot">SAFETY — SERIOUSLY</span>
                  ) : null}
                  {isStale(selected) ? (
                    <span className="itsh-pill itsh-pill-stale">DOUBLE-CHECK THIS</span>
                  ) : (
                    <span className="itsh-pill">still in date</span>
                  )}
                </div>
              </div>

              <div className="itsh-panel itsh-statement">
                <h3>the actual point</h3>
                <p>{selected.statement}</p>
              </div>

              <div className="itsh-panel itsh-limits">
                <h3>chill — what this is NOT</h3>
                <p>{selected.limits}</p>
              </div>

              <div className="itsh-panel">
                <h3>where this came from (human words)</h3>
                <ul className="itsh-sources">
                  {humanSources(selected.sources).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="itsh-meta-grid">
                <div>
                  <span className="itsh-meta-lbl">last human check</span>
                  <span className="itsh-meta-val">{selected.verifiedOn}</span>
                </div>
                <div>
                  <span className="itsh-meta-lbl">check again by</span>
                  <span className="itsh-meta-val">{selected.reviewBy}</span>
                </div>
                <div className="itsh-meta-span">
                  <span className="itsh-meta-lbl">shows up when you&apos;re doing</span>
                  <span className="itsh-meta-val">
                    {modeHuman(selected.scope.modes)}
                  </span>
                </div>
              </div>

              {(selected.scope.topicHints?.length ?? 0) > 0 ? (
                <div className="itsh-hints">
                  <h3>if you type stuff like…</h3>
                  <div className="itsh-hint-row">
                    {selected.scope.topicHints!.map((h) => (
                      <span key={h} className="itsh-hint">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="itsh-cta-row">
                <Button
                  type="button"
                  variant="teal"
                  size="lg"
                  className="itsh-big-btn"
                  onClick={openMemeLearn}
                >
                  open meme Learn with this job
                </Button>
                <p className="itsh-cta-note">
                  Opens Learn in <strong>meme lane</strong> only. Professional tutor
                  stays clean and separate.
                </p>
              </div>
            </>
          ) : (
            <p className="itsh-empty">
              Pick something from the left or this panel just stares at you.
            </p>
          )}
        </section>
      </div>

      <footer className="itsh-foot">
        <span>ITSHABBENING = meme lane · Grok Tutor Learn = serious lane</span>
        <span>same safety facts · zero codespeak in this UI</span>
      </footer>
    </div>
  );
}
