"use client"

import { useState } from "react"
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi"
import { formatEther, isAddress } from "viem"
import { getAddressExplorerUrl } from "@/lib/admin"

const ACHIEVEMENT_NFT_ABI = [
  { inputs: [], name: "totalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "MINT_PRICE", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "feeRecipient", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_feeRecipient", type: "address" }], name: "setFeeRecipient", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const

const MATCH_NFT_ABI = [
  { inputs: [], name: "totalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
] as const

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function AchievementNFTPanel({ address, chainId }: { address: `0x${string}`; chainId: number }) {
  const [newRecipient, setNewRecipient] = useState("")
  const [recipientError, setRecipientError] = useState("")

  const { data: totalSupply } = useReadContract({ address, abi: ACHIEVEMENT_NFT_ABI, functionName: "totalSupply" })
  const { data: mintPrice } = useReadContract({ address, abi: ACHIEVEMENT_NFT_ABI, functionName: "MINT_PRICE" })
  const { data: feeRecipient } = useReadContract({ address, abi: ACHIEVEMENT_NFT_ABI, functionName: "feeRecipient" })
  const { data: owner } = useReadContract({ address, abi: ACHIEVEMENT_NFT_ABI, functionName: "owner" })
  const { data: contractName } = useReadContract({ address, abi: ACHIEVEMENT_NFT_ABI, functionName: "name" })

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash })

  const handleSetRecipient = () => {
    setRecipientError("")
    if (!isAddress(newRecipient)) {
      setRecipientError("Invalid address")
      return
    }
    writeContract({ address, abi: ACHIEVEMENT_NFT_ABI, functionName: "setFeeRecipient", args: [newRecipient] })
  }

  return (
    <div className="cm-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">{contractName ?? "AchievementNFT"}</h4>
        <a
          href={getAddressExplorerUrl(chainId, address)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--highlight-yellow)] hover:underline font-mono"
        >
          {truncateAddress(address)} ↗
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground block text-xs">Total Minted</span>
          <span className="cm-highlight">{totalSupply != null ? Number(totalSupply).toLocaleString() : "—"}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Mint Price</span>
          <span>{mintPrice != null ? `${formatEther(mintPrice)} ETH` : "—"}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Fee Recipient</span>
          <span className="font-mono text-xs">{feeRecipient ? truncateAddress(feeRecipient) : "—"}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Owner</span>
          <span className="font-mono text-xs">{owner ? truncateAddress(owner) : "—"}</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Set Fee Recipient</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            placeholder="0x..."
            className="flex-1 bg-background border border-border/50 rounded px-3 py-1.5 text-sm font-mono"
          />
          <button
            onClick={handleSetRecipient}
            disabled={isPending || isConfirming}
            className="cm-highlight bg-[var(--nav-purple)] border border-border/50 px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
          >
            {isPending || isConfirming ? "Confirming…" : "Update"}
          </button>
        </div>
        {recipientError && <p className="text-red-400 text-xs mt-1">{recipientError}</p>}
        {isConfirmed && <p className="text-green-400 text-xs mt-1">Fee recipient updated</p>}
      </div>
    </div>
  )
}

function MatchNFTPanel({ address, chainId }: { address: `0x${string}`; chainId: number }) {
  const { data: totalSupply } = useReadContract({ address, abi: MATCH_NFT_ABI, functionName: "totalSupply" })
  const { data: owner } = useReadContract({ address, abi: MATCH_NFT_ABI, functionName: "owner" })
  const { data: contractName } = useReadContract({ address, abi: MATCH_NFT_ABI, functionName: "name" })

  return (
    <div className="cm-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">{contractName ?? "MatchNFT"}</h4>
        <a
          href={getAddressExplorerUrl(chainId, address)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--highlight-yellow)] hover:underline font-mono"
        >
          {truncateAddress(address)} ↗
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground block text-xs">Total Minted</span>
          <span className="cm-highlight">{totalSupply != null ? Number(totalSupply).toLocaleString() : "—"}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">Owner</span>
          <span className="font-mono text-xs">{owner ? truncateAddress(owner) : "—"}</span>
        </div>
      </div>
    </div>
  )
}

export function NftContractPanel() {
  const chainId = useChainId()

  const achievementAddr = process.env.NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS as `0x${string}` | undefined
  const matchNftAddr = process.env.NEXT_PUBLIC_MATCH_NFT_ADDRESS as `0x${string}` | undefined

  const hasAny = achievementAddr || matchNftAddr

  if (!hasAny) {
    return (
      <div className="cm-panel p-4">
        <h3 className="cm-section-header px-3 py-2 mb-3">NFT Contracts</h3>
        <p className="text-sm text-muted-foreground px-1">
          Set <code className="text-xs bg-muted/30 px-1 rounded">NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS</code> and/or{" "}
          <code className="text-xs bg-muted/30 px-1 rounded">NEXT_PUBLIC_MATCH_NFT_ADDRESS</code> in your environment to manage NFT contracts here.
        </p>
      </div>
    )
  }

  return (
    <div className="cm-panel p-4 space-y-4">
      <h3 className="cm-section-header px-3 py-2">NFT Contracts</h3>
      {achievementAddr && isAddress(achievementAddr) && (
        <AchievementNFTPanel address={achievementAddr} chainId={chainId} />
      )}
      {matchNftAddr && isAddress(matchNftAddr) && (
        <MatchNFTPanel address={matchNftAddr} chainId={chainId} />
      )}
    </div>
  )
}
