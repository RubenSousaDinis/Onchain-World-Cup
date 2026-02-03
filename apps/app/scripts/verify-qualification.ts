import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// HardhatRuntimeEnvironment.ethers is injected by @nomicfoundation/hardhat-ethers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ethers = (hre as any).ethers as {
  provider: { getTransaction: (tx: string) => Promise<{ data: string } | null> };
  AbiCoder: { defaultAbiCoder: () => { decode: (types: readonly string[], data: string) => unknown[] } };
  toUtf8Bytes: (s: string) => Uint8Array;
};

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONSTRUCTOR_ABI_TYPES = [
  "uint256", // qualificationStartTime
  "uint256", // qualificationEndTime
  "address", // feeRecipient
  "bytes8[]", // initialCountries
  "uint256", // initialPlatformFeeBps
] as const;

/**
 * Fetch contract creation tx hash from Etherscan V2 API and decode constructor
 * arguments from the deployment transaction data.
 */
async function getConstructorArgsFromChain(
  contractAddress: string,
  chainId: number,
  apiKey: string
): Promise<unknown[] | null> {
  const url = new URL("https://api.etherscan.io/v2/api");
  url.searchParams.set("chainid", String(chainId));
  url.searchParams.set("module", "contract");
  url.searchParams.set("action", "getcontractcreation");
  url.searchParams.set("contractaddresses", contractAddress);
  url.searchParams.set("apikey", apiKey);

  const res = await fetch(url.toString());
  const data = (await res.json()) as {
    status: string;
    message: string;
    result?: Array<{ contractAddress: string; txHash: string }>;
  };

  if (data.message !== "OK" || !Array.isArray(data.result) || data.result.length === 0) {
    return null;
  }

  const txHash = data.result[0].txHash;
  if (!txHash) return null;

  const tx = await ethers.provider.getTransaction(txHash);
  if (!tx?.data) return null;

  const artifact = await hre.artifacts.readArtifact("WorldCupQualification");
  const bytecode = artifact.bytecode;
  if (!bytecode || typeof bytecode !== "string") return null;

  // Tx data = creation bytecode + ABI-encoded constructor args
  const bytecodeHex = bytecode.startsWith("0x") ? bytecode.slice(2) : bytecode;
  const txDataHex = tx.data.startsWith("0x") ? tx.data.slice(2) : tx.data;
  if (!txDataHex.startsWith(bytecodeHex)) {
    // Bytecode might have metadata differences; try matching from the end by
    // decoding only the tail (constructor args have a known minimum size)
    return null;
  }

  const encodedArgsHex = txDataHex.slice(bytecodeHex.length);
  if (encodedArgsHex.length === 0) return null;

  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  const decoded = abiCoder.decode(CONSTRUCTOR_ABI_TYPES, "0x" + encodedArgsHex);
  return Array.from(decoded);
}

/**
 * Build constructor arguments from env + countries file (same logic as deploy script).
 */
function getConstructorArgsFromEnv(): {
  qualificationStartTime: number;
  qualificationEndTime: number;
  feeRecipient: string;
  initialCountriesBytes8: string[];
  initialPlatformFeeBps: number;
} {
  const qualificationStartTime = process.env.QUALIFICATION_START_TIME
    ? parseInt(process.env.QUALIFICATION_START_TIME, 10)
    : 0;
  const qualificationEndTime = process.env.QUALIFICATION_END_TIME
    ? parseInt(process.env.QUALIFICATION_END_TIME, 10)
    : 0;
  const feeRecipient = process.env.FEE_RECIPIENT || "";
  const initialPlatformFeeBps = process.env.INITIAL_PLATFORM_FEE_BPS
    ? parseInt(process.env.INITIAL_PLATFORM_FEE_BPS, 10)
    : 1000;

  const countriesPath = path.join(__dirname, "..", "data", "countries.json");
  const countriesData = JSON.parse(fs.readFileSync(countriesPath, "utf8"));
  const initialCountries = countriesData
    .map((c: { code?: string }) => c.code)
    .filter((code: string) => code && code.length <= 8);

  const toBytes8 = (str: string): string => {
    if (str.length > 8) {
      throw new Error(`Invalid country code: ${str}. Must be 8 characters or less`);
    }
    const bytes = ethers.toUtf8Bytes(str);
    const hex = Buffer.from(bytes).toString("hex");
    return "0x" + hex.padEnd(16, "0");
  };

  const initialCountriesBytes8 = initialCountries.map(toBytes8);

  return {
    qualificationStartTime,
    qualificationEndTime,
    feeRecipient,
    initialCountriesBytes8,
    initialPlatformFeeBps,
  };
}

