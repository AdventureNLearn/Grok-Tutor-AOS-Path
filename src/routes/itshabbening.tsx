import { createFileRoute } from "@tanstack/react-router";
import { ItshabbeningConsole } from "@/components/itshabbening/itshabbening-console";

export const Route = createFileRoute("/itshabbening")({
  component: ItshabbeningPage,
  head: () => ({
    meta: [
      { title: "ITSHABBENING · Grok Tutor" },
      {
        name: "description",
        content:
          "ITSHABBENING — meme lane only. Unhinged UI, same safety facts. Separate from professional Grok Tutor.",
      },
    ],
  }),
});

function ItshabbeningPage() {
  return <ItshabbeningConsole />;
}
