import { cookieStorage, createStorage } from "@wagmi/core"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { base } from "@reown/appkit/networks"
import { baseAccount } from "wagmi/connectors"

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

export const networks = [base] as [typeof base]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  networks,
  projectId,
  connectors: [
    baseAccount({ appName: "Onchain World Cup" }),
  ],
  // Reown AppKit manages its own connectors (embedded wallet / social login via w3mAuth).
  // Coinbase Wallet is discovered automatically by AppKit.
  // Farcaster connector is added directly in FarcasterProvider only when
  // in a Farcaster context, to avoid interfering with AppKit's social login flow.
  // baseAccount enables automatic wallet connection in the Base App's in-app browser.
  // No custom transports — WalletConnect Blockchain API is used by default.
})
