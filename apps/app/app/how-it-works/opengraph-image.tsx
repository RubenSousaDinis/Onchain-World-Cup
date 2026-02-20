import { ImageResponse } from 'next/og'
import { getBaseUrl } from '@/lib/utils/og-image'
import {
  OG_IMAGE_SIZE,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_FONT_FAMILY,
  OG_IMAGE_LOGO,
} from '@/lib/constants'

export const revalidate = false // fully static — pre-built at deploy time
export const alt = 'How Onchain World Cup Works — Connect wallet, vote with ETH, earn prizes. 3 simple steps on Base.'
export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE

const STEPS = [
  {
    number: '01',
    title: 'Connect Wallet',
    description: 'Link any EVM wallet on Base network',
  },
  {
    number: '02',
    title: 'Vote with ETH',
    description: 'Back your country from 0.001 ETH/vote',
  },
  {
    number: '03',
    title: 'Earn Prizes',
    description: '90% of the prize pool to winning voters',
  },
]

export default async function Image() {
  const baseUrl = getBaseUrl()

  return new ImageResponse(
    (
      <div
        tw="w-full h-full flex relative"
        style={{
          background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1f3e 50%, #0a0f1a 100%)',
          fontFamily: OG_IMAGE_FONT_FAMILY,
        }}
      >
        {/* Grid pattern overlay */}
        <div
          tw="absolute inset-0 flex"
          style={{
            backgroundImage: 'linear-gradient(rgba(212, 255, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 255, 0, 0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Main content */}
        <div tw="flex flex-col w-full h-full justify-between" style={{ padding: '48px 60px' }}>
          {/* Header with logo */}
          <div tw="flex items-center justify-between w-full">
            <div tw="flex items-center" style={{ gap: 20 }}>
              <img
                src={`${baseUrl}/logo.jpg`}
                width={OG_IMAGE_LOGO.LARGE.width}
                height={OG_IMAGE_LOGO.LARGE.height}
                style={{ objectFit: 'contain' }}
              />
              <div tw="flex flex-col">
                <div tw="flex font-bold" style={{ fontSize: 28, color: '#d4ff00', letterSpacing: '0.05em' }}>
                  ONCHAIN WORLD CUP
                </div>
                <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0' }}>
                  HOW IT WORKS
                </div>
              </div>
            </div>

            {/* Base badge */}
            <div
              tw="flex items-center"
              style={{
                gap: 10,
                background: 'rgba(0, 82, 255, 0.15)',
                border: '2px solid #0052FF',
                borderRadius: 8,
                padding: '12px 20px',
              }}
            >
              <div
                tw="flex rounded-full"
                style={{ width: 24, height: 24, background: '#0052FF' }}
              />
              <div tw="flex font-bold" style={{ fontSize: 16, color: '#0052FF' }}>
                BASE
              </div>
            </div>
          </div>

          {/* Title */}
          <div tw="flex font-bold" style={{ fontSize: 58, color: '#ffffff', lineHeight: 1.1 }}>
            3 Steps to Vote Onchain
          </div>

          {/* Steps */}
          <div tw="flex" style={{ gap: 20 }}>
            {STEPS.map((step) => (
              <div
                key={step.number}
                tw="flex flex-col flex-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 255, 0, 0.2)',
                  borderRadius: 10,
                  padding: '24px 28px',
                  gap: 10,
                }}
              >
                <div tw="flex font-bold" style={{ fontSize: 36, color: '#d4ff00', fontFamily: 'monospace' }}>
                  {step.number}
                </div>
                <div tw="flex font-bold" style={{ fontSize: 24, color: '#ffffff' }}>
                  {step.title}
                </div>
                <div tw="flex" style={{ fontSize: 18, color: '#a0a0a0', lineHeight: 1.4 }}>
                  {step.description}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div tw="flex items-center justify-between">
            <div
              tw="flex items-center justify-center font-bold"
              style={{
                background: 'linear-gradient(135deg, #d4ff00 0%, #c6ff00 100%)',
                color: '#0a0f1a',
                padding: '20px 50px',
                borderRadius: 8,
                fontSize: 32,
                boxShadow: '0 8px 32px rgba(212, 255, 0, 0.3)',
              }}
            >
              GET STARTED
            </div>

            <div tw="flex" style={{ fontSize: 20, color: '#666', fontFamily: 'monospace' }}>
              app.onchainworldcup.xyz
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
