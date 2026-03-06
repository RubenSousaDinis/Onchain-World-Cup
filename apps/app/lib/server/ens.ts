import { createPublicClient, http } from "viem"
import { mainnet, base } from "viem/chains"

// L2 Reverse Registrar deployed by Basenames on Base mainnet.
// Setting a "primary" name in the Basenames app writes to this contract.
// The name is stored in the default resolver, NOT via the L1 ENS multichain
// reverse record — so the L1 coinType approach does not work for Basenames.
const L2_REVERSE_REGISTRAR = "0x79ea96012eea67a83431f1701b3dff7e37f9e282" as const
const L2_DEFAULT_RESOLVER = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD" as const

// ENS lookups must always use mainnet endpoints — hardcoded to prevent any
// shell env var (e.g. BASE_MAINNET_RPC_URL pointing at a testnet) from
// accidentally routing these calls to the wrong chain.
// Clients are created inside the function (lazily) so they don't capture
// env vars at import/module-init time.
function createBaseClient() {
  return createPublicClient({ chain: base, transport: http("https://mainnet.base.org") })
}

function createEthClient() {
  return createPublicClient({ chain: mainnet, transport: http("https://eth.llamarpc.com") })
}

/**
 * Resolves the best ENS/Basename for an address.
 * 1. Base L2 primary name via the Basenames L2ReverseRegistrar (e.g. "example.base.eth")
 * 2. L1 ENS primary name (e.g. "example.eth")
 * Returns null if no name is found.
 */
export async function resolveEnsName(address: string): Promise<string | null> {
  const DEBUG = process.env.ENS_DEBUG === "1"
  const log = (msg: string) => { if (DEBUG) process.stderr.write(`[ens] ${msg}\n`) }

  const baseClient = createBaseClient()
  const ethClient = createEthClient()

  log(`resolving ${address}`)
  log(`NODE_OPTIONS=${process.env.NODE_OPTIONS}`)

  // 1. Base L2 primary name — query the reverse registrar directly on Base.
  const node = await baseClient.readContract({
    address: L2_REVERSE_REGISTRAR,
    abi: [{ name: "node", type: "function", inputs: [{ name: "addr", type: "address" }], outputs: [{ type: "bytes32" }], stateMutability: "view" }],
    functionName: "node",
    args: [address as `0x${string}`],
  }).catch((e: unknown) => {
    log(`node() error: ${e instanceof Error ? e.message.slice(0, 150) : e}`)
    return null
  }) as `0x${string}` | null

  log(`node=${node}`)

  if (node) {
    const baseName = await baseClient.readContract({
      address: L2_DEFAULT_RESOLVER,
      abi: [{ name: "name", type: "function", inputs: [{ name: "node", type: "bytes32" }], outputs: [{ type: "string" }], stateMutability: "view" }],
      functionName: "name",
      args: [node],
    }).catch((e: unknown) => {
      log(`name() error: ${e instanceof Error ? e.message.slice(0, 150) : e}`)
      return null
    }) as string | null

    log(`baseName=${baseName}`)
    if (baseName) return baseName
  }

  // 2. L1 ENS primary name
  const l1Name = await ethClient
    .getEnsName({ address: address as `0x${string}` })
    .catch((e: unknown) => {
      log(`getEnsName error: ${e instanceof Error ? e.message.slice(0, 150) : e}`)
      return null
    })
  log(`l1Name=${l1Name}`)
  return l1Name ?? null
}
