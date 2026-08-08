/**
 * Public-facing claims / OPSEC / no-overclaim audit (local tree + live base).
 * Does NOT claim accreditation — checks educational hygiene only.
 *
 *   node scripts/audit-public-claims.mjs [baseUrl]
 */
import {
  readFileSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const base = (process.argv[2] || "http://127.0.0.1:8085").replace(/\/$/, "");
const outDir = join(root, "scripts", "sim-output");
mkdirSync(outDir, { recursive: true });

const findings = [];
let hard = 0;
let soft = 0;
let pass = 0;

function add(level, code, detail, file = "") {
  findings.push({ level, code, detail, file });
  if (level === "hard") hard++;
  else if (level === "soft") soft++;
  else pass++;
  const mark = level === "hard" ? "✗" : level === "soft" ? "!" : "✓";
  console.log(`  ${mark} [${level}] ${code}${file ? ` @ ${file}` : ""} — ${detail}`);
}

function walk(dir, acc = [], depth = 0) {
  if (depth > 8) return acc;
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of names) {
    if (
      name === "node_modules" ||
      name === ".git" ||
      name === "dist" ||
      name === ".output" ||
      name === "sim-output" ||
      name === "edge-quad"
    )
      continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, acc, depth + 1);
    else acc.push(p);
  }
  return acc;
}

const textExt = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".md",
  ".html",
  ".json",
  ".css",
]);

console.log(`\nGrok Tutor · public claims / OPSEC audit\nRoot: ${root}\nBase: ${base}\n`);

// ── 1. Required disclaimer / attribution files ───────────
console.log("1. Required surfaces");
{
  const help = join(root, "src", "routes", "help.tsx");
  const credits = join(root, "src", "routes", "credits.tsx");
  const readme = join(root, "README.md");
  if (existsSync(help) && /not a substitute|license|certificate/i.test(readFileSync(help, "utf8")))
    add("pass", "help-disclaimer", "Help states educational / not substitute for license");
  else add("hard", "help-disclaimer", "Help missing educational non-substitute language", "src/routes/help.tsx");

  if (
    existsSync(credits) &&
    /CAI-OS|CAIOS|licensed work|learning and practice/i.test(readFileSync(credits, "utf8"))
  )
    add("pass", "credits-attribution", "Credits has CAI-OS / practice framing");
  else add("hard", "credits-attribution", "Credits missing attribution / practice framing", "src/routes/credits.tsx");

  if (
    existsSync(readme) &&
    /educational/i.test(readFileSync(readme, "utf8")) &&
    /not a replacement|not a support desk|credential/i.test(readFileSync(readme, "utf8"))
  )
    add("pass", "readme-limits", "README states educational limits");
  else add("soft", "readme-limits", "README limits language weak or missing", "README.md");
}

