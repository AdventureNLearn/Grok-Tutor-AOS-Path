/**
 * Interactive mini-games for Pepe & Apu truth ops.
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactElement,
} from "react";
import type { MiniGameKind, MiniGameResult } from "@/lib/village-game/minigames";
import {
  MINI_GAME_META,
  gradeScore,
  resultFlavor,
} from "@/lib/village-game/minigames";
import { cn } from "@/lib/utils";

type Props = {
  kind: MiniGameKind;
  missionTitle: string;
  onComplete: (result: MiniGameResult) => void;
};

function finish(
  kind: MiniGameKind,
  score: number,
  onComplete: (r: MiniGameResult) => void,
) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const grade = gradeScore(s);
  onComplete({
    kind,
    score: s,
    grade,
    flavor: resultFlavor(kind, grade),
  });
}

/* ── STARE OFF: release in green zone ──────────────────── */
function StareOff({ kind, onComplete }: Props) {
  const [pos, setPos] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const dir = useRef(1);
  const posRef = useRef(0);

  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => {
      if (!holding) return;
      setPos((p) => {
        let n = p + dir.current * 2.2;
        if (n >= 100) {
          n = 100;
          dir.current = -1;
        }
        if (n <= 0) {
          n = 0;
          dir.current = 1;
        }
        posRef.current = n;
        return n;
      });
    }, 16);
    return () => clearInterval(t);
  }, [holding, done]);

  function release() {
    if (done || !holding) return;
    setHolding(false);
    setDone(true);
    const p = posRef.current;
    // Green zone 42-58
    const dist = Math.abs(p - 50);
    const score = Math.max(0, 100 - dist * 4.2);
    finish(kind, score, onComplete);
  }

  return (
    <div className="mg-body">
      <p className="mg-instr">Hold STARE — release when the bar is in the GREEN zone.</p>
      <div className="mg-bar-track">
        <div className="mg-bar-green" style={{ left: "42%", width: "16%" }} />
        <div className="mg-bar-needle" style={{ left: `${pos}%` }} />
      </div>
      <button
        type="button"
        className={cn("mg-big-btn pepe", holding && "is-hot")}
        onPointerDown={() => {
          if (done) return;
          setHolding(true);
        }}
        onPointerUp={release}
        onPointerLeave={() => {
          if (holding) release();
        }}
      >
        {done ? "STARE LOCKED" : holding ? "👁 STARING…" : "HOLD TO STARE"}
      </button>
    </div>
  );
}

/* ── RECEIPT MATCH ─────────────────────────────────────── */
function ReceiptMatch({ kind, onComplete }: Props) {
  const items = useMemo(() => {
    const real = [
      "Court docket #4821 (stamped)",
      "Tuesday GPS bus log",
      "Signed vendor contract p.4",
      "Timestamped photo of the sign",
      "Bank wire to Grant Goblin LLC",
    ];
    const fake = [
      "Anon blog: 'trust me bro'",
      "Screenshot of a screenshot of a vibe",
      "AI summary with no links",
      "TED talk quote, misattributed",
      "Cartman's handwritten 'facts'",
    ];
    const pool = [
      ...real.slice(0, 3).map((t) => ({ t, real: true })),
      ...fake.slice(0, 3).map((t) => ({ t, real: false })),
    ];
    // shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    }
    return pool;
  }, []);

  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [locked, setLocked] = useState(false);

  function toggle(i: number) {
    if (locked) return;
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  }

  function submit() {
    if (locked) return;
    setLocked(true);
    let good = 0;
    let bad = 0;
    items.forEach((it, i) => {
      const sel = picked.has(i);
      if (sel && it.real) good++;
      if (sel && !it.real) bad++;
      if (!sel && it.real) bad++;
    });
    const score = Math.max(0, good * 34 - bad * 18);
    finish(kind, score, onComplete);
  }

  return (
    <div className="mg-body">
      <p className="mg-instr">
        Tap the <strong>3 real receipts</strong>. Leave the Fedslop alone.
      </p>
      <div className="mg-receipts">
        {items.map((it, i) => (
          <button
            key={it.t}
            type="button"
            className={cn("mg-receipt", picked.has(i) && "is-on")}
            onClick={() => toggle(i)}
            disabled={locked}
          >
            {picked.has(i) ? "☑" : "☐"} {it.t}
          </button>
        ))}
      </div>
      <button type="button" className="mg-big-btn apu" onClick={submit} disabled={locked}>
        FILE THE BINDER
      </button>
    </div>
  );
}

