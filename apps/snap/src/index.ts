import { Hono } from "hono";
import { registerSnapHandler } from "@farcaster/snap-hono";

const app = new Hono();

registerSnapHandler(app, async (ctx) => {
  const base =
    process.env.SNAP_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:3003";

  if (ctx.action.type === "get") {
    return {
      version: "2.0",
      theme: { accent: "blue" },
      ui: {
        root: "page",
        elements: {
          page: {
            type: "stack",
            props: {},
            children: ["title", "body", "subtext", "cta"],
          },
          title: {
            type: "text",
            props: {
              content: "Onchain World Cup is LIVE ⚽",
              weight: "bold",
            },
          },
          body: {
            type: "text",
            props: {
              content:
                "211 nations. 48 spots. The community decides — with ETH on Base.",
            },
          },
          subtext: {
            type: "text",
            props: {
              content: "Qualification closes April 21. Early votes cost less.",
              size: "sm",
            },
          },
          cta: {
            type: "button",
            props: { label: "Vote Now", variant: "primary" },
            on: {
              press: {
                action: "open_url",
                params: { target: "https://app.onchainworldcup.xyz" },
              },
            },
          },
        },
      },
    };
  }

  // POST — re-render same snap (shouldn't be reached with open_url, but safe fallback)
  return {
    version: "2.0",
    theme: { accent: "blue" },
    ui: {
      root: "page",
      elements: {
        page: {
          type: "stack",
          props: {},
          children: ["title", "cta"],
        },
        title: {
          type: "text",
          props: { content: "Vote at app.onchainworldcup.xyz", weight: "bold" },
        },
        cta: {
          type: "button",
          props: { label: "Open App", variant: "primary" },
          on: {
            press: {
              action: "open_url",
              params: { target: "https://app.onchainworldcup.xyz" },
            },
          },
        },
      },
    },
  };
});

export default app;
