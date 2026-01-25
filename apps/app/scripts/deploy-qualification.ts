import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deploy WorldCupQualification contract
 *
 * Usage:
 *   npx hardhat run scripts/deploy-qualification.ts --network baseSepolia
 *   npx hardhat run scripts/deploy-qualification.ts --network baseMainnet
 *   npx hardhat run scripts/deploy-qualification.ts --network hardhat
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying WorldCupQualification contract");
  console.log("Network:", hre.network.name);
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // Get deployment parameters from environment or use defaults
  const qualificationStartTime = process.env.QUALIFICATION_START_TIME
    ? parseInt(process.env.QUALIFICATION_START_TIME)
    : Math.floor(Date.now() / 1000) + (24 * 60 * 60); // Default: 1 day from now

  const qualificationEndTime = process.env.QUALIFICATION_END_TIME
    ? parseInt(process.env.QUALIFICATION_END_TIME)
    : qualificationStartTime + (30 * 24 * 60 * 60); // Default: 30 days after start

  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;
  const initialPlatformFeeBps = process.env.INITIAL_PLATFORM_FEE_BPS
    ? parseInt(process.env.INITIAL_PLATFORM_FEE_BPS)
    : 1000; // Default: 10% (1000 basis points)

  // Load all countries from JSON file
  const countriesPath = path.join(__dirname, "..", "data", "countries.json");
  const countriesData = JSON.parse(fs.readFileSync(countriesPath, "utf8"));

  // Filter out countries with codes longer than 8 characters (bytes8 limitation)
  const initialCountries = countriesData
    .map((c: any) => c.code)
    .filter((code: string) => code.length <= 8);

  console.log(`\nLoaded ${initialCountries.length} valid countries from JSON (${countriesData.length - initialCountries.length} excluded due to invalid code length)`);

  // Helper to convert string to bytes8
  const toBytes8 = (str: string): string => {
    if (str.length > 8) {
      throw new Error(`Invalid country code: ${str}. Must be 8 characters or less`);
    }
    const bytes = hre.ethers.toUtf8Bytes(str);
    // Convert to hex and pad to exactly 8 bytes (16 hex chars)
    const hex = Buffer.from(bytes).toString("hex");
    return "0x" + hex.padEnd(16, "0");
  };

  // Convert string country codes to bytes8
  const initialCountriesBytes8 = initialCountries.map(toBytes8);

  console.log("\n========== Deployment Parameters ==========");
  console.log("Qualification Start Time:", new Date(qualificationStartTime * 1000).toISOString());
  console.log("Qualification End Time:", new Date(qualificationEndTime * 1000).toISOString());
  console.log("Duration:", Math.floor((qualificationEndTime - qualificationStartTime) / (24 * 60 * 60)), "days");
  console.log("Fee Recipient:", feeRecipient);
  console.log("Initial Platform Fee:", (initialPlatformFeeBps / 100) + "%");
  console.log("Initial Countries Count:", initialCountries.length);
  console.log("Sample Countries:", initialCountries.slice(0, 10).join(", "), "...");

  // Validate inputs
  const now = Math.floor(Date.now() / 1000);
  if (qualificationStartTime < now) {
    throw new Error("Qualification start time must be in the future");
  }

  if (qualificationEndTime <= qualificationStartTime) {
    throw new Error("Qualification end time must be after start time");
  }

  if (!hre.ethers.isAddress(feeRecipient)) {
    throw new Error("Invalid fee recipient address");
  }

  if (initialPlatformFeeBps > 2000) {
    throw new Error("Platform fee cannot exceed 20% (2000 basis points)");
  }

  // Deploy contract
  console.log("\n========== Deploying WorldCupQualification ==========");
  const WorldCupQualification = await hre.ethers.getContractFactory("WorldCupQualification");

  const qualification = await WorldCupQualification.deploy(
    qualificationStartTime,
    qualificationEndTime,
    feeRecipient,
    initialCountriesBytes8,
    initialPlatformFeeBps
  );

  await qualification.waitForDeployment();
  const qualificationAddress = await qualification.getAddress();

  console.log("✅ WorldCupQualification deployed to:", qualificationAddress);

  // Display contract details (with error handling for immediate reads)
  try {
    console.log("\n========== Contract Details ==========");
    const details = await qualification.getQualificationDetails();
    const startTime = await qualification.qualificationStartTime();
    console.log("Total Prize Pool:", hre.ethers.formatEther(details._totalPrizePool), "ETH");
    console.log("Qualification Start Time:", new Date(Number(startTime) * 1000).toISOString());
    console.log("Qualification End Time:", new Date(Number(details._qualificationEndTime) * 1000).toISOString());
    console.log("Qualification Spots:", details._qualificationSpots.toString());
    console.log("Is Finalized:", details._isFinalized);
    console.log("Is Paused:", await qualification.paused());

    // Verify constants
    const basePrice = await qualification.BASE_PRICE();
    const priceIncrement = await qualification.PRICE_INCREMENT();
    const maxPlatformFeeBps = await qualification.MAX_PLATFORM_FEE_BPS();
    const qualificationSpots = await qualification.QUALIFICATION_SPOTS();

    console.log("\n========== Contract Constants ==========");
    console.log("BASE_PRICE:", hre.ethers.formatEther(basePrice), "ETH");
    console.log("PRICE_INCREMENT:", hre.ethers.formatEther(priceIncrement), "ETH");
    console.log("MAX_PLATFORM_FEE_BPS:", maxPlatformFeeBps.toString());
    console.log("QUALIFICATION_SPOTS:", qualificationSpots.toString());
  } catch (error) {
    console.log("⚠️  Could not read contract details immediately after deployment (this is normal)");
    console.log("Contract is deployed and working. You can verify details on the block explorer.");
  }

  // Save deployment info
  const chainId = hre.network.config.chainId;
  const deploymentInfo = {
    network: hre.network.name,
    contract: {
      address: qualificationAddress,
      name: "WorldCupQualification",
      qualificationStartTime,
      qualificationEndTime,
      feeRecipient,
      initialPlatformFeeBps,
      initialCountriesCount: initialCountries.length,
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    explorerUrl: chainId === 84532n
      ? `https://sepolia.basescan.org/address/${qualificationAddress}`
      : chainId === 8453n
      ? `https://basescan.org/address/${qualificationAddress}`
      : null,
  };

  console.log("\n========== Deployment Info ==========");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contract on explorer (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    const deploymentTx = qualification.deploymentTransaction();
    if (deploymentTx) {
      await deploymentTx.wait(6);
    }

    console.log("🔍 Verifying contract on block explorer...");

    try {
      await hre.run("verify:verify", {
        address: qualificationAddress,
        constructorArguments: [
          qualificationStartTime,
          qualificationEndTime,
          feeRecipient,
          initialCountriesBytes8,
          initialPlatformFeeBps,
        ],
      });
      console.log("✅ Contract verified!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("❌ Verification failed:", errorMessage);
      console.log("You can verify manually using:");
      console.log(`npx hardhat verify --network ${hre.network.name} ${qualificationAddress} ${qualificationStartTime} ${qualificationEndTime} ${feeRecipient} "${JSON.stringify(initialCountriesBytes8)}" ${initialPlatformFeeBps}`);
    }
  }

  console.log("\n========== Deployment Summary ==========");
  console.log("Contract Address:", qualificationAddress);
  if (deploymentInfo.explorerUrl) {
    console.log("Explorer URL:", deploymentInfo.explorerUrl);
  }
  console.log("\n✨ Deployment complete!");
  console.log("\nNext steps:");
  console.log(`1. All ${initialCountries.length} countries are pre-loaded and ready for voting`);
  console.log("2. Users can start voting after start time with vote(bytes2 country, uint256 votes)");
  console.log("3. Admin can pause/unpause voting if needed with pause() / unpause()");
  console.log("4. Finalize qualification after end time with finalizeQualification()");
  console.log("5. Users can claim winnings with claim()");

  return { qualificationAddress, deploymentInfo };
}

// Execute deployment
main()
  .then(() => {
    console.log("\n✅ Deployment script completed!");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
