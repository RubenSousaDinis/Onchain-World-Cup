/**
 * BACKWARD COMPATIBILITY LAYER
 *
 * `config` and `wagmiAdapter` come from the lightweight wagmi-core module.
 * `modal` is a lazy proxy: the heavy AppKit bundle is loaded on demand
 * (Web3Provider's useEffect starts loading it after first paint, so by
 * the time a user can click Connect Wallet it is always ready).
 *
 * Callers of modal.open() need no changes — the API is identical.
 */

export { wagmiAdapter, wagmiConfig as config } from "./wallet/wagmi-core"

/**
 * Lazy modal proxy.
 * Initialises AppKit on first call if not already done.
 * Safe to call from any "use client" component.
 */
export const modal = {
  open: async () => {
    const { initAppKit } = await import("./wallet/appkit-modal")
    return initAppKit().open()
  },
}
