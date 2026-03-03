/**
 * Seed votes for every FIFA World Cup 2026 qualified country.
 *
 * ⚠️  DEVELOPMENT / TESTING ONLY — DO NOT RUN IN PRODUCTION ⚠️
 *
 * Sends one vote (configurable) to each of the 48 WC 2026 countries
 * sequentially, waiting for each confirmation before the next.
 *
 * Usage (from apps/app):
 *   npm run seed:wc2026-votes                        # 1 vote per country, Base Sepolia
 *   npm run seed:wc2026-votes -- --votes 3           # 3 votes per country
 *   npm run seed:wc2026-votes -- --votes 2 --delay 3000   # 2 votes, 3s between txns
 *   npm run seed:wc2026-votes -- --chain 8453        # Base Mainnet (5s safety pause)
 */

import hre from "hardhat"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

// ---------------------------------------------------------------------------
// FIFA World Cup 2026 — 48 qualified countries
// ---------------------------------------------------------------------------
const WC2026_COUNTRIES: { code: string; name: string; confederation: string }[] = [
  // Hosts (automatically qualified)
  { code: "US",     name: "United States",   confederation: "HOST" },
  { code: "CA",     name: "Canada",           confederation: "HOST" },
  { code: "MX",     name: "Mexico",           confederation: "HOST" },

  // CONMEBOL — 6 direct spots
  { code: "AR",     name: "Argentina",        confederation: "CONMEBOL" },
  { code: "BR",     name: "Brazil",           confederation: "CONMEBOL" },
  { code: "UY",     name: "Uruguay",          confederation: "CONMEBOL" },
  { code: "CO",     name: "Colombia",         confederation: "CONMEBOL" },
  { code: "EC",     name: "Ecuador",          confederation: "CONMEBOL" },
  { code: "PY",     name: "Paraguay",         confederation: "CONMEBOL" },

  // UEFA — 16 spots
  { code: "ES",     name: "Spain",            confederation: "UEFA" },
  { code: "PT",     name: "Portugal",         confederation: "UEFA" },
  { code: "DE",     name: "Germany",          confederation: "UEFA" },
  { code: "FR",     name: "France",           confederation: "UEFA" },
  { code: "GB-ENG", name: "England",          confederation: "UEFA" },
  { code: "NL",     name: "Netherlands",      confederation: "UEFA" },
  { code: "HR",     name: "Croatia",          confederation: "UEFA" },
  { code: "CH",     name: "Switzerland",      confederation: "UEFA" },
  { code: "AT",     name: "Austria",          confederation: "UEFA" },
  { code: "RS",     name: "Serbia",           confederation: "UEFA" },
  { code: "TR",     name: "Turkey",           confederation: "UEFA" },
  { code: "DK",     name: "Denmark",          confederation: "UEFA" },
  { code: "SI",     name: "Slovenia",         confederation: "UEFA" },
  { code: "PL",     name: "Poland",           confederation: "UEFA" },
  { code: "UA",     name: "Ukraine",          confederation: "UEFA" },
  { code: "BE",     name: "Belgium",          confederation: "UEFA" },

  // CAF — 9 spots
  { code: "SN",     name: "Senegal",          confederation: "CAF" },
  { code: "MA",     name: "Morocco",          confederation: "CAF" },
  { code: "NG",     name: "Nigeria",          confederation: "CAF" },
  { code: "GH",     name: "Ghana",            confederation: "CAF" },
  { code: "CM",     name: "Cameroon",         confederation: "CAF" },
  { code: "TN",     name: "Tunisia",          confederation: "CAF" },
  { code: "EG",     name: "Egypt",            confederation: "CAF" },
  { code: "CI",     name: "Ivory Coast",      confederation: "CAF" },
  { code: "DZ",     name: "Algeria",          confederation: "CAF" },

  // CONCACAF — 3 non-host spots
  { code: "CR",     name: "Costa Rica",       confederation: "CONCACAF" },
  { code: "PA",     name: "Panama",           confederation: "CONCACAF" },
  { code: "JM",     name: "Jamaica",          confederation: "CONCACAF" },

  // AFC — 8 spots
  { code: "JP",     name: "Japan",            confederation: "AFC" },
  { code: "KR",     name: "South Korea",      confederation: "AFC" },
  { code: "IR",     name: "Iran",             confederation: "AFC" },
  { code: "AU",     name: "Australia",        confederation: "AFC" },
  { code: "SA",     name: "Saudi Arabia",     confederation: "AFC" },
  { code: "IQ",     name: "Iraq",             confederation: "AFC" },
  { code: "UZ",     name: "Uzbekistan",       confederation: "AFC" },
  { code: "CN",     name: "China",            confederation: "AFC" },

  // OFC — 1 spot
  { code: "NZ",     name: "New Zealand",      confederation: "OFC" },

  // Inter-confederation playoff spots (2)
  { code: "VE",     name: "Venezuela",        confederation: "CONMEBOL-PO" },
  { code: "HN",     name: "Honduras",         confederation: "CONCACAF-PO" },
]

// ---------------------------------------------------------------------------

function toBytes8(str: string): string {
  if (str.length > 8) throw new Error(`Country code "${str}" too long (max 8 chars)`)
  const hex = Buffer.from(hre.ethers.toUtf8Bytes(str)).toString("hex")
  return "0x" + hex.padEnd(16, "0")
}

