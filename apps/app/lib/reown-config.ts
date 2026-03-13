export { wagmiAdapter, wagmiConfig as config } from "./wallet/wagmi-core"

// Re-export modal directly — createAppKit() is called at module level in appkit-modal.ts
export { modal } from "./wallet/appkit-modal"
