import { NextRequest, NextResponse } from 'next/server'
import { keccak256, encodePacked } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import type { Address } from 'viem'

/**
 * POST /api/nft/sign
 *
 * Generates a backend signature for AchievementNFT.mint().
 * The contract verifies: keccak256(abi.encodePacked(to, achievementId, tokenURI, contractAddress))
 * signed by `authorizedSigner`.
 */
export async function POST(request: NextRequest) {
  const rawKey = process.env.NFT_SIGNER_PRIVATE_KEY ?? process.env.PRIVATE_KEY
  if (!rawKey) {
    return NextResponse.json({ error: 'Signer not configured' }, { status: 500 })
  }

  let body: { to: string; achievementId: string; tokenURI: string; contractAddress: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { to, achievementId, tokenURI, contractAddress } = body

  if (!to || !achievementId || !tokenURI || !contractAddress) {
    return NextResponse.json(
      { error: 'Missing required fields: to, achievementId, tokenURI, contractAddress' },
      { status: 400 }
    )
  }

  const privateKey = rawKey.startsWith('0x') ? (rawKey as `0x${string}`) : (`0x${rawKey}` as `0x${string}`)

  const messageHash = keccak256(
    encodePacked(
      ['address', 'string', 'string', 'address'],
      [to as Address, achievementId, tokenURI, contractAddress as Address]
    )
  )

  const account = privateKeyToAccount(privateKey)
  const signature = await account.signMessage({ message: { raw: messageHash } })

  return NextResponse.json({ signature })
}
