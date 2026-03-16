/**
 * APPKIT MODAL
 *
 * createAppKit() is called at module level — matching the official Reown example
 * (next-wagmi-app-router). This ensures the w3m-iframe starts loading from
 * secure.walletconnect.org immediately when the client bundle is parsed,
 * so @w3m-frame/READY fires well before the user can click a social login button.
 *
 * When createAppKit() was deferred (dynamic import / useEffect), @w3m-frame/READY
 * arrived AFTER SOCIAL_LOGIN_STARTED — the iframe was mid-init when APP_CONNECT_SOCIAL
 * was sent, causing social login to hang forever.
 */

import { createAppKit } from "@reown/appkit/react"
import { base } from "@reown/appkit/networks"
import { wagmiAdapter, projectId, networks } from "./wagmi-core"

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: base,
  projectId,
  metadata: {
    name: "Onchain World Cup",
    description: "Vote on World Cup 2026 matches with ETH on Base network",
    url: process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.onchainworldcup.xyz",
    icons: ["https://app.onchainworldcup.xyz/logo.jpg"],
  },
  enableAuthLogger: false,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'apple', 'github', 'x'],
    onramp: true,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "hsl(142.1 76.2% 36.3%)",
    "--w3m-border-radius-master": "2px",
  },
  allowUnsupportedChain: true,
})

// ---------- Social login diagnostics ----------
// Logs key AppKit events and w3m-iframe postMessages to the console.
// Uses console.warn so logs survive Next.js removeConsole in production.
if (typeof window !== "undefined") {
  // Track w3m-iframe messages (iframe ↔ page)
  window.addEventListener("message", (e) => {
    if (typeof e.data?.type !== "string") return
    const t = e.data.type as string
    if (t.startsWith("@w3m-frame/") || t.startsWith("@w3m-app/")) {
      // eslint-disable-next-line no-console
      console.warn(`[w3m] ${t}`, e.data.payload ?? "")
    }
  })

  modal.subscribeEvents((event) => {
    const name = event.data.event
    // eslint-disable-next-line no-console
    console.warn("[AppKit]", name)
    if (name === "SOCIAL_LOGIN_REQUEST_USER_DATA") {
      // eslint-disable-next-line no-console
      console.warn("[AppKit] ⏳ APP_CONNECT_SOCIAL sent — waiting for FRAME_CONNECT_SOCIAL_SUCCESS…")
      setTimeout(() => {
        // eslint-disable-next-line no-console
        console.warn("[AppKit] ⚠️ 30s elapsed — iframe still hasn't responded")
      }, 30_000)
    }
  })
}
