import hre from "hardhat"

/**
 * Deploy AchievementNFT and MatchNFT contracts
 *
 * Usage:
 *   npm run deploy:nfts:sepolia   → Base Sepolia (testnet)
 *   npm run deploy:nfts:mainnet   → Base Mainnet (production)
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners()
  const chainId = hre.network.config.chainId

  const feeRecipient = deployer.address

  console.log("Deploying NFT contracts")
  console.log("Network:", hre.network.name)
  console.log("Deployer:", deployer.address)
  console.log("Fee recipient:", feeRecipient)
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH")

  // ── Deploy AchievementNFT ──────────────────────────────────────────────────
  console.log("\n========== Deploying AchievementNFT ==========")
  const AchievementNFT = await hre.ethers.getContractFactory("AchievementNFT")
  const achievement = await AchievementNFT.deploy(feeRecipient)
  await achievement.waitForDeployment()
  const achievementAddress = await achievement.getAddress()
  console.log("✅ AchievementNFT deployed to:", achievementAddress)

  // ── Explorer URL ───────────────────────────────────────────────────────────
  const explorerBase =
    chainId === 84532
      ? "https://sepolia.basescan.org/address/"
      : chainId === 8453
      ? "https://basescan.org/address/"
      : null

  if (explorerBase) {
    console.log("\n========== Explorer URL ==========")
    console.log("AchievementNFT:", explorerBase + achievementAddress)
  }

  // ── Verify on BaseScan ─────────────────────────────────────────────────────
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting 6 block confirmations before verifying...")
    const achievementTx = achievement.deploymentTransaction()
    if (achievementTx) await achievementTx.wait(6)

    console.log(`\n🔍 Verifying AchievementNFT at ${achievementAddress}...`)
    try {
      await hre.run("verify:verify", {
        address: achievementAddress,
        contract: "contracts/AchievementNFT.sol:AchievementNFT",
        constructorArguments: [feeRecipient],
      })
      console.log("✅ AchievementNFT verified!")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes("Already Verified") || msg.includes("already verified")) {
        console.log("✅ AchievementNFT already verified.")
      } else {
        console.log("❌ Verification failed:", msg)
        console.log(`   Verify manually: npx hardhat verify --network ${hre.network.name} --contract contracts/AchievementNFT.sol:AchievementNFT ${achievementAddress} ${feeRecipient}`)
      }
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n========== Deployment Summary ==========")
  console.log("NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS=" + achievementAddress)
  console.log("\nAdd the above line to your .env.local file.")
}

main()
  .then(() => {
    console.log("\n✨ Done!")
    process.exit(0)
  })
  .catch((err: unknown) => {
    console.error("\n❌ Deployment failed:", err)
    process.exit(1)
  })
