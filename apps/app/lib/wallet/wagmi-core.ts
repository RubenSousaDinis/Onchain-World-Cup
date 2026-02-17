/**
 * WAGMI CORE CONFIG — lightweight, loaded synchronously.
 *
 * Only the WagmiAdapter and wagmiConfig live here.
 * createAppKit() (the wallet modal UI) is deferred to appkit-modal.ts
 * and initialized after first paint via Web3Provider's useEffect.
 */

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { base, baseSepolia } from "@reown/appkit/networks"
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector"
import { http } from "wagmi"

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""
export const networks = [base, baseSepolia] as const

const baseSepoliaRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org"
const baseMainnetRpcUrl = process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || "https://mainnet.base.org"

export const wagmiAdapter = new WagmiAdapter({
  networks: [base, baseSepolia],
  projectId,
  ssr: true,
  connectors: [farcasterMiniApp()],
  transports: {
    [base.id]: http(baseMainnetRpcUrl),
    [baseSepolia.id]: http(baseSepoliaRpcUrl),
  },
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
