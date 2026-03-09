/**
 * APPKIT MODAL — deferred, loaded after first paint.
 *
 * createAppKit() brings in the Reown/WalletConnect/MetaMask bundle.
 * It is NOT imported at layout load time. It initialises lazily in
 * Web3Provider's useEffect, so the wallet UI never blocks the LCP render.
 *
 * Components call `modal.open()` (from reown-config.ts) which awaits
 * this initialisation automatically, so callers need no changes.
 */

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  interface Window {
    __w3mMsgIntercepted?: boolean
  }
}

import { createAppKit } from "@reown/appkit/react"
import { base } from "@reown/appkit/networks"
import { wagmiAdapter, projectId, appKitNetworks } from "./wagmi-core"

let _modal: ReturnType<typeof createAppKit> | null = null

export function initAppKit(): ReturnType<typeof createAppKit> {
  if (_modal) return _modal

  // NOTE: We intentionally do NOT clear persisted Sepolia network from localStorage.
  // Social login hang on Sepolia is already prevented by appKitNetworks = [base] (mainnet-only).
  // Clearing localStorage would break regular wallet users (MetaMask) who legitimately
  // test on Base Sepolia — their stored network would be reset to mainnet on every load.

  _modal = createAppKit({
    adapters: [wagmiAdapter],
    // Only mainnet chains — Reown's embedded wallet (social/email login) requires
    // a mainnet chain for MPC wallet creation. Testnets cause it to hang forever.
    // Base Sepolia is still available via wagmiAdapter for regular wallet connections.
    networks: [...appKitNetworks],
    defaultNetwork: base,
    projectId,
    metadata: {
      name: "Onchain World Cup",
      description: "Vote on World Cup 2026 matches with ETH on Base network",
      // Must be a registered HTTPS domain in the Reown project dashboard.
      // Reown checks the HTTP Origin header (localhost/prod) against allowed domains —
      // both http://localhost:3101 and https://app.onchainworldcup.xyz must be added there.
      url: process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.onchainworldcup.xyz",
      icons: ["https://app.onchainworldcup.xyz/logo.jpg"],
    },
    // enableAuthLogger is intentionally disabled in production.
    // When true it adds enableLogger=true to the w3m-iframe URL, which was found
    // to trigger a degraded code path inside the iframe that uses eval() —
    // blocked by secure.walletconnect.org's own CSP, causing social login to hang.
    enableAuthLogger: false,
    features: {
      analytics: true,
      email: true,
      socials: ['google', 'apple', 'github', 'x'],
      onramp: true,
    },
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "hsl(142.1 76.2% 36.3%)",
      "--w3m-border-radius-master": "2px",
    },
    // Allow wallets connected on Base Sepolia (testnet) without forcing a
    // network switch prompt. Testnet users can still interact via wagmi.
    allowUnsupportedChain: true,
  })

  // ---------- Config validation ----------
  // eslint-disable-next-line no-console
  console.warn('[AppKit] initialized', {
    projectId: projectId ? `${projectId.slice(0, 6)}…` : '⚠️ MISSING',
    defaultNetwork: `${base.name} (${base.id})`,
    modalNetworks: appKitNetworks.map(n => `${n.name} (${n.id})`),
    url: process.env.NEXT_PUBLIC_APP_DOMAIN || 'https://app.onchainworldcup.xyz',
    features: { email: true, socials: ['google', 'apple', 'github', 'x'], onramp: true },
  })

  // ---------- Reown Cloud project config verification ----------
  // Directly call the same APIs the SDK uses to fetch project configuration.
  // This reveals whether social login is enabled at the dashboard level and
  // whether our domain is in the allowed origins list.
  // API base: https://api.web3modal.org (same as CoreHelperUtil.getApiUrl())
  const sdkParams = `projectId=${projectId}&st=appkit&sv=html-wagmi-4.2.2`
  // eslint-disable-next-line no-console
  console.warn('[Reown Cloud] Verifying project config for projectId:', projectId)
  // Fetch project features (social_login config)
  fetch(`https://api.web3modal.org/appkit/v1/config?${sdkParams}`)
    .then(r => r.json())
    .then(data => {
      // eslint-disable-next-line no-console
      console.warn('[Reown Cloud] /appkit/v1/config response:', JSON.stringify(data, null, 2))
      // Highlight social_login specifically
      const socialLoginFeature = data?.features?.find?.(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (f: any) => f.id === 'social_login'
      )
      // eslint-disable-next-line no-console
      console.warn('[Reown Cloud] social_login feature:', socialLoginFeature
        ? { isEnabled: socialLoginFeature.isEnabled, config: socialLoginFeature.config }
        : '⚠️ NOT FOUND in project config — social login is not configured in Reown dashboard')
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.warn('[Reown Cloud] /appkit/v1/config FAILED:', err)
    })
  // Fetch allowed origins (domain verification)
  fetch(`https://api.web3modal.org/projects/v1/origins?${sdkParams}`)
    .then(r => r.json())
    .then(data => {
      // eslint-disable-next-line no-console
      console.warn('[Reown Cloud] /projects/v1/origins response:', data)
      const origins = data?.allowedOrigins || []
      const currentOrigin = window.location.origin
      const isAllowed = origins.some((o: string) => currentOrigin.includes(o) || o.includes(currentOrigin))
      // eslint-disable-next-line no-console
      console.warn('[Reown Cloud] Current origin allowed?', isAllowed ? `✅ YES (${currentOrigin})` : `⚠️ NO — "${currentOrigin}" not in allowed origins: ${JSON.stringify(origins)}`)
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.warn('[Reown Cloud] /projects/v1/origins FAILED:', err)
    })

  // ---------- postMessage interceptor ----------
  // Intercept ALL messages from the w3m-iframe (secure.walletconnect.org).
  // The SDK sends @w3m-app/* messages TO the iframe and receives @w3m-frame/* back.
  // Key messages for social login:
  //   → @w3m-app/CONNECT_SOCIAL (sent to iframe with OAuth URI)
  //   ← @w3m-frame/CONNECT_SOCIAL_SUCCESS (wallet created)
  //   ← @w3m-frame/CONNECT_SOCIAL_ERROR (failed — contains error details)
  //   ← @w3m-frame/READY (iframe loaded and ready)
  // If no CONNECT_SOCIAL_SUCCESS/ERROR comes back, the iframe silently hung.
  if (!window.__w3mMsgIntercepted) {
    window.__w3mMsgIntercepted = true
    window.addEventListener('message', (e) => {
      if (typeof e.data?.type !== 'string') return
      const type = e.data.type as string
      // Log all @w3m-frame/ messages (iframe → page)
      if (type.startsWith('@w3m-frame/')) {
        // eslint-disable-next-line no-console
        console.warn(`[w3m-iframe → page] ${type}`, {
          id: e.data.id,
          payload: e.data.payload,
          origin: e.origin,
        })
        // Specifically highlight READY so we know the iframe loaded successfully
        if (type === '@w3m-frame/READY' || type === '@w3m-app/READY') {
          // eslint-disable-next-line no-console
          console.warn('[AppKit] ✅ w3m-iframe READY — iframe loaded and initialised, MPC wallet available')
        }
      }
      // Also log @w3m-app/ messages (page → iframe, echoed back in some SDK versions)
      if (type.startsWith('@w3m-app/')) {
        // eslint-disable-next-line no-console
        console.warn(`[page → w3m-iframe] ${type}`, {
          id: e.data.id,
          hasPayload: !!e.data.payload,
        })
      }
    })
    // eslint-disable-next-line no-console
    console.warn('[AppKit] postMessage interceptor installed — watching @w3m-frame/* and @w3m-app/* messages')
  }

  // Subscribe to AppKit events and state for debugging email/social login issues.
  // Uses console.warn so logs survive Next.js removeConsole stripping in production.
  _modal.subscribeEvents((event) => {
    const eventName = event.data.event
    // eslint-disable-next-line no-console
    console.warn('[AppKit event]', eventName, event.data)

    // Surface social login lifecycle for debugging the iframe hang.
    // After SOCIAL_LOGIN_REQUEST_USER_DATA, the SDK sends APP_CONNECT_SOCIAL
    // to the w3m-iframe (secure.walletconnect.org). If the iframe doesn't respond
    // within 120s, the flow hangs silently.
    if (eventName === 'SOCIAL_LOGIN_REQUEST_USER_DATA') {
      // eslint-disable-next-line no-console
      console.warn('[AppKit] Social login: APP_CONNECT_SOCIAL sent to w3m-iframe — waiting for FRAME_CONNECT_SOCIAL_SUCCESS…')
      const iframe = document.getElementById('w3m-iframe') as HTMLIFrameElement | null
      // eslint-disable-next-line no-console
      console.warn('[AppKit] w3m-iframe present:', !!iframe, iframe?.src ? `src=${new URL(iframe.src).origin}${new URL(iframe.src).pathname}` : 'no src')

      // The postMessage interceptor (installed above at init time) will capture
      // the @w3m-frame/CONNECT_SOCIAL_SUCCESS or _ERROR response from the iframe.
      // If the iframe does not respond within 120s AppKit aborts with iframe_request_timeout.
      // Schedule a diagnostic log at 30s so we know the iframe is still silent.
      setTimeout(() => {
        // eslint-disable-next-line no-console
        console.warn('[AppKit] Social login: ⚠️ 30s elapsed — iframe still has not responded to APP_CONNECT_SOCIAL. Check DevTools → frame selector → w3m-iframe for errors.')
      }, 30_000)
    }
    if (eventName === 'SOCIAL_LOGIN_SUCCESS') {
      // eslint-disable-next-line no-console
      console.warn('[AppKit] Social login: ✅ MPC wallet created successfully')
    }
    if (eventName === 'SOCIAL_LOGIN_ERROR') {
      // eslint-disable-next-line no-console
      console.warn('[AppKit] Social login: ❌ ERROR', event.data)
    }
  })

  _modal.subscribeState((state) => {
    // eslint-disable-next-line no-console
    console.warn('[AppKit state]', state)
  })

  return _modal
}
