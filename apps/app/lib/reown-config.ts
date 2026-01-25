/**
 * BACKWARD COMPATIBILITY LAYER
 *
 * This file maintains backward compatibility with existing code.
 * New code should import from:
 * - lib/wallet/desktop-config.ts (for desktop wallet configuration)
 * - lib/wallet/farcaster-config.ts (for Farcaster wallet utilities)
 * - hooks/useWalletConnection.ts (for unified wallet hook)
 */

export { wagmiAdapter, desktopWalletModal as modal, wagmiConfig as config } from "./wallet/desktop-config"
