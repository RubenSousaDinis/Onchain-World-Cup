import hre from "hardhat";

/**
 * Vote for a country and immediately index the transaction
 *
 * ⚠️ DEVELOPMENT ONLY - DO NOT RUN IN PRODUCTION ⚠️
 *
 * This script is designed for local testing and development purposes only.
 * It should NOT be used in production environments.
 *
 * This script:
 * 1. Connects to the WorldCupQualification contract
 * 2. Calculates the cost for the requested number of votes
 * 3. Submits a vote transaction
 * 4. Waits for confirmation
 * 5. Triggers the indexer API to immediately index the transaction
 *
 * Usage:
 *   npm run vote -- BR 5                    # Vote 5 times for Brazil on Base Sepolia (default)
 *   npm run vote -- AR 10 8453              # Vote 10 times for Argentina on Base Mainnet
 *   npm run vote -- US 1 84532              # Vote 1 time for USA on Base Sepolia
 *
 * Environment variables required:
 *   - PRIVATE_KEY: Private key of the wallet voting
 *   - NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA: Contract address on Base Sepolia
 *   - NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET: Contract address on Base Mainnet (optional)
 *   - NODE_ENV: Must be "development" or unset (defaults to development)
 */

interface VoteResult {
  txHash: string;
  countryCode: string;
  voteCount: number;
  totalCostEth: string;
  blockNumber: bigint;
}

