/**
 * NFT CONTRACT UTILITIES
 *
 * Type-safe utilities for interacting with AchievementNFT and MatchNFT contracts.
 * Both contracts share the same ABI — only the deployed address differs.
 *
 * CONTRACT ADDRESSES (from environment variables):
 * - NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS — AchievementNFT on Base
 * - NEXT_PUBLIC_MATCH_NFT_ADDRESS       — MatchNFT on Base
 */

import type { Address } from 'viem'

export function getAchievementNFTAddress(): Address {
  const address = process.env.NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS
  if (!address) {
    throw new Error(
      'AchievementNFT contract address not configured. ' +
        'Set NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS in your .env file.'
    )
  }
  return address as Address
}

export function getMatchNFTAddress(): Address {
  const address = process.env.NEXT_PUBLIC_MATCH_NFT_ADDRESS
  if (!address) {
    throw new Error(
      'MatchNFT contract address not configured. ' +
        'Set NEXT_PUBLIC_MATCH_NFT_ADDRESS in your .env file.'
    )
  }
  return address as Address
}

export const NFT_ABI = [
  {
    name: 'MINT_PRICE',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: '_tokenURI', type: 'string' },
      { name: 'achievementId', type: 'string' },
      { name: 'metadata', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'mintCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'achievementId', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getUserNFTs',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'feeRecipient',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'setFeeRecipient',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_feeRecipient', type: 'address' }],
    outputs: [],
  },
  {
    name: 'NFTMinted',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'tokenURI', type: 'string', indexed: false },
    ],
  },
  {
    name: 'FeeRecipientUpdated',
    type: 'event',
    inputs: [
      { name: 'oldRecipient', type: 'address', indexed: true },
      { name: 'newRecipient', type: 'address', indexed: true },
    ],
  },
] as const