/**
 * Verify WorldCupQualification contract on Basescan
 *
 * Usage:
 *   CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify-qualification.ts --network baseSepolia
 *   CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify-qualification.ts --network baseMainnet
 *
 * Constructor args are read from the deployment tx on-chain when ETHERSCAN_API_KEY is set.
 * Otherwise set QUALIFICATION_START_TIME, QUALIFICATION_END_TIME, FEE_RECIPIENT,
 * INITIAL_PLATFORM_FEE_BPS and use the same data/countries.json as at deployment.
 */
async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS environment variable not set");
  }

  console.log("Verifying WorldCupQualification contract");
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", contractAddress);

  const chainId = Number(hre.network.config.chainId);
  const apiKey = process.env.ETHERSCAN_API_KEY || "";

  let constructorArguments: unknown[];

  if (apiKey && chainId) {
    console.log("\n📡 Fetching constructor arguments from deployment transaction...");
    try {
      const fromChain = await getConstructorArgsFromChain(contractAddress, chainId, apiKey);
      if (fromChain && fromChain.length === 5) {
        constructorArguments = fromChain;
        console.log("   Using arguments decoded from chain (exact match).");
      } else {
        throw new Error("Could not decode args from chain");
      }
    } catch (e) {
      console.log("   Fallback: using env + data/countries.json");
      const envArgs = getConstructorArgsFromEnv();
      constructorArguments = [
        envArgs.qualificationStartTime,
        envArgs.qualificationEndTime,
        envArgs.feeRecipient,
        envArgs.initialCountriesBytes8,
        envArgs.initialPlatformFeeBps,
      ];
    }
  } else {
    const envArgs = getConstructorArgsFromEnv();
    constructorArguments = [
      envArgs.qualificationStartTime,
      envArgs.qualificationEndTime,
      envArgs.feeRecipient,
      envArgs.initialCountriesBytes8,
      envArgs.initialPlatformFeeBps,
    ];
    console.log("\n   Using QUALIFICATION_* and FEE_RECIPIENT from env + data/countries.json");
  }

  const [qualificationStartTime, qualificationEndTime, feeRecipient, initialCountriesBytes8, initialPlatformFeeBps] =
    constructorArguments as [bigint | number, bigint | number, string, string[], bigint | number];

  console.log("\n========== Verification Parameters ==========");
  console.log("Qualification Start Time:", String(qualificationStartTime));
  console.log("Qualification End Time:", String(qualificationEndTime));
  console.log("Fee Recipient:", feeRecipient);
  console.log("Initial Platform Fee:", String(initialPlatformFeeBps), "bps");
  console.log(
    "Initial Countries Count:",
    Array.isArray(initialCountriesBytes8) ? initialCountriesBytes8.length : 0
  );

  console.log("\n🔍 Verifying contract...");

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments,
    });
    console.log("✅ Contract verified successfully!");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", errorMessage);
      console.log("\nTroubleshooting:");
      console.log("1. Set ETHERSCAN_API_KEY in .env (get one at https://etherscan.io/apidashboard)");
      console.log("2. With API key set, the script uses constructor args from the deployment tx.");
      console.log("3. Otherwise set QUALIFICATION_START_TIME, QUALIFICATION_END_TIME, FEE_RECIPIENT, INITIAL_PLATFORM_FEE_BPS and use the same data/countries.json as at deployment.");
      console.log("4. Ensure the contract was deployed on this network.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
