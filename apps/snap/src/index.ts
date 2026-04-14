import { Hono } from "hono";
import { cors } from "hono/cors";
import type { SnapFunction } from "@farcaster/snap";
import { registerSnapHandler } from "@farcaster/snap-hono";

const app = new Hono();

app.use("*", cors({ origin: "*" }));

const handler: SnapFunction = async (_ctx) => {
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
};

registerSnapHandler(app, handler);

export default app;
