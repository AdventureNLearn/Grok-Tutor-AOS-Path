/**
 * Grok Tutor route operability audit (dev server must be up).
 * Usage: node scripts/audit-routes.mjs [baseUrl]
 */
const base = (process.argv[2] || "http://127.0.0.1:8080").replace(/\/$/, "");

const routes = [
  "/",
  "/tutor",
  "/tutor?surface=desk",
  "/tutor?industry=electrical&surface=desk",
  "/demo",
  "/demo?surface=desk",
  "/demo/electrical",
  "/demo/electrical?surface=desk",
  "/explore",
  "/explore?surface=desk",
  "/skills",
  "/skills?surface=desk",
  "/skills/evidence-gate",
  "/skills/evidence-gate?surface=desk",
  "/progress",
  "/progress?surface=desk",
  "/path",
  "/path?surface=desk",
  "/get-yours",
  "/get-yours?surface=desk",
  "/itshabbening",
  "/itshabbening?surface=desk",
  "/meme-village",
  "/meme-village?surface=desk",
];

const rows = [];
for (const path of routes) {
  const url = `${base}${path}`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, { redirect: "follow" });
    const text = await res.text();
    rows.push({
      path,
      status: res.status,
      ms: Date.now() - t0,
      bytes: text.length,
      ok: res.status >= 200 && res.status < 400,
    });
  } catch (err) {
    rows.push({
      path,
      status: 0,
      ms: Date.now() - t0,
      bytes: 0,
      ok: false,
      error: String(err?.message || err),
    });
  }
}

const fails = rows.filter((r) => !r.ok);
console.log(`Base: ${base}`);
console.table(rows.map(({ path, status, ms, bytes, ok }) => ({ path, status, ms, bytes, ok })));
console.log(`PASS ${rows.length - fails.length}/${rows.length}`);
if (fails.length) {
  console.error("FAILURES:", fails);
  process.exit(1);
}
