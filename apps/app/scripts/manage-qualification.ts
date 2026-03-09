import hre from "hardhat";

/**
 * Manage WorldCupQualification contract after deployment
 * 
 * Usage examples:
 *   # Add a single country
 *   npx hardhat run scripts/manage-qualification.ts --network baseSepolia
 *   ACTION=addCountry COUNTRY="JP" QUALIFICATION_CONTRACT_ADDRESS=0x... npx hardhat run scripts/manage-qualification.ts --network baseSepolia
 * 
 *   # Add multiple countries
 *   ACTION=addCountries COUNTRIES="JP,CN,KR,IN" QUALIFICATION_CONTRACT_ADDRESS=0x... npx hardhat run scripts/manage-qualification.ts --network baseSepolia
 * 
 *   # Update platform fee (discount/promotion)
 *   ACTION=setFee FEE=500 QUALIFICATION_CONTRACT_ADDRESS=0x... npx hardhat run scripts/manage-qualification.ts --network baseSepolia
 * 
 *   # Get contract status
 *   ACTION=status QUALIFICATION_CONTRACT_ADDRESS=0x... npx hardhat run scripts/manage-qualification.ts --network baseSepolia
 * 
 *   # Finalize qualification (after end time)
 *   ACTION=finalize COUNTRIES="US,BR,AR,..." QUALIFICATION_CONTRACT_ADDRESS=0x... npx hardhat run scripts/manage-qualification.ts --network baseSepolia
 *
 *   # Auto-finalize: ranks all countries by votes (tiebreak: ETH spent), takes top 48
 *   ACTION=autoFinalize QUALIFICATION_CONTRACT_ADDRESS=0x... npx hardhat run scripts/manage-qualification.ts --network baseSepolia
 */

// Helper to convert string to bytes2
const toBytes2 = (str: string): string => {
  if (str.length !== 2) {
    throw new Error(`Invalid country code: ${str}. Must be 2 characters (ISO 3166-1 alpha-2)`);
  }
  const bytes = hre.ethers.toUtf8Bytes(str);
  const twoBytes = bytes.slice(0, 2);
  return "0x" + Buffer.from(twoBytes).toString("hex").padEnd(4, "0");
};

