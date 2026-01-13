const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Step 1: Deploy EventHub
  console.log("\n========== Deploying WorldCupEventHub ==========");
  const EventHub = await hre.ethers.getContractFactory("WorldCupEventHub");
  const eventHub = await EventHub.deploy();
  await eventHub.waitForDeployment();
  const eventHubAddress = await eventHub.getAddress();
  console.log("✅ WorldCupEventHub deployed to:", eventHubAddress);

  // Step 2: Deploy WorldCupMatch
  console.log("\n========== Deploying WorldCupMatch ==========");
  const WorldCupMatch = await hre.ethers.getContractFactory("WorldCupMatch");

  // Deployment parameters
  const team1Name = "Brazil";
  const team2Name = "Argentina";
  const deployTime = Math.floor(Date.now() / 1000);
  const platformAddress = deployer.address; // Use deployer as platform for testing
  const platformFeePercent = 1000; // 10% (in basis points: 1000 = 10%)

  console.log("\nMatch Parameters:");
  console.log("- Team 1:", team1Name);
  console.log("- Team 2:", team2Name);
  console.log("- Deploy Time:", new Date(deployTime * 1000).toISOString());
  console.log("- Platform Address:", platformAddress);
  console.log("- Platform Fee:", (platformFeePercent / 100) + "%");
  console.log("- EventHub:", eventHubAddress);

  const match = await WorldCupMatch.deploy(
    team1Name,
    team2Name,
    deployTime,
    platformAddress,
    platformFeePercent,
    eventHubAddress
  );

  await match.waitForDeployment();
  const matchAddress = await match.getAddress();
  console.log("\n✅ WorldCupMatch deployed to:", matchAddress);

  // Step 3: Authorize match in EventHub
  console.log("\n========== Authorizing Match in EventHub ==========");
  const authTx = await eventHub.authorizeMatch(matchAddress);
  await authTx.wait();
  console.log("✅ Match authorized in EventHub");

  // Display match details
  console.log("\n========== Match Details ==========");
  const details = await match.getMatchDetails();
  console.log("Team 1:", details._team1Name);
  console.log("Team 2:", details._team2Name);
  console.log("Voting End Time:", new Date(Number(details._team1Votes) * 1000).toISOString());
  console.log("Current Phase:", details._currentPhase.toString());

  // Display pricing information
  const team1Price = await match.calculateVotePrice(0);
  const team2Price = await match.calculateVotePrice(1);
  console.log("\n========== Current Vote Prices ==========");
  console.log("Team 1:", hre.ethers.formatEther(team1Price), "ETH");
  console.log("Team 2:", hre.ethers.formatEther(team2Price), "ETH");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    eventHub: {
      address: eventHubAddress,
      name: "WorldCupEventHub"
    },
    match: {
      address: matchAddress,
      name: "WorldCupMatch",
      team1: team1Name,
      team2: team2Name,
      deployTime,
      platformAddress,
      platformFeePercent: (platformFeePercent / 100) + "%"
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  console.log("\n========== Deployment Info ==========");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contracts on explorer (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await match.deploymentTransaction().wait(6);

    console.log("🔍 Verifying contracts on block explorer...");

    try {
      // Verify EventHub
      console.log("Verifying EventHub...");
      await hre.run("verify:verify", {
        address: eventHubAddress,
        constructorArguments: [],
      });
      console.log("✅ EventHub verified!");
    } catch (error) {
      console.log("❌ EventHub verification failed:", error.message);
    }

    try {
      // Verify Match
      console.log("Verifying WorldCupMatch...");
      await hre.run("verify:verify", {
        address: matchAddress,
        constructorArguments: [
          team1Name,
          team2Name,
          deployTime,
          platformAddress,
          platformFeePercent,
          eventHubAddress
        ],
      });
      console.log("✅ WorldCupMatch verified!");
    } catch (error) {
      console.log("❌ WorldCupMatch verification failed:", error.message);
    }
  }

  console.log("\n========== Deployment Summary ==========");
  console.log("EventHub:", eventHubAddress);
  console.log("Match:", matchAddress);
  console.log("\n✨ All contracts deployed successfully!");
  console.log("\nNext steps:");
  console.log("1. Query all events from EventHub:", eventHubAddress);
  console.log("2. Users vote on Match:", matchAddress);
  console.log("3. Owner can update fees/platform via Match contract");

  return { eventHubAddress, matchAddress };
}

// Execute deployment
main()
  .then(() => {
    console.log("\n✅ Deployment complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
