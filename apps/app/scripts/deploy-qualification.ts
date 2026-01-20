import hre from "hardhat";

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
  const qualificationEndTime = process.env.QUALIFICATION_END_TIME 
    ? parseInt(process.env.QUALIFICATION_END_TIME)
    : Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // Default: 7 days from now

  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;
  const initialPlatformFeeBps = process.env.INITIAL_PLATFORM_FEE_BPS 
    ? parseInt(process.env.INITIAL_PLATFORM_FEE_BPS)
    : 1000; // Default: 10% (1000 basis points)

  // Initial countries (can be expanded later via addCountry/addCountries)
  const initialCountries = process.env.INITIAL_COUNTRIES
    ? process.env.INITIAL_COUNTRIES.split(",").map(c => c.trim())
    : ["US", "BR", "AR", "FR", "DE", "IT", "ES", "NL", "GB", "PT"]; // Default top 10

  // Helper to convert string to bytes2 (matching test helper)
  const toBytes2 = (str: string): string => {
    if (str.length !== 2) {
      throw new Error(`Invalid country code: ${str}. Must be 2 characters (ISO 3166-1 alpha-2)`);
    }
    const bytes = hre.ethers.toUtf8Bytes(str);
    const twoBytes = bytes.slice(0, 2);
    // Convert to hex and ensure it's exactly 2 bytes (4 hex chars)
    return "0x" + Buffer.from(twoBytes).toString("hex").padEnd(4, "0");
  };

  // Convert string country codes to bytes2
  const initialCountriesBytes2 = initialCountries.map(toBytes2);

  console.log("\n========== Deployment Parameters ==========");
  console.log("Qualification End Time:", new Date(qualificationEndTime * 1000).toISOString());
  console.log("Fee Recipient:", feeRecipient);
  console.log("Initial Platform Fee:", (initialPlatformFeeBps / 100) + "%");
  console.log("Initial Countries:", initialCountries.join(", "));

  // Validate inputs
  if (qualificationEndTime <= Math.floor(Date.now() / 1000)) {
    throw new Error("Qualification end time must be in the future");
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
    qualificationEndTime,
    feeRecipient,
    initialCountriesBytes2,
    initialPlatformFeeBps
  );

  await qualification.waitForDeployment();
  const qualificationAddress = await qualification.getAddress();

  console.log("✅ WorldCupQualification deployed to:", qualificationAddress);

  // Display contract details
  console.log("\n========== Contract Details ==========");
  const details = await qualification.getQualificationDetails();
  console.log("Total Prize Pool:", hre.ethers.formatEther(details._totalPrizePool), "ETH");
  console.log("Qualification End Time:", new Date(Number(details._qualificationEndTime) * 1000).toISOString());
  console.log("Qualification Spots:", details._qualificationSpots.toString());
  console.log("Is Finalized:", details._isFinalized);

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

  // Save deployment info
  const chainId = hre.network.config.chainId;
  const deploymentInfo = {
    network: hre.network.name,
    contract: {
      address: qualificationAddress,
      name: "WorldCupQualification",
      qualificationEndTime,
      feeRecipient,
      initialPlatformFeeBps,
      initialCountries,
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
          qualificationEndTime,
          feeRecipient,
          initialCountriesBytes2,
          initialPlatformFeeBps,
        ],
      });
      console.log("✅ Contract verified!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("❌ Verification failed:", errorMessage);
      console.log("You can verify manually using:");
      console.log(`npx hardhat verify --network ${hre.network.name} ${qualificationAddress} ${qualificationEndTime} ${feeRecipient} "${JSON.stringify(initialCountriesBytes2)}" ${initialPlatformFeeBps}`);
    }
  }

  console.log("\n========== Deployment Summary ==========");
  console.log("Contract Address:", qualificationAddress);
  if (deploymentInfo.explorerUrl) {
    console.log("Explorer URL:", deploymentInfo.explorerUrl);
  }
  console.log("\n✨ Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Add more countries using addCountry() or addCountries()");
  console.log("2. Users can start voting with vote(bytes2 country, uint256 votes)");
  console.log("3. Finalize qualification after end time with finalizeQualification()");
  console.log("4. Users can claim winnings with claim()");

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