// Helper to decode bytes8 hex value → readable ASCII string (e.g. "0x4252000000000000" → "BR")
const bytes8ToString = (hex: string): string => {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  let result = "";
  for (let i = 0; i < clean.length; i += 2) {
    const code = parseInt(clean.slice(i, i + 2), 16);
    if (code === 0) break;
    result += String.fromCharCode(code);
  }
  return result;
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const contractAddress = process.env.QUALIFICATION_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("QUALIFICATION_CONTRACT_ADDRESS environment variable is required");
  }

  if (!hre.ethers.isAddress(contractAddress)) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }

  const action = process.env.ACTION || "status";
  
  console.log("Managing WorldCupQualification contract");
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", contractAddress);
  console.log("Action:", action);
  console.log("Deployer:", deployer.address);

  const WorldCupQualification = await hre.ethers.getContractFactory("WorldCupQualification");
  const qualification = WorldCupQualification.attach(contractAddress);

  // Verify contract is deployed
  try {
    await qualification.qualificationEndTime();
  } catch (error: unknown) {
    throw new Error(`Contract not found at ${contractAddress}. Make sure it's deployed and the address is correct.`);
  }

  switch (action) {
    case "addCountry": {
      const country = process.env.COUNTRY;
      if (!country) {
        throw new Error("COUNTRY environment variable is required for addCountry action");
      }
      const countryBytes2 = toBytes2(country);
      
      console.log(`\n========== Adding Country: ${country} ==========`);
      const tx = await qualification.connect(deployer).addCountry(countryBytes2);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Country added successfully!");
      break;
    }

    case "addCountries": {
      const countriesStr = process.env.COUNTRIES;
      if (!countriesStr) {
        throw new Error("COUNTRIES environment variable is required for addCountries action (comma-separated)");
      }
      const countries = countriesStr.split(",").map(c => c.trim());
      const countriesBytes2 = countries.map(c => toBytes2(c));
      
      console.log(`\n========== Adding Countries: ${countries.join(", ")} ==========`);
      const tx = await qualification.connect(deployer).addCountries(countriesBytes2);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Countries added successfully!");
      break;
    }

    case "setFee": {
      const feeBps = parseInt(process.env.FEE || "1000");
      if (feeBps > 2000) {
        throw new Error("Platform fee cannot exceed 20% (2000 basis points)");
      }
      
      console.log(`\n========== Updating Platform Fee to ${feeBps / 100}% ==========`);
      const tx = await qualification.connect(deployer).setPlatformFee(feeBps);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Platform fee updated successfully!");
      break;
    }

    case "finalize": {
      const countriesStr = process.env.COUNTRIES;
      if (!countriesStr) {
        throw new Error("COUNTRIES environment variable is required for finalize action (comma-separated list of exactly 48 countries)");
      }
      const countries = countriesStr.split(",").map(c => c.trim());
      
      if (countries.length !== 48) {
        throw new Error(`Expected exactly 48 countries, got ${countries.length}`);
      }

      const countriesBytes2 = countries.map(c => toBytes2(c));
      
      console.log(`\n========== Finalizing Qualification with ${countries.length} Countries ==========`);
      console.log("Countries:", countries.join(", "));
      
      const tx = await qualification.connect(deployer).finalizeQualification(countriesBytes2);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Qualification finalized successfully!");
      break;
    }

    case "autoFinalize": {
      console.log("\n========== Auto-Finalize: Ranking Countries ==========");

      // Fetch all registered countries from the contract
      const allCountryBytes: string[] = [];
      for (let i = 0; ; i++) {
        try {
          const code: string = await (qualification as any).allCountries(i);
          allCountryBytes.push(code);
        } catch {
          // Reverts when index out of bounds — we're done
          break;
        }
      }
      console.log(`Found ${allCountryBytes.length} registered countries`);

      // Fetch votes and ETH for each country in batches to avoid RPC rate limits
      const BATCH_SIZE = 10;
      const countryData: { code: string; name: string; votes: bigint; eth: bigint }[] = [];
      for (let i = 0; i < allCountryBytes.length; i += BATCH_SIZE) {
        const batch = allCountryBytes.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
          batch.map(async (code) => {
            const votes: bigint = await qualification.countryVotes(code);
            const eth: bigint = await qualification.countryETH(code);
            return { code, name: bytes8ToString(code), votes, eth };
          })
        );
        countryData.push(...results);
        if (i + BATCH_SIZE < allCountryBytes.length) {
          await new Promise((r) => setTimeout(r, 300)); // brief pause between batches
        }
      }

      // Filter to countries with at least 1 vote
      const withVotes = countryData.filter((c) => c.votes > 0n);
      console.log(`Countries with votes: ${withVotes.length}`);

      // Find the cutoff: the 48th-highest vote count (after sorting by votes desc, ETH desc)
      // We need first-vote block for countries that fall exactly on the tie boundary.
      const SPOTS = 48;
      const sorted = [...withVotes].sort((a, b) => {
        if (b.votes !== a.votes) return b.votes > a.votes ? 1 : -1;
        return b.eth > a.eth ? 1 : -1;
      });
      const cutoffVotes = sorted[SPOTS - 1]?.votes;
      const cutoffEth = sorted[SPOTS - 1]?.eth;
      const tiedAtCutoff = withVotes.filter(
        (c) => c.votes === cutoffVotes && c.eth === cutoffEth
      );

      // Fetch first-vote block for tied countries using VotePlaced events (paginated)
      const firstVoteBlock: Record<string, number> = {};
      if (tiedAtCutoff.length > 1) {
        console.log(`\nTie-breaking ${tiedAtCutoff.length} countries at ${cutoffVotes} votes / ${hre.ethers.formatEther(cutoffEth)} ETH by first-vote block...`);
        const iface = new hre.ethers.Interface([
          "event VotePlaced(address indexed voter, bytes8 indexed country, uint256 votes, uint256 cost, uint256 timestamp)"
        ]);
        const voteTopic = iface.getEvent("VotePlaced")!.topicHash;
        const latestBlock = await hre.ethers.provider.getBlockNumber();
        const PAGE = 9000;

        for (const c of tiedAtCutoff) {
          // Search from genesis in pages until we find the first vote
          let found = false;
          for (let from = 0; from <= latestBlock && !found; from += PAGE) {
            const to = Math.min(from + PAGE - 1, latestBlock);
            const logs = await hre.ethers.provider.getLogs({
              address: contractAddress,
              topics: [voteTopic, null, c.code],
              fromBlock: from,
              toBlock: to,
            });
            if (logs.length > 0) {
              firstVoteBlock[c.code] = logs[0].blockNumber;
              console.log(`  ${c.name}: first vote at block ${logs[0].blockNumber}`);
              found = true;
            }
          }
          if (!found) firstVoteBlock[c.code] = Number.MAX_SAFE_INTEGER;
        }
      }

      // Sort: votes desc → ETH desc → first-vote block asc (earlier = wins the tie)
      withVotes.sort((a, b) => {
        if (b.votes !== a.votes) return b.votes > a.votes ? 1 : -1;
        if (b.eth !== a.eth) return b.eth > a.eth ? 1 : -1;
        const aBlock = firstVoteBlock[a.code] ?? 0;
        const bBlock = firstVoteBlock[b.code] ?? 0;
        return aBlock - bBlock; // lower block number wins
      });

      if (withVotes.length < SPOTS) {
        throw new Error(`Only ${withVotes.length} countries have votes — need at least ${SPOTS}`);
      }

      const top48 = withVotes.slice(0, SPOTS);
      const dropped = withVotes.slice(SPOTS);

      console.log("\n--- Top 48 qualifying countries ---");
      top48.forEach((c, i) => {
        console.log(
          `${String(i + 1).padStart(2, " ")}. ${c.name.padEnd(8)} votes=${c.votes}  ETH=${hre.ethers.formatEther(c.eth)}`
        );
      });

      if (dropped.length > 0) {
        console.log("\n--- Dropped countries ---");
        dropped.forEach((c) => {
          console.log(`  ${c.name.padEnd(8)} votes=${c.votes}  ETH=${hre.ethers.formatEther(c.eth)}`);
        });
      }

      console.log(`\nSubmitting finalizeQualification with ${top48.length} countries...`);
      const top48Codes = top48.map((c) => c.code);
      const tx = await (qualification as any).connect(deployer).finalizeQualification(top48Codes);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Qualification finalized successfully!");
      break;
    }

    case "status":
    default: {
      console.log("\n========== Contract Status ==========");
      
      const details = await qualification.getQualificationDetails();
      const platformFeeBps = await qualification.platformFeeBps();
      const totalVotes = await qualification.totalVotes();
      const totalPlatformFees = await qualification.totalPlatformFeesCollected();
      const qualificationFinalized = await qualification.qualificationFinalized();
      
      console.log("Qualification End Time:", new Date(Number(details._qualificationEndTime) * 1000).toISOString());
      console.log("Qualification Spots:", details._qualificationSpots.toString());
      console.log("Is Finalized:", qualificationFinalized);
      console.log("Platform Fee:", (Number(platformFeeBps) / 100) + "%");
      console.log("Total Votes:", totalVotes.toString());
      console.log("Total Prize Pool:", hre.ethers.formatEther(details._totalPrizePool), "ETH");
      console.log("Total Platform Fees:", hre.ethers.formatEther(totalPlatformFees), "ETH");
      
      // Get current time
      const currentBlock = await hre.ethers.provider.getBlock("latest");
      if (!currentBlock) {
        throw new Error("Could not get latest block");
      }
      const now = currentBlock.timestamp;
      const endTime = Number(details._qualificationEndTime);
      
      if (now < endTime) {
        const remaining = endTime - now;
        const days = Math.floor(remaining / (24 * 60 * 60));
        const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
        console.log(`\n⏰ Qualification period ends in: ${days} days, ${hours} hours`);
      } else if (!qualificationFinalized) {
        console.log("\n⏰ Qualification period has ended - ready to finalize");
      } else {
        console.log("\n✅ Qualification is finalized");
      }
      break;
    }
  }

  console.log("\n✨ Operation completed!");
}

// Execute script
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("\n❌ Operation failed:");
    console.error(error);
    process.exit(1);
  });
