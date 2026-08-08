import { createFileRoute } from "@tanstack/react-router";
import { MemeVillageWorkspace } from "@/components/hive/meme-village-workspace";

/**
 * MEME LANE ONLY — Pepe/Apu village RPG.
 * Not linked from professional Grok Tutor nav or hive combs.
 */
export const Route = createFileRoute("/meme-village")({
  component: MemeVillagePage,
  head: () => ({
    meta: [
      { title: "Meme village · Grok Tutor (meme lane)" },
      {
        name: "description",
        content:
          "Optional meme village surface. Separate from the professional Grok Tutor hive.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function MemeVillagePage() {
  return (
    <div className="relative min-h-dvh" data-lane="meme" data-surface="meme-village">
      <MemeVillageWorkspace />
    </div>
  );
}