async function main() {
  // Safety check: Only run in development
  const nodeEnv = process.env.NODE_ENV || "development";

  if (nodeEnv === "production") {
    console.error("\n❌ ERROR: This script is for DEVELOPMENT ONLY");
    console.error("❌ Running this script in production is not allowed.");
    console.error("\nThis script is designed for:");
    console.error("  - Local testing and development");
    console.error("  - Seeding test data");
    console.error("  - Manual testing of vote flow");
    console.error("\nFor production voting:");
    console.error("  - Users should vote through the web interface");
    console.error("  - Votes are automatically indexed via the cron job");
    console.error("\nIf you really need to run this, unset NODE_ENV:");
    console.error("  unset NODE_ENV && npm run vote -- BR 5");
    process.exit(1);
  }

  console.log("⚠️  DEVELOPMENT MODE - This script is for testing only");
  console.log("Environment:", nodeEnv);

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("❌ Error: Missing required arguments");
    console.log("\nUsage: npm run vote -- <COUNTRY_CODE> <VOTE_COUNT> [CHAIN_ID]");
    console.log("\nExamples:");
    console.log("  npm run vote -- BR 5        # Vote 5 times for Brazil on Base Sepolia");
    console.log("  npm run vote -- AR 10 8453  # Vote 10 times for Argentina on Base Mainnet");
    console.log("\nArguments:");
    console.log("  COUNTRY_CODE: 2-character country code (e.g., BR, AR, US, PT)");
    console.log("  VOTE_COUNT: Number of votes (1-100)");
    console.log("  CHAIN_ID: Optional. 84532 for Base Sepolia (default), 8453 for Base Mainnet");
    process.exit(1);
  }

  const countryCode = args[0].toUpperCase();
  const voteCount = parseInt(args[1]);
  const chainId = args[2] ? parseInt(args[2]) : 84532; // Default to Base Sepolia

  // Additional safety: Warn about mainnet usage
  if (chainId === 8453) {
    console.warn("\n⚠️  WARNING: You are about to interact with BASE MAINNET");
    console.warn("⚠️  This will use REAL ETH and create REAL transactions");
    console.warn("⚠️  Make sure this is intentional!");
    console.warn("\nPress Ctrl+C within 5 seconds to cancel...\n");

    // Wait 5 seconds to allow user to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log("Proceeding with mainnet transaction...\n");
  }

  // Validate inputs
  if (countryCode.length > 8) {
    throw new Error(`Country code "${countryCode}" is too long. Maximum 8 characters.`);
  }

  if (isNaN(voteCount) || voteCount < 1 || voteCount > 100) {
    throw new Error("Vote count must be a number between 1 and 100");
  }

  if (chainId !== 84532 && chainId !== 8453) {
    throw new Error("Chain ID must be 84532 (Base Sepolia) or 8453 (Base Mainnet)");
  }

  // Get contract address from environment
  const contractAddress = chainId === 84532
    ? process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA
    : process.env.NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET;

  if (!contractAddress) {
    throw new Error(
      `Contract address not found for chain ${chainId}. ` +
      `Please set ${chainId === 84532 ? 'NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA' : 'NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET'} in your .env file.`
    );
  }

  // Set up network
  const networkName = chainId === 84532 ? "baseSepolia" : "baseMainnet";
  await hre.changeNetwork(networkName);

  const [signer] = await hre.ethers.getSigners();

  console.log("\n========== Vote Script Configuration ==========");
  console.log("Network:", networkName);
  console.log("Chain ID:", chainId);
  console.log("Contract Address:", contractAddress);
  console.log("Voter Address:", signer.address);
  console.log("Voter Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address)), "ETH");
  console.log("Country Code:", countryCode);
  console.log("Vote Count:", voteCount);

  // Helper to convert string to bytes8
  const toBytes8 = (str: string): string => {
    if (str.length > 8) {
      throw new Error(`Country code "${str}" is too long. Maximum 8 characters.`);
    }
    const bytes = hre.ethers.toUtf8Bytes(str);
    const hex = Buffer.from(bytes).toString("hex");
    return "0x" + hex.padEnd(16, "0");
  };

  // Connect to the contract
  const WorldCupQualification = await hre.ethers.getContractFactory("WorldCupQualification");
  const contract = WorldCupQualification.attach(contractAddress);

  // Convert country code to bytes8
  const countryBytes = toBytes8(countryCode);

  console.log("\n========== Calculating Vote Cost ==========");

  // Get the current vote cost
  let totalCost: bigint;
  try {
    totalCost = await contract.calculateVoteCost(countryBytes, voteCount);
    console.log("Total Cost:", hre.ethers.formatEther(totalCost), "ETH");
  } catch (error) {
    console.error("❌ Error calculating vote cost:", error);
    throw error;
  }

  // Check if user has enough balance
  const balance = await hre.ethers.provider.getBalance(signer.address);
  if (balance < totalCost) {
    throw new Error(
      `Insufficient balance. Need ${hre.ethers.formatEther(totalCost)} ETH but only have ${hre.ethers.formatEther(balance)} ETH`
    );
  }

  console.log("\n========== Submitting Vote Transaction ==========");

  // Submit vote
  let tx;
  try {
    tx = await contract.vote(countryBytes, voteCount, {
      value: totalCost,
    });
    console.log("✅ Transaction submitted!");
    console.log("Transaction Hash:", tx.hash);
  } catch (error) {
    console.error("❌ Error submitting vote:", error);
    throw error;
  }

  // Wait for confirmation
  console.log("\n⏳ Waiting for transaction confirmation...");
  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error("Transaction receipt is null");
  }

  console.log("✅ Transaction confirmed!");
  console.log("Block Number:", receipt.blockNumber);
  console.log("Gas Used:", receipt.gasUsed.toString());

  const voteResult: VoteResult = {
    txHash: tx.hash,
    countryCode,
    voteCount,
    totalCostEth: hre.ethers.formatEther(totalCost),
    blockNumber: BigInt(receipt.blockNumber),
  };

  console.log("\n========== Vote Summary ==========");
  console.log(JSON.stringify({
    ...voteResult,
    blockNumber: voteResult.blockNumber.toString(),
  }, null, 2));

  // Trigger immediate indexing via API (development only)
  console.log("\n========== Triggering Indexer API ==========");

  const indexerUrl = "http://localhost:3101/api/indexer/sync";

  try {
    console.log("Calling indexer API:", indexerUrl);
    const response = await fetch(indexerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chainId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Indexer API error:", response.status, errorText);
      console.log("⚠️  This is normal if the dev server is not running.");
      console.log("⚠️  Start dev server: npm run dev");
    } else {
      const result = await response.json();
      console.log("✅ Indexer API response:", JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("❌ Error calling indexer API:", error);
    console.log("⚠️  Make sure the dev server is running: npm run dev");
    console.log("⚠️  Transaction is on blockchain and will be indexed by cron job.");
  }

  console.log("\n✨ Vote complete!");
  console.log("\nNext steps:");
  console.log("1. Check the transaction on block explorer");
  console.log("2. Verify the vote was indexed in the database (check Prisma Studio)");
  console.log("3. View updated country stats via API: GET /api/qualification/countries/" + countryCode);

  return voteResult;
}

// Execute script
main()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exit(1);
  });
