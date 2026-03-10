"use client"

/**
 * Drop-in replacement for wagmi's useWriteContract that automatically appends
 * the Base Builder Code attribution suffix (ERC-8021) to every transaction.
 *
 * Usage: swap `useWriteContract` → `useWriteContractAttributed`.
 * The returned `writeContract` / `writeContractAsync` API is identical.
 */
import { useWriteContract } from "wagmi"
import type { WriteContractErrorType } from "wagmi/actions"
import type { Abi, ContractFunctionArgs, ContractFunctionName } from "viem"
import { BUILDER_ATTRIBUTION_SUFFIX } from "@/lib/builder-attribution"

// Matches wagmi's WriteContractVariables shape while keeping full generics
type AnyWriteContractParams = {
  abi: Abi
  address: `0x${string}`
  functionName: ContractFunctionName<Abi, "nonpayable" | "payable">
  args?: ContractFunctionArgs<Abi, "nonpayable" | "payable">
  value?: bigint
  chainId?: number
  account?: `0x${string}`
  [key: string]: unknown
}

export function useWriteContractAttributed(
  ...args: Parameters<typeof useWriteContract>
) {
  const { writeContract: _write, writeContractAsync: _writeAsync, ...rest } =
    useWriteContract(...args)

  function writeContract(
    params: AnyWriteContractParams,
    options?: Parameters<typeof _write>[1]
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _write({ ...params, dataSuffix: BUILDER_ATTRIBUTION_SUFFIX } as any, options)
  }

  function writeContractAsync(
    params: AnyWriteContractParams,
    options?: Parameters<typeof _writeAsync>[1]
  ): Promise<`0x${string}`> {
    return _writeAsync(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { ...params, dataSuffix: BUILDER_ATTRIBUTION_SUFFIX } as any,
      options
    )
  }

  return { ...rest, writeContract, writeContractAsync } as unknown as ReturnType<
    typeof useWriteContract
  > & {
    writeContract: typeof writeContract
    writeContractAsync: typeof writeContractAsync
    error: WriteContractErrorType | null
  }
}
