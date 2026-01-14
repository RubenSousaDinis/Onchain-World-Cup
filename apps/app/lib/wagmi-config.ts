import { createConfig, http } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

import { coinbaseWallet } from "wagmi/connectors"

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "Crypto World Cup 2026",
      preference: "smartWalletOnly",
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
})
