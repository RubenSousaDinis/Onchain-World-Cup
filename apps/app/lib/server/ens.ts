import { createPublicClient, http, toCoinType } from "viem"
import { mainnet, base } from "viem/chains"

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(
    process.env.ETH_MAINNET_RPC_URL ||
      process.env.NEXT_PUBLIC_ETH_MAINNET_RPC_URL ||
      "https://ethereum.publicnode.com"
  ),
})

/**
 * Resolves the best ENS name for an address.
 * Tries Base L2 primary name first, falls back to L1 primary name.
 * Returns null if no ENS name is found.
 */
export async function resolveEnsName(address: string): Promise<string | null> {
  try {
    // 1. Try Base L2 primary name (e.g. "rubendinis.base.eth")
    const baseName = await publicClient
      .getEnsName({
        address: address as `0x${string}`,
        coinType: toCoinType(base.id),
      })
      .catch(() => null)

    if (baseName) return baseName

    // 2. Fall back to L1 primary name (e.g. "rubendinis.eth")
    const l1Name = await publicClient
      .getEnsName({ address: address as `0x${string}` })
      .catch(() => null)

    return l1Name ?? null
  } catch {
    return null
  }
}