function parseArgs() {
  const argv = process.argv.slice(2)
  let votes = 1
  let chainId = 84532
  let delayMs = 2000

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--votes" && argv[i + 1]) votes = parseInt(argv[++i])
    if (argv[i] === "--chain" && argv[i + 1]) chainId = parseInt(argv[++i])
    if (argv[i] === "--delay" && argv[i + 1]) delayMs = parseInt(argv[++i])
  }

  if (isNaN(votes) || votes < 1 || votes > 100)
    throw new Error("--votes must be 1–100")
  if (chainId !== 84532 && chainId !== 8453)
    throw new Error("--chain must be 84532 (Sepolia) or 8453 (Mainnet)")

  return { votes, chainId, delayMs }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ This script cannot run in production.")
    process.exit(1)
  }

  const { votes, chainId, delayMs } = parseArgs()
  const networkName = chainId === 84532 ? "baseSepolia" : "baseMainnet"

  const contractAddress =
    chainId === 84532
      ? process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA
      : process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET

  if (!contractAddress) {
    throw new Error(
      `Missing contract address env var for chain ${chainId}. ` +
      `Set ${chainId === 84532 ? "NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA" : "NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET"}.`
    )
  }

  if (chainId === 8453) {
    console.warn("\n⚠️  BASE MAINNET — real ETH will be spent. Ctrl+C within 5s to abort.\n")
    await sleep(5000)
  }

  await hre.changeNetwork(networkName)
  const [signer] = await hre.ethers.getSigners()
  const balance = await hre.ethers.provider.getBalance(signer.address)

  console.log("=".repeat(55))
  console.log("  WC 2026 Vote Seeder")
  console.log("=".repeat(55))
  console.log(`Network:    ${networkName} (${chainId})`)
  console.log(`Contract:   ${contractAddress}`)
  console.log(`Wallet:     ${signer.address}`)
  console.log(`Balance:    ${hre.ethers.formatEther(balance)} ETH`)
  console.log(`Votes/country: ${votes}`)
  console.log(`Delay:      ${delayMs}ms`)
  console.log(`Countries:  ${WC2026_COUNTRIES.length}`)
  console.log("=".repeat(55))

  const contract = (await hre.ethers.getContractFactory("WorldCupQualification")).attach(contractAddress)

  const results: { code: string; txHash: string; cost: string; ok: boolean }[] = []
  let totalSpent = BigInt(0)

  for (let i = 0; i < WC2026_COUNTRIES.length; i++) {
    const { code, name, confederation } = WC2026_COUNTRIES[i]
    const prefix = `[${String(i + 1).padStart(2, "0")}/${WC2026_COUNTRIES.length}]`

    console.log(`\n${prefix} ${name} (${code}) — ${confederation}`)

    try {
      const countryBytes = toBytes8(code)
      const cost = await contract.calculateVoteCost(countryBytes, votes)
      console.log(`   Cost: ${hre.ethers.formatEther(cost)} ETH`)

      const currentBalance = await hre.ethers.provider.getBalance(signer.address)
      if (currentBalance < cost) {
        console.error(`   ❌ Insufficient balance — skipping`)
        results.push({ code, txHash: "", cost: hre.ethers.formatEther(cost), ok: false })
        continue
      }

      const tx = await contract.vote(countryBytes, votes, { value: cost })
      console.log(`   Tx:   ${tx.hash}`)

      const receipt = await tx.wait()
      console.log(`   ✅ Confirmed in block ${receipt?.blockNumber}`)

      totalSpent += cost
      results.push({ code, txHash: tx.hash, cost: hre.ethers.formatEther(cost), ok: true })
    } catch (err: any) {
      console.error(`   ❌ Failed: ${err?.message?.split("\n")[0]}`)
      results.push({ code, txHash: "", cost: "0", ok: false })
    }

    if (i < WC2026_COUNTRIES.length - 1) {
      await sleep(delayMs)
    }
  }

  // Summary
  const succeeded = results.filter((r) => r.ok).length
  const failed = results.filter((r) => !r.ok).length

  console.log("\n" + "=".repeat(55))
  console.log("  Summary")
  console.log("=".repeat(55))
  console.log(`✅ Succeeded: ${succeeded}/${WC2026_COUNTRIES.length}`)
  if (failed > 0) {
    console.log(`❌ Failed:    ${failed}`)
    console.log("   Failed countries:", results.filter((r) => !r.ok).map((r) => r.code).join(", "))
  }
  console.log(`💸 Total spent: ${hre.ethers.formatEther(totalSpent)} ETH`)
  console.log("=".repeat(55))

  // Trigger indexer sync
  console.log("\nTriggering indexer sync...")
  try {
    const res = await fetch("http://localhost:3101/api/indexer/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chainId }),
    })
    if (res.ok) {
      console.log("✅ Indexer synced:", JSON.stringify(await res.json()))
    } else {
      console.log("⚠️  Indexer returned", res.status, "— run cron or restart dev server")
    }
  } catch {
    console.log("⚠️  Could not reach indexer — start the dev server to index votes")
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌", err)
    process.exit(1)
  })
