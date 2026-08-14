/**
 * Release curriculum snapshot — product Hive / library surface.
 * Counts are curated product numbers (not live filesystem scans in the browser).
 * Educational only · not accreditation.
 */

export const RELEASE_CURRICULUM = {
  label: "Grok Tutor",
  educationalOnly: true,
  notACredential: true,
  industries: 32,
  modes: 6,
  /** Public sample lessons ready for learners */
  cleanUniquePublic: 1100,
  /** Flagship public coverage pack */
  readyPublicTotal: 274,
  readyPublicClean: 273,
  /** Plan Lab offline samples */
  macSamples: 100,
  partmodeSamples: 20,
  planLabTotal: 120,
  sources: {
    planLab: "/labs/cad",
    samples: "/demo",
    library: "/library",
  },
} as const;

/** Public HUD line — plain language, no internal audit jargon */
export function releaseHudLine(): string {
  const r = RELEASE_CURRICULUM;
  return `${r.industries} crafts · ${r.planLabTotal} Plan Lab samples · ${r.readyPublicClean} ready lessons · ${r.cleanUniquePublic} public samples`;
}
