import { createPublicClient, http } from "viem"
import { mainnet, base } from "viem/chains"

// L2 Reverse Registrar deployed by Basenames on Base mainnet.
// Setting a "primary" name in the Basenames app writes to this contract.
// The name is stored in the default resolver, NOT via the L1 ENS multichain
// reverse record — so the L1 coinType approach does not work for Basenames.
const L2_REVERSE_REGISTRAR = "0x79ea96012eea67a83431f1701b3dff7e37f9e282" as const
const L2_DEFAULT_RESOLVER = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD" as const

// Always use Base mainnet for ENS/Basename resolution — never a testnet RPC.
// A dedicated env var takes precedence; we never fall back to the app's
// BASE_MAINNET_RPC_URL because that variable may point to a testnet endpoint.
const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_MAINNET_ENS_RPC_URL || "https://mainnet.base.org"),
})

const ethClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETH_MAINNET_RPC_URL || "https://eth.llamarpc.com"),
})

/**
 * Resolves the best ENS/Basename for an address.
 * 1. Base L2 primary name via the Basenames L2ReverseRegistrar (e.g. "example.base.eth")
 * 2. L1 ENS primary name (e.g. "example.eth")
 * Returns null if no name is found.
 */
export async function resolveEnsName(address: string): Promise<string | null> {
  // 1. Base L2 primary name — query the reverse registrar directly on Base.
  //    This is how "Set as primary" in the Basenames app is stored.
  try {
    const node = await baseClient.readContract({
      address: L2_REVERSE_REGISTRAR,
      abi: [{ name: "node", type: "function", inputs: [{ name: "addr", type: "address" }], outputs: [{ type: "bytes32" }], stateMutability: "view" }],
      functionName: "node",
      args: [address as `0x${string}`],
    }) as `0x${string}`

    const baseName = await baseClient.readContract({
      address: L2_DEFAULT_RESOLVER,
      abi: [{ name: "name", type: "function", inputs: [{ name: "node", type: "bytes32" }], outputs: [{ type: "string" }], stateMutability: "view" }],
      functionName: "name",
      args: [node],
    }) as string

    if (baseName) return baseName
  } catch {
    // No Basename set — fall through to L1
  }

  // 2. L1 ENS primary name
  try {
    const l1Name = await ethClient
      .getEnsName({ address: address as `0x${string}` })
      .catch(() => null)

    return l1Name ?? null
  } catch {
    return null
  }
}
