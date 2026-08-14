/**
 * Grok Tutor — Normie Release Gate Simulation (unassisted)
 *
 * Per cycle:
 *   15 × PC environment journeys  (local base, default http://127.0.0.1:8085)
 *   15 × Grok.me environment journeys (public samples host)
 *
 * Release bar (operator): 100% pass on EVERY check, first-time, 4 cycles in a row.
 *
 * Usage:
 *   node scripts/release-normie-sim.mjs
 *   node scripts/release-normie-sim.mjs --cycles 4
 *   node scripts/release-normie-sim.mjs --pc http://127.0.0.1:8085 --public https://gt2samples.grok.me
 *
 * Live dashboard: scripts/sim-output/normie-sim/LIVE.html  (auto-refresh)
 * Full log:       scripts/sim-output/normie-sim/run-*.jsonl + summary.json
 */
import { writeFileSync, mkdirSync, appendFileSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const CYCLES = Math.max(1, parseInt(arg("--cycles", "4"), 10) || 4);
const PC_BASE = (arg("--pc", process.env.TUTOR_BASE || "http://127.0.0.1:8085"))
  .trim()
  .replace(/\/$/, "");
const PUBLIC_BASE = (arg("--public", process.env.TUTOR_PUBLIC || "https://gt2samples.grok.me")).replace(
  /\/$/,
  "",
);
const LINEAGE_BASE = (arg("--lineage", "https://groktutor.grok.me")).replace(/\/$/, "");
const REQUIRED_STREAK = Math.max(1, parseInt(arg("--streak", "4"), 10) || 4);

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = join(root, "scripts", "sim-output", "normie-sim", stamp);
mkdirSync(outDir, { recursive: true });
const liveDir = join(root, "scripts", "sim-output", "normie-sim");
mkdirSync(liveDir, { recursive: true });
const jsonlPath = join(outDir, "events.jsonl");
const summaryPath = join(outDir, "summary.json");
const liveHtmlPath = join(liveDir, "LIVE.html");
const liveJsonPath = join(liveDir, "LIVE.json");

const state = {
  startedAt: new Date().toISOString(),
  pcBase: PC_BASE,
  publicBase: PUBLIC_BASE,
  lineageBase: LINEAGE_BASE,
  requiredStreak: REQUIRED_STREAK,
  cyclesPlanned: CYCLES,
  cycles: [],
  consecutiveFullPass: 0,
  maxStreak: 0,
  releaseReady: false,
  events: [],
};

function logEvent(ev) {
  const row = { t: new Date().toISOString(), ...ev };
  state.events.push(row);
  appendFileSync(jsonlPath, JSON.stringify(row) + "\n", "utf8");
  // keep LIVE.json lean
  const live = {
    ...state,
    events: state.events.slice(-80),
    updatedAt: row.t,
  };
  writeFileSync(liveJsonPath, JSON.stringify(live, null, 2), "utf8");
  writeLiveHtml(live);
  const icon = ev.ok === true ? "✓" : ev.ok === false ? "✗" : "·";
  const line = `${icon} ${ev.scope || ""} ${ev.name || ev.type || ""}${ev.detail ? " — " + ev.detail : ""}`;
  console.log(line);
}

function writeLiveHtml(live) {
  const lastCycle = live.cycles[live.cycles.length - 1];
  const rows = (live.events || [])
    .slice(-40)
    .map((e) => {
      const cls = e.ok === true ? "ok" : e.ok === false ? "fail" : "info";
      return `<tr class="${cls}"><td>${esc(e.t?.slice(11, 19) || "")}</td><td>${esc(e.scope || "")}</td><td>${esc(e.name || e.type || "")}</td><td>${esc(e.detail || "")}</td></tr>`;
    })
    .join("\n");
  const cycleRows = (live.cycles || [])
    .map(
      (c) =>
        `<tr class="${c.fullPass ? "ok" : "fail"}"><td>${c.index}</td><td>${c.pcPass}/${c.pcTotal}</td><td>${c.publicPass}/${c.publicTotal}</td><td>${c.fullPass ? "PASS" : "FAIL"}</td><td>${c.ms}ms</td></tr>`,
    )
    .join("\n");
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta http-equiv="refresh" content="2"/>
<title>Normie Release Gate — LIVE</title>
<style>
  body{font-family:ui-sans-serif,system-ui,Segoe UI,sans-serif;background:#0b0f14;color:#e7eef7;margin:0;padding:24px}
  h1{font-size:1.35rem;margin:0 0 8px}
  .sub{color:#8b9bb0;margin-bottom:20px;font-size:.9rem}
  .badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:.75rem;font-weight:600;margin-right:8px}
  .ready{background:#0f3d2e;color:#4ade80}.not{background:#3d1515;color:#f87171}.run{background:#1e293b;color:#94a3b8}
  table{width:100%;border-collapse:collapse;margin:16px 0;font-size:.85rem}
  th,td{border-bottom:1px solid #1e293b;padding:8px 10px;text-align:left;vertical-align:top}
  th{color:#8b9bb0;font-weight:600}
  tr.ok td{color:#86efac} tr.fail td{color:#fca5a5} tr.info td{color:#cbd5e1}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media(max-width:900px){.grid{grid-template-columns:1fr}}
  code{background:#111827;padding:2px 6px;border-radius:4px}
  a{color:#5eead4}
</style></head><body>
<h1>Grok Tutor — Normie Release Gate (LIVE)</h1>
<p class="sub">Auto-refreshes every 2s · PC <code>${esc(live.pcBase)}</code> · Public <code>${esc(live.publicBase)}</code></p>
<p>
  <span class="badge ${live.releaseReady ? "ready" : "not"}">${live.releaseReady ? "RELEASE BAR MET" : "NOT RELEASE-READY"}</span>
  <span class="badge run">Streak ${live.consecutiveFullPass}/${live.requiredStreak}</span>
  <span class="badge run">Max streak ${live.maxStreak}</span>
  <span class="badge run">Cycles done ${(live.cycles || []).length}/${live.cyclesPlanned}</span>
</p>
<div class="grid">
  <div>
    <h2>Cycles</h2>
    <table><thead><tr><th>#</th><th>PC</th><th>Public</th><th>Result</th><th>Time</th></tr></thead>
    <tbody>${cycleRows || "<tr><td colspan=5>Waiting…</td></tr>"}</tbody></table>
  </div>
  <div>
    <h2>Last cycle detail</h2>
    <pre style="background:#111827;padding:12px;border-radius:8px;overflow:auto;font-size:12px">${esc(
      JSON.stringify(lastCycle || { status: "starting" }, null, 2),
    )}</pre>
  </div>
</div>
<h2>Event tail</h2>
<table><thead><tr><th>Time</th><th>Scope</th><th>Check</th><th>Detail</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="sub">Log dir: <code>${esc(outDir)}</code></p>
</body></html>`;
  writeFileSync(liveHtmlPath, html, "utf8");
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function http(base, path, opts = {}) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      ...opts,
      headers: {
        "user-agent": "GrokTutor-NormieSim/1.0",
        accept: "text/html,application/json,*/*",
        ...(opts.headers || {}),
      },
    });
    const text = await res.text();
    return {
      ok: true,
      status: res.status,
      text,
      ms: Date.now() - t0,
      url,
      headers: res.headers,
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      text: "",
      ms: Date.now() - t0,
      url,
      error: String(e?.message || e),
    };
  }
}

function check(scope, name, ok, detail = "") {
  logEvent({ type: "check", scope, name, ok: !!ok, detail: String(detail || "").slice(0, 240) });
  return !!ok;
}

/** 15 PC environment journeys — full local product bar for normies */
async function runPcSuite(cycleIndex) {
  const scope = `PC-C${cycleIndex}`;
  const results = [];
  const t = async (name, fn) => {
    try {
      const ok = await fn();
      results.push({ name, ok: !!ok });
      return !!ok;
    } catch (e) {
      check(scope, name, false, String(e?.message || e));
      results.push({ name, ok: false });
      return false;
    }
  };

  await t("PC01 Home 200 + product name", async () => {
    const r = await http(PC_BASE, "/");
    return check(scope, "PC01 Home 200 + product name", r.ok && r.status === 200 && /Grok Tutor/i.test(r.text), `${r.status} ${r.ms}ms`);
  });

  await t("PC02 Credits CAIOS exact attribution", async () => {
    const r = await http(PC_BASE, "/credits");
    const has =
      r.ok &&
      r.status === 200 &&
      /Built on CAIOS v1\.0 by inventor Jonathan M\. Schack/i.test(r.text) &&
      /19\/433,771/i.test(r.text) &&
      /cai-os\.com/i.test(r.text);
    return check(scope, "PC02 Credits CAIOS exact attribution", has, r.error || `${r.status}`);
  });

  await t("PC03 Help educational limits", async () => {
    const r = await http(PC_BASE, "/help");
    const ok =
      r.ok &&
      r.status === 200 &&
      /How to use/i.test(r.text) &&
      /not a license|educational/i.test(r.text) &&
      !/Sovereign Brain|sim-corps/i.test(r.text);
    return check(scope, "PC03 Help educational limits", ok, `${r.status}`);
  });

  await t("PC04 Learn /tutor", async () => {
    const r = await http(PC_BASE, "/tutor");
    return check(scope, "PC04 Learn /tutor", r.ok && r.status === 200, `${r.status} ${r.ms}ms`);
  });

  await t("PC05 Samples /demo", async () => {
    const r = await http(PC_BASE, "/demo");
    return check(scope, "PC05 Samples /demo", r.ok && r.status === 200 && /Sample|simulation|industry/i.test(r.text), `${r.status}`);
  });

  await t("PC06 Demo electrical craft sample", async () => {
    const r = await http(PC_BASE, "/demo/electrical");
    const ok = r.ok && r.status === 200 && !/\b\d{3}-\d{2}-\d{4}\b/.test(r.text);
    return check(scope, "PC06 Demo electrical craft sample", ok, `${r.status}`);
  });

  await t("PC07 Plan Lab /labs/cad", async () => {
    const r = await http(PC_BASE, "/labs/cad");
    const ok =
      r.ok &&
      r.status === 200 &&
      /Multi-Agent CAD|Plan Lab|Guanxing Qu|Pan-Chera/i.test(r.text);
    return check(scope, "PC07 Plan Lab /labs/cad", ok, `${r.status}`);
  });

  await t("PC08 CAD 100-sample pack integrity (static)", async () => {
    const p = join(root, "src/lib/cad/cad-samples-100.ts");
    if (!existsSync(p)) return check(scope, "PC08 CAD pack", false, "missing file");
    const raw = readFileSync(p, "utf8");
    const m = raw.match(/export const CAD_SAMPLES_100: CadSample\[\] = (\[[\s\S]*?\]);\s*\nexport const CAD_SAMPLE_COUNT/);
    if (!m) return check(scope, "PC08 CAD pack", false, "parse fail");
    const samples = JSON.parse(m[1]);
    const ids = new Set(samples.map((s) => s.id));
    const ok = samples.length === 100 && ids.size === 100;
    return check(scope, "PC08 CAD 100-sample pack integrity (static)", ok, `n=${samples.length} unique=${ids.size}`);
  });

  await t("PC09 Explore industries", async () => {
    const r = await http(PC_BASE, "/explore");
    return check(scope, "PC09 Explore industries", r.ok && r.status === 200, `${r.status}`);
  });

  await t("PC10 Path integrity education", async () => {
    const r = await http(PC_BASE, "/path");
    const ok = r.ok && r.status === 200 && /Integrity|Evidence|Assumption/i.test(r.text);
    return check(scope, "PC10 Path integrity education", ok, `${r.status}`);
  });

  await t("PC11 Thinking tools /skills", async () => {
    const r = await http(PC_BASE, "/skills");
    return check(scope, "PC11 Thinking tools /skills", r.ok && r.status === 200, `${r.status}`);
  });

  await t("PC12 Desk surface Learn", async () => {
    const r = await http(PC_BASE, "/tutor?surface=desk");
    return check(scope, "PC12 Desk surface Learn", r.ok && r.status === 200, `${r.status} ${r.ms}ms`);
  });

  await t("PC13 Progress local notes page", async () => {
    const r = await http(PC_BASE, "/progress");
    return check(scope, "PC13 Progress local notes page", r.ok && r.status === 200, `${r.status}`);
  });

  await t("PC14 OPSEC + educational jargon (home/help/path/credits)", async () => {
    const paths = ["/", "/help", "/path", "/credits", "/explore", "/skills"];
    let ok = true;
    let detail = "";
    for (const p of paths) {
      const r = await http(PC_BASE, p);
      if (!r.ok || r.status !== 200) {
        ok = false;
        detail = `${p} ${r.status}`;
        break;
      }
      // User-visible OPSEC / jargon (not internal skill path ids in hrefs)
      const bad =
        /city of |county of |\bmunicipality\b|Sovereign Lens|sim-corps|Offensive-Security|Conditional use permit|assessor\/parcel|LPIN Helix|Evidence Gate\b/i.test(
          r.text,
        ) ||
        /xai-[a-zA-Z0-9]{16,}/i.test(r.text) ||
        /sk-[a-zA-Z0-9]{20,}/.test(r.text);
      if (bad) {
        ok = false;
        detail = `jargon/leak on ${p}`;
        break;
      }
    }
    // static pack: no muni samples in civic pack
    const pack = readFileSync(join(root, "src/lib/demo/industry-packs.ts"), "utf8");
    if (/county portal|Conditional use permit 20|municipality/i.test(pack)) {
      ok = false;
      detail = "industry-packs still has muni-style samples";
    }
    return check(scope, "PC14 OPSEC + educational jargon (home/help/path/credits)", ok, detail || "clean");
  });

  await t("PC15 Get-yours + credits link hygiene", async () => {
    const g = await http(PC_BASE, "/get-yours");
    const c = await http(PC_BASE, "/credits");
    const ok =
      g.ok &&
      g.status === 200 &&
      c.ok &&
      c.status === 200 &&
      /MAC|Multi-Agent CAD|three\.js|React|TanStack/i.test(c.text);
    return check(scope, "PC15 Get-yours + credits link hygiene", ok, `get=${g.status} credits=${c.status}`);
  });

  const pass = results.filter((r) => r.ok).length;
  return { total: results.length, pass, fail: results.length - pass, results };
}

/**
 * 15 Grok.me environment journeys — what a normie actually hits on public samples host.
 * Unshipped local-only features fail honestly (release blocker).
 */
async function runPublicSuite(cycleIndex) {
  const scope = `GM-C${cycleIndex}`;
  const results = [];
  const t = async (name, fn) => {
    try {
      const ok = await fn();
      results.push({ name, ok: !!ok });
      return !!ok;
    } catch (e) {
      check(scope, name, false, String(e?.message || e));
      results.push({ name, ok: false });
      return false;
    }
  };

  await t("GM01 Public home 200", async () => {
    const r = await http(PUBLIC_BASE, "/");
    return check(scope, "GM01 Public home 200", r.ok && r.status === 200, `${r.status} ${r.ms}ms`);
  });

  await t("GM02 Product name Grok Tutor", async () => {
    const r = await http(PUBLIC_BASE, "/");
    return check(scope, "GM02 Product name Grok Tutor", r.ok && /Grok Tutor/i.test(r.text), `${r.status}`);
  });

  await t("GM03 OPSEC no municipal leakage", async () => {
    const r = await http(PUBLIC_BASE, "/");
    const ok = r.ok && !/city of |county of /i.test(r.text);
    return check(scope, "GM03 OPSEC no municipal leakage", ok, `${r.status}`);
  });

  await t("GM04 No API key leakage", async () => {
    const r = await http(PUBLIC_BASE, "/");
    const ok = r.ok && !/xai-[a-zA-Z0-9]{16,}/i.test(r.text) && !/sk-[a-zA-Z0-9]{20,}/.test(r.text);
    return check(scope, "GM04 No API key leakage", ok, `${r.status}`);
  });

  await t("GM05 Help for general public", async () => {
    const r = await http(PUBLIC_BASE, "/help");
    // 200 with guide OR honest 404 means not ready — for release we REQUIRE help
    const ok = r.ok && r.status === 200 && /How to use|Grok Tutor|learn/i.test(r.text);
    return check(scope, "GM05 Help for general public", ok, `${r.status} (release requires public help)`);
  });

  await t("GM06 Samples /demo", async () => {
    const r = await http(PUBLIC_BASE, "/demo");
    return check(scope, "GM06 Samples /demo", r.ok && r.status === 200, `${r.status}`);
  });

  await t("GM07 Learn /tutor", async () => {
    const r = await http(PUBLIC_BASE, "/tutor");
    return check(scope, "GM07 Learn /tutor", r.ok && r.status === 200, `${r.status}`);
  });

  await t("GM08 Credits page shipped (CAI-OS)", async () => {
    const r = await http(PUBLIC_BASE, "/credits");
    const ok =
      r.ok &&
      r.status === 200 &&
      /CAI-?OS|CAIOS|Jonathan M\. Schack|cai-os\.com/i.test(r.text);
    return check(scope, "GM08 Credits page shipped (CAI-OS)", ok, `${r.status} (release requires public credits)`);
  });

  await t("GM09 Plan Lab /labs/cad shipped", async () => {
    const r = await http(PUBLIC_BASE, "/labs/cad");
    const ok = r.ok && r.status === 200 && /CAD|Plan Lab|Multi-Agent/i.test(r.text);
    return check(scope, "GM09 Plan Lab /labs/cad shipped", ok, `${r.status}`);
  });

  await t("GM10 Explore industries", async () => {
    const r = await http(PUBLIC_BASE, "/explore");
    return check(scope, "GM10 Explore industries", r.ok && r.status === 200, `${r.status}`);
  });

  await t("GM11 Path page", async () => {
    const r = await http(PUBLIC_BASE, "/path");
    return check(scope, "GM11 Path page", r.ok && r.status === 200, `${r.status}`);
  });

  await t("GM12 Skills / thinking tools", async () => {
    const r = await http(PUBLIC_BASE, "/skills");
    return check(scope, "GM12 Skills / thinking tools", r.ok && r.status === 200, `${r.status}`);
  });

  await t("GM13 Desk surface works on public", async () => {
    const r = await http(PUBLIC_BASE, "/tutor?surface=desk");
    return check(scope, "GM13 Desk surface works on public", r.ok && r.status === 200, `${r.status}`);
  });

  await t("GM14 Lineage host groktutor still up", async () => {
    const r = await http(LINEAGE_BASE, "/");
    return check(scope, "GM14 Lineage host groktutor still up", r.ok && r.status === 200, `${r.status} ${r.ms}ms`);
  });

  await t("GM15 Public TTFB under 8s", async () => {
    const r = await http(PUBLIC_BASE, "/");
    const ok = r.ok && r.status === 200 && r.ms < 8000;
    return check(scope, "GM15 Public TTFB under 8s", ok, `${r.ms}ms`);
  });

  const pass = results.filter((r) => r.ok).length;
  return { total: results.length, pass, fail: results.length - pass, results };
}

async function runCycle(index) {
  const t0 = Date.now();
  logEvent({ type: "cycle_start", scope: `C${index}`, name: `Cycle ${index} start` });
  const pc = await runPcSuite(index);
  const pub = await runPublicSuite(index);
  const fullPass = pc.pass === pc.total && pub.pass === pub.total && pc.total === 15 && pub.total === 15;
  const cycle = {
    index,
    pcPass: pc.pass,
    pcTotal: pc.total,
    publicPass: pub.pass,
    publicTotal: pub.total,
    fullPass,
    ms: Date.now() - t0,
    pc,
    public: pub,
  };
  state.cycles.push(cycle);
  if (fullPass) {
    state.consecutiveFullPass += 1;
    state.maxStreak = Math.max(state.maxStreak, state.consecutiveFullPass);
  } else {
    state.consecutiveFullPass = 0;
  }
  logEvent({
    type: "cycle_end",
    scope: `C${index}`,
    name: `Cycle ${index} ${fullPass ? "FULL PASS" : "FAIL"}`,
    ok: fullPass,
    detail: `PC ${pc.pass}/${pc.total} · Public ${pub.pass}/${pub.total} · streak ${state.consecutiveFullPass}/${REQUIRED_STREAK}`,
  });
  writeFileSync(summaryPath, JSON.stringify(state, null, 2), "utf8");
  return cycle;
}

async function main() {
  console.log("\n══════════════════════════════════════════════════");
  console.log(" Grok Tutor · Normie Release Gate Simulation");
  console.log("══════════════════════════════════════════════════");
  console.log(` PC base:      ${PC_BASE}`);
  console.log(` Public base:  ${PUBLIC_BASE}`);
  console.log(` Lineage:      ${LINEAGE_BASE}`);
  console.log(` Cycles:       ${CYCLES}`);
  console.log(` Streak need:  ${REQUIRED_STREAK}× 100% (15+15 each)`);
  console.log(` Live board:   ${liveHtmlPath}`);
  console.log(` Log dir:      ${outDir}`);
  console.log("══════════════════════════════════════════════════\n");

  logEvent({ type: "sim_start", name: "Simulation start", detail: `cycles=${CYCLES}` });

  // Preflight
  const prePc = await http(PC_BASE, "/");
  check("PRE", "PC host reachable", prePc.ok && prePc.status === 200, prePc.error || `${prePc.status}`);
  const prePub = await http(PUBLIC_BASE, "/");
  check("PRE", "Public host reachable", prePub.ok && prePub.status === 200, prePub.error || `${prePub.status}`);

  if (!(prePc.ok && prePc.status === 200)) {
    logEvent({
      type: "fatal",
      ok: false,
      name: "Abort — PC host down",
      detail: "Start local Tutor on :8085 before release sim",
    });
    state.releaseReady = false;
    writeFileSync(summaryPath, JSON.stringify(state, null, 2), "utf8");
    process.exit(2);
  }

  for (let i = 1; i <= CYCLES; i++) {
    await runCycle(i);
    if (state.consecutiveFullPass >= REQUIRED_STREAK) {
      state.releaseReady = true;
      logEvent({
        type: "release_bar",
        ok: true,
        name: "RELEASE BAR MET",
        detail: `${REQUIRED_STREAK} consecutive full passes`,
      });
      break;
    }
  }

  if (!state.releaseReady) {
    logEvent({
      type: "release_bar",
      ok: false,
      name: "RELEASE BAR NOT MET",
      detail: `maxStreak=${state.maxStreak} need=${REQUIRED_STREAK}`,
    });
  }

  state.finishedAt = new Date().toISOString();
  writeFileSync(summaryPath, JSON.stringify(state, null, 2), "utf8");
  writeFileSync(join(liveDir, "LATEST-SUMMARY.json"), JSON.stringify(state, null, 2), "utf8");

  // Human markdown report
  const md = [
    `# Normie release gate — ${stamp}`,
    ``,
    `- Release ready: **${state.releaseReady ? "YES" : "NO"}**`,
    `- Consecutive full pass streak: ${state.consecutiveFullPass} (need ${REQUIRED_STREAK})`,
    `- Max streak: ${state.maxStreak}`,
    `- PC: ${PC_BASE}`,
    `- Public: ${PUBLIC_BASE}`,
    ``,
    `## Cycles`,
    ``,
    `| # | PC | Public | Full | ms |`,
    `|---|-----|--------|------|-----|`,
    ...state.cycles.map(
      (c) =>
        `| ${c.index} | ${c.pcPass}/${c.pcTotal} | ${c.publicPass}/${c.publicTotal} | ${c.fullPass ? "PASS" : "FAIL"} | ${c.ms} |`,
    ),
    ``,
    `## Failures (last cycle)`,
    ``,
  ];
  const last = state.cycles[state.cycles.length - 1];
  if (last) {
    for (const r of [...last.pc.results, ...last.public.results].filter((x) => !x.ok)) {
      md.push(`- FAIL: ${r.name}`);
    }
    if ([...last.pc.results, ...last.public.results].every((x) => x.ok)) md.push(`- (none)`);
  }
  writeFileSync(join(outDir, "REPORT.md"), md.join("\n"), "utf8");

  console.log("\n══════════════════════════════════════════════════");
  console.log(state.releaseReady ? " RESULT: RELEASE BAR MET" : " RESULT: NOT RELEASE-READY");
  console.log(` Streak: ${state.consecutiveFullPass}/${REQUIRED_STREAK} (max ${state.maxStreak})`);
  console.log(` Report: ${join(outDir, "REPORT.md")}`);
  console.log(` Live:   ${liveHtmlPath}`);
  console.log("══════════════════════════════════════════════════\n");

  process.exit(state.releaseReady ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(3);
});
