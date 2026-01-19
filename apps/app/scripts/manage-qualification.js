const hre = require("hardhat");

/**
 * Manage WorldCupQualification contract after deployment
 * 
 * Usage examples:
 *   # Add a single country
 *   npx hardhat run scripts/manage-qualification.js --network baseSepolia --action addCountry --country "JP"
 * 
 *   # Add multiple countries
 *   npx hardhat run scripts/manage-qualification.js --network baseSepolia --action addCountries --countries "JP,CN,KR,IN"
 * 
 *   # Update platform fee (discount/promotion)
 *   npx hardhat run scripts/manage-qualification.js --network baseSepolia --action setFee --fee 500
 * 
 *   # Get contract status
 *   npx hardhat run scripts/manage-qualification.js --network baseSepolia --action status
 * 
 *   # Finalize qualification (after end time)
 *   npx hardhat run scripts/manage-qualification.js --network baseSepolia --action finalize --countries "US,BR,AR,..."
 */

// Helper to convert string to bytes2
const toBytes2 = (str) => {
  if (str.length !== 2) {
    throw new Error(`Invalid country code: ${str}. Must be 2 characters (ISO 3166-1 alpha-2)`);
  }
  const bytes = hre.ethers.toUtf8Bytes(str);
  const twoBytes = bytes.slice(0, 2);
  return "0x" + Buffer.from(twoBytes).toString("hex").padEnd(4, "0");
};

// Helper to convert bytes2 to string
const fromBytes2 = (bytes2) => {
  return hre.ethers.toUtf8String(bytes2 + "000000000000000000000000000000000000000000000000000000000000");
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
  } catch (error) {
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
      const countriesBytes2 = countries.map(toBytes2);
      
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

      const countriesBytes2 = countries.map(toBytes2);
      
      console.log(`\n========== Finalizing Qualification with ${countries.length} Countries ==========`);
      console.log("Countries:", countries.join(", "));
      
      const tx = await qualification.connect(deployer).finalizeQualification(countriesBytes2);
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
      const totalPlatformFees = await qualification.totalPlatformFees();
      const qualificationFinalized = await qualification.qualificationFinalized();
      
      console.log("Qualification End Time:", new Date(Number(details._qualificationEndTime) * 1000).toISOString());
      console.log("Qualification Spots:", details._qualificationSpots.toString());
      console.log("Is Finalized:", qualificationFinalized);
      console.log("Platform Fee:", (platformFeeBps / 100) + "%");
      console.log("Total Votes:", totalVotes.toString());
      console.log("Total Prize Pool:", hre.ethers.formatEther(details._totalPrizePool), "ETH");
      console.log("Total Platform Fees:", hre.ethers.formatEther(totalPlatformFees), "ETH");
      
      // Get current time
      const currentTime = await hre.ethers.provider.getBlock("latest");
      const now = currentTime.timestamp;
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

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Operation failed:");
    console.error(error);
    process.exit(1);
  });