/* ── HAGGLE slider ─────────────────────────────────────── */
function Haggle({ kind, onComplete }: Props) {
  const [x, setX] = useState(0);
  const [running, setRunning] = useState(true);
  const dir = useRef(1);
  const xRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setX((p) => {
        let n = p + dir.current * 2.8;
        if (n >= 100) {
          n = 100;
          dir.current = -1;
        }
        if (n <= 0) {
          n = 0;
          dir.current = 1;
        }
        xRef.current = n;
        return n;
      });
    }, 16);
    return () => clearInterval(t);
  }, [running]);

  function stop() {
    if (!running) return;
    setRunning(false);
    const p = xRef.current;
    // Sweet spot 30-45 (based discount zone)
    const mid = 37.5;
    const dist = Math.abs(p - mid);
    const score = Math.max(0, 100 - dist * 3.5);
    finish(kind, score, onComplete);
  }

  return (
    <div className="mg-body">
      <p className="mg-instr">
        Stop the price in the <strong>BASED ZONE</strong> (left-center). Full price = shame.
      </p>
      <div className="mg-bar-track haggle">
        <div className="mg-bar-green" style={{ left: "28%", width: "20%" }} />
        <div className="mg-bar-needle" style={{ left: `${x}%` }} />
        <span className="mg-price-labels">
          <i>FREE</i>
          <i>BASED</i>
          <i>FULL SLOP MSRP</i>
        </span>
      </div>
      <button type="button" className="mg-big-btn apu" onClick={stop} disabled={!running}>
        {running ? "LOCK PRICE" : "SOLD"}
      </button>
    </div>
  );
}

/* ── FACT BLITZ ────────────────────────────────────────── */
function FactBlitz({ kind, onComplete }: Props) {
  const deck = useMemo(
    () =>
      [
        { q: "Kenny dies a statistically cursed amount of the time.", truth: true },
        { q: "A QR code on mystery meat is a primary source.", truth: false },
        { q: "Primary sources beat sermon decks.", truth: true },
        { q: "NFT goats should vote on zoning.", truth: false },
        { q: "Timestamps are a form of violence.", truth: false },
        { q: "The bus route yesterday still happened.", truth: true },
        { q: "'Lived vibes' equal court records.", truth: false },
        { q: "Apu's binder is more reliable than a teleprompter.", truth: true },
        { q: "Beige Honesty is a real moral system.", truth: false },
        { q: "Pepe and Apu are not fucking around.", truth: true },
      ].sort(() => Math.random() - 0.5),
    [],
  );
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(10);
  const locked = useRef(false);
  const scoreRef = useRef(0);
  const iRef = useRef(0);

  const goNext = useCallback(
    (delta: number) => {
      if (locked.current) return;
      locked.current = true;
      const nextScore = scoreRef.current + delta;
      scoreRef.current = nextScore;
      const nextI = iRef.current + 1;
      if (nextI >= deck.length) {
        finish(kind, nextScore, onComplete);
        return;
      }
      iRef.current = nextI;
      setScore(nextScore);
      setI(nextI);
      setLeft(10);
      locked.current = false;
    },
    [deck.length, kind, onComplete],
  );

  useEffect(() => {
    locked.current = false;
    const t = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          goNext(0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [i, goNext]);

  if (i >= deck.length) return null;
  const card = deck[i]!;

  return (
    <div className="mg-body">
      <p className="mg-instr">
        TRUE or FEDSLOP — {i + 1}/{deck.length} · ⏱ {left}s · score {score}
      </p>
      <div className="mg-fact-card">{card.q}</div>
      <div className="mg-fact-btns">
        <button
          type="button"
          className="mg-big-btn pepe"
          onClick={() => goNext(card.truth ? 10 : 0)}
        >
          TRUE
        </button>
        <button
          type="button"
          className="mg-big-btn danger"
          onClick={() => goNext(!card.truth ? 10 : 0)}
        >
          FEDSLOP
        </button>
      </div>
    </div>
  );
}

/* ── SNOWBALL FIGHT mash ───────────────────────────────── */
function SnowballFight({ kind, onComplete }: Props) {
  const [hits, setHits] = useState(0);
  const [enemy, setEnemy] = useState(0);
  const [secs, setSecs] = useState(8);
  const hitsRef = useRef(0);
  const enemyRef = useRef(0);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setEnemy((e) => {
        const n = Math.min(100, e + 3.2);
        enemyRef.current = n;
        return n;
      });
    }, 200);
    const timer = window.setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          window.clearInterval(tick);
          window.clearInterval(timer);
          const score = Math.max(
            0,
            hitsRef.current * 4 - enemyRef.current * 0.35,
          );
          finish(kind, Math.min(100, score), onComplete);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(timer);
    };
  }, [kind, onComplete]);

  return (
    <div className="mg-body">
      <p className="mg-instr">
        MASH snowballs! Fill YOUR meter before Message hits 100. ⏱ {secs}s
      </p>
      <div className="mg-dual-meters">
        <div>
          <span>YOUR SNOW 🐸</span>
          <div className="mg-meter">
            <i style={{ width: `${Math.min(100, hits * 4)}%`, background: "#4ade80" }} />
          </div>
        </div>
        <div>
          <span>MESSAGE 📢</span>
          <div className="mg-meter">
            <i style={{ width: `${enemy}%`, background: "#ef4444" }} />
          </div>
        </div>
      </div>
      <button
        type="button"
        className="mg-big-btn pepe mash"
        onClick={() => {
          hitsRef.current += 1;
          setHits((h) => h + 1);
        }}
      >
        ❄️ THROW SNOWBALL
      </button>
    </div>
  );
}

