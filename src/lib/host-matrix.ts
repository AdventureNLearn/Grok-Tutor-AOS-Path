/**
 * Dual-host product map for Help and Path.
 */
export const HOST_MATRIX = {
  samples: {
    id: "gt2samples",
    label: "Samples host",
    url: "https://gt2samples.grok.me/",
    role: "Public samples and craft-learning track",
  },
  lineage: {
    id: "groktutor",
    label: "Earlier tutor host",
    url: "https://groktutor.grok.me/",
    role: "Earlier industry tutor surface (history / pin quote root)",
  },
  local: {
    id: "local",
    label: "This machine",
    url: "http://127.0.0.1:8085/",
    role: "Local development build (port 8085)",
  },
} as const;

export function hostMatrixBlurb(): string {
  return `${HOST_MATRIX.samples.label} (${HOST_MATRIX.samples.url}) is the main public samples track. ${HOST_MATRIX.lineage.label} (${HOST_MATRIX.lineage.url}) is the earlier tutor surface kept for history.`;
}