// ── 2. Forbidden patterns in product source / public ─────
console.log("\n2. Forbidden / leak patterns");
const forbid = [
  {
    re: /C:\\\\Users\\[\\/]|C:\/Users\/|C:\\\\AOS\\/i,
    code: "host-path",
    level: "hard",
    msg: "Absolute host path",
  },
  { re: /file:\/\//i, code: "file-url", level: "hard", msg: "file:// URL" },
  {
    re: /\b\d{3}-\d{2}-\d{4}\b/,
    code: "ssn-like",
    level: "hard",
    msg: "SSN-like pattern",
  },
  {
    re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    code: "email",
    level: "soft",
    msg: "Email address (review if personal)",
    allowFiles: [/credits\.tsx$/, /caios|NOTICE|README|attribution|schack|cai-os/i],
  },
];

// Overclaim patterns (public product chrome)
const overclaim = [
  {
    re: /\b(accredited\s+degree|board[-\s]?certified\s+program|guarantees?\s+licen[cs]e)\b/i,
    code: "overclaim-credential",
    level: "hard",
    msg: "Sounds like credential/accreditation claim",
  },
  {
    re: /\b(FDA[-\s]?approved|HIPAA[-\s]?compliant\s+therapy|medical\s+device)\b/i,
    code: "overclaim-clinical",
    level: "hard",
    msg: "Clinical / device overclaim",
  },
  {
    re: /\b(100%\s+accurate|never\s+wrong|replaces?\s+your\s+lawyer|replaces?\s+your\s+doctor)\b/i,
    code: "overclaim-absolute",
    level: "hard",
    msg: "Absolute / professional-replacement claim",
  },
];

const scanRoots = [
  join(root, "src"),
  join(root, "public"),
  join(root, "README.md"),
  join(root, "NOTICE"),
].filter((p) => existsSync(p));

const files = [];
for (const r of scanRoots) {
  const st = statSync(r);
  if (st.isDirectory()) walk(r, files);
  else files.push(r);
}

for (const file of files) {
  const ext = file.slice(file.lastIndexOf("."));
  if (!textExt.has(ext) && !file.endsWith("NOTICE")) continue;
  // skip large binary-ish
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (text.length > 2_000_000) continue;
  const rel = relative(root, file).replace(/\\/g, "/");

  for (const rule of forbid) {
    if (rule.allowFiles && rule.allowFiles.some((a) => a.test(rel))) continue;
    // allow known public contact on credits only for email rule already handled
    if (rule.code === "email" && /cai-os\.com|jon@cai-os/i.test(text) && /credits|README|NOTICE|caios/i.test(rel))
      continue;
    if (rule.re.test(text)) {
      // ignore comments about C:\ in scripts that are local ops? still hard in src/public
      if (rel.startsWith("scripts/") && rule.code === "host-path") {
        add("soft", rule.code, `${rule.msg} in scripts (local ops)`, rel);
      } else {
        add(rule.level, rule.code, rule.msg, rel);
      }
    }
  }
  for (const rule of overclaim) {
    if (rule.re.test(text)) add(rule.level, rule.code, rule.msg, rel);
  }
  // municipality leakage (soft in content packs can be educational generic)
  if (
    /\b(City of |County of |Municipality of )\b/.test(text) &&
    !/municipality names|no municipality/i.test(text)
  ) {
    add("soft", "geo-phrase", "City/County of … phrase — review for real geo", rel);
  }
}

// ── 3. Live HTTP OPSEC on key routes ─────────────────────
console.log("\n3. Live HTTP");
async function http(path) {
  try {
    const res = await fetch(`${base}${path}`, {
      headers: { "user-agent": "GrokTutor-PublicAudit/1.0" },
    });
    return { status: res.status, text: await res.text() };
  } catch (e) {
    return { status: 0, text: "", error: String(e?.message || e) };
  }
}

for (const path of ["/", "/help", "/credits", "/soak/observe-log.html", "/?orch=1&shape=spine"]) {
  const r = await http(path);
  if (r.status === 200) add("pass", "http-200", path);
  else add("hard", "http-200", `${path} status=${r.status} ${r.error || ""}`);
  if (r.text && /C:\\\\Users|C:\/Users\/|file:\/\//i.test(r.text))
    add("hard", "http-host-path", `Host path in response ${path}`);
  else if (r.status === 200) add("pass", "http-clean", `No host path in ${path}`);
}

// ── Summary ──────────────────────────────────────────────
const summary = {
  at: new Date().toISOString(),
  base,
  root,
  hard,
  soft,
  pass,
  ok: hard === 0,
  note:
    "Educational product audit only — does not certify accreditation, professional licensure, or regulatory approval.",
  findings,
};
const outPath = join(outDir, "audit-public-claims-report.json");
writeFileSync(outPath, JSON.stringify(summary, null, 2), "utf8");

const md = [
  `# Public claims / OPSEC audit`,
  ``,
  `- At: ${summary.at}`,
  `- Base: ${base}`,
  `- Hard: **${hard}** · Soft: **${soft}** · Pass checks: **${pass}**`,
  `- Result: **${summary.ok ? "PASS (0 hard)" : "FAIL"}**`,
  ``,
  summary.note,
  ``,
  `## Findings`,
  ...findings
    .filter((f) => f.level !== "pass")
    .slice(0, 80)
    .map((f) => `- **${f.level}** \`${f.code}\`${f.file ? ` — \`${f.file}\`` : ""}: ${f.detail}`),
  ``,
];
writeFileSync(join(outDir, "audit-public-claims-REPORT.md"), md.join("\n"), "utf8");

console.log(
  `\n${summary.ok ? "PASS" : "FAIL"} hard=${hard} soft=${soft} pass=${pass}\n→ ${outPath}\n`,
);
process.exit(hard === 0 ? 0 : 1);