/* ── MEMORY HOLE sequence ──────────────────────────────── */
function MemoryHole({ kind, onComplete }: Props) {
  const seq = useMemo(() => {
    const icons = ["📄", "🕒", "🗻", "🚌", "🐸", "🧾"];
    return Array.from({ length: 4 }, () => icons[Math.floor(Math.random() * icons.length)]!);
  }, []);
  const [phase, setPhase] = useState<"show" | "input">("show");
  const [showI, setShowI] = useState(0);
  const [input, setInput] = useState<string[]>([]);
  const options = ["📄", "🕒", "🗻", "🚌", "🐸", "🧾"];

  useEffect(() => {
    if (phase !== "show") return;
    if (showI >= seq.length) {
      setPhase("input");
      return;
    }
    const t = window.setTimeout(() => setShowI((i) => i + 1), 700);
    return () => clearTimeout(t);
  }, [phase, showI, seq.length]);

  function tap(icon: string) {
    if (phase !== "input") return;
    const next = [...input, icon];
    setInput(next);
    if (next.length >= seq.length) {
      let good = 0;
      next.forEach((v, i) => {
        if (v === seq[i]) good++;
      });
      finish(kind, (good / seq.length) * 100, onComplete);
    }
  }

  return (
    <div className="mg-body">
      <p className="mg-instr">
        {phase === "show"
          ? "MEMORIZE the truth sequence…"
          : "REPEAT it. The Timeline Editor is watching."}
      </p>
      <div className="mg-memory-show">
        {phase === "show" && showI > 0 ? seq[showI - 1] : phase === "input" ? input.join(" ") || "…" : "…"}
      </div>
      {phase === "input" ? (
        <div className="mg-memory-opts">
          {options.map((o) => (
            <button key={o} type="button" className="mg-mem-btn" onClick={() => tap(o)}>
              {o}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const GAMES: Record<MiniGameKind, (p: Props) => ReactElement> = {
  stare_off: (p) => <StareOff {...p} />,
  receipt_match: (p) => <ReceiptMatch {...p} />,
  haggle: (p) => <Haggle {...p} />,
  fact_blitz: (p) => <FactBlitz {...p} />,
  snowball_fight: (p) => <SnowballFight {...p} />,
  memory_hole: (p) => <MemoryHole {...p} />,
};

export function MiniGameStage(props: Props) {
  const meta = MINI_GAME_META[props.kind];
  return (
    <div className="mg-stage" role="dialog" aria-label={meta.name}>
      <div className="mg-card">
        <p className="mg-kicker">MINI-GAME · REQUIRED</p>
        <h2 className="mg-title">{meta.name}</h2>
        <p className="mg-sub">{meta.blurb}</p>
        <p className="mg-mission-ref">{props.missionTitle}</p>
        {GAMES[props.kind](props)}
      </div>
    </div>
  );
}
