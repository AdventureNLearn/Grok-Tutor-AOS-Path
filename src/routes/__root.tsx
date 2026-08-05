import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { CreatedWithGrokBanner } from "@/components/created-with-grok-banner";
import { AppShell } from "@/components/layout";
import { Toaster } from "sonner";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Grok Tutor" },
      {
        name: "description",
        content:
          "Trade and professional tutoring with careful thinking tools — evidence, practice, and safety-first craft learning.",
      },
      { property: "og:title", content: "Grok Tutor" },
      {
        property: "og:description",
        content: "Learn any trade or profession with honest, evidence-first tutoring.",
      },
      { name: "theme-color", content: "#0a0a0b" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <CreatedWithGrokBanner />
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster theme="dark" position="bottom-right" richColors closeButton />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
