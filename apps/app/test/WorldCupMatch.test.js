const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("WorldCupMatch", function () {
  let worldCupMatch;
  let eventHub;
  let owner, platform, voter1, voter2, voter3;
  let deployTime;

  // Helper to parse ether amounts
  const parseEth = (amount) => ethers.parseEther(amount.toString());
  const formatEth = (amount) => ethers.formatEther(amount);

  // Helper to deploy a new match with EventHub
  const deployNewMatch = async (team1Name, team2Name, deployTime, platformAddr) => {
    // Deploy EventHub
    const EventHub = await ethers.getContractFactory("WorldCupEventHub");
    const newEventHub = await EventHub.deploy();
    await newEventHub.waitForDeployment();

    // Deploy Match
    const WorldCupMatch = await ethers.getContractFactory("WorldCupMatch");
    const match = await WorldCupMatch.deploy(
      team1Name,
      team2Name,
      deployTime,
      platformAddr,
      1000, // 10% platform fee
      await newEventHub.getAddress()
    );
    await match.waitForDeployment();

    // Authorize match
    await newEventHub.authorizeMatch(await match.getAddress());

    return match;
  };

  beforeEach(async function () {
    [owner, platform, voter1, voter2, voter3] = await ethers.getSigners();

    // Deploy EventHub first
    const EventHub = await ethers.getContractFactory("WorldCupEventHub");
    eventHub = await EventHub.deploy();
    await eventHub.waitForDeployment();

    // Deploy WorldCupMatch with EventHub reference
    const WorldCupMatch = await ethers.getContractFactory("WorldCupMatch");
    deployTime = await time.latest();

    worldCupMatch = await WorldCupMatch.deploy(
      "Brazil",
      "Argentina",
      deployTime,
      platform.address,
      1000, // 10% platform fee (basis points)
      await eventHub.getAddress()
    );

    await worldCupMatch.waitForDeployment();

    // Authorize match in EventHub
    await eventHub.authorizeMatch(await worldCupMatch.getAddress());
  });

  describe("Deployment", function () {
    it("Should set the correct team names", async function () {
      expect(await worldCupMatch.team1Name()).to.equal("Brazil");
      expect(await worldCupMatch.team2Name()).to.equal("Argentina");
    });

    it("Should set the correct timestamps", async function () {
      expect(await worldCupMatch.matchStartTime()).to.equal(deployTime);
      expect(await worldCupMatch.votingEndTime()).to.equal(deployTime + 24 * 3600);
      expect(await worldCupMatch.matchEndTime()).to.equal(deployTime + 26 * 3600);
    });

    it("Should set the correct platform address", async function () {
      expect(await worldCupMatch.platformAddress()).to.equal(platform.address);
    });

    it("Should initialize vote counts to zero", async function () {
      expect(await worldCupMatch.team1VoteCount()).to.equal(0);
      expect(await worldCupMatch.team2VoteCount()).to.equal(0);
    });

    it("Should start in Phase 1", async function () {
      expect(await worldCupMatch.getCurrentPhase()).to.equal(1);
    });
  });

  describe("Phase 1: Linear Pricing (0-2 hours)", function () {
    it("Should calculate correct first vote price (0.001 ETH)", async function () {
      const price = await worldCupMatch.calculateVotePrice(0);
      expect(price).to.equal(parseEth("0.001"));
    });

    it("Should increase price linearly by 0.0001 ETH per vote", async function () {
      // First vote: 0.001 ETH
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      expect(await worldCupMatch.calculateVotePrice(0)).to.equal(parseEth("0.0011"));

      // Second vote: 0.0011 ETH
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0011") });
      expect(await worldCupMatch.calculateVotePrice(0)).to.equal(parseEth("0.0012"));

      // Third vote: 0.0012 ETH
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0012") });
      expect(await worldCupMatch.calculateVotePrice(0)).to.equal(parseEth("0.0013"));
    });

    it("Should track vote count correctly after 10 votes", async function () {
      for (let i = 0; i < 10; i++) {
        const price = await worldCupMatch.calculateVotePrice(0);
        await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: price });
      }

      expect(await worldCupMatch.team1VoteCount()).to.equal(10);
      expect(await worldCupMatch.userVoteCount(voter1.address, 0)).to.equal(10);

      // Price should be 0.001 + (10 * 0.0001) = 0.002 ETH
      const nextPrice = await worldCupMatch.calculateVotePrice(0);
      expect(nextPrice).to.equal(parseEth("0.002"));
    });

    it("Should track ETH separately from vote count", async function () {
      // Vote 3 times
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0011") });
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0012") });

      // Vote count should be 3
      expect(await worldCupMatch.team1VoteCount()).to.equal(3);

      // Prize pool ETH should be 90% of total: (0.001 + 0.0011 + 0.0012) * 0.9 = 0.00297
      const totalVoted = parseEth("0.0033");
      const expectedPrizePool = totalVoted - (totalVoted * 1000n) / 10000n; // 90%
      expect(await worldCupMatch.team1TotalETH()).to.equal(expectedPrizePool);
    });

    it("Should allow different voters on different teams", async function () {
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await worldCupMatch.connect(voter2).vote(1, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      expect(await worldCupMatch.team1VoteCount()).to.equal(1);
      expect(await worldCupMatch.team2VoteCount()).to.equal(1);
      expect(await worldCupMatch.userVoteCount(voter1.address, 0)).to.equal(1);
      expect(await worldCupMatch.userVoteCount(voter2.address, 1)).to.equal(1);
    });

    it("Should refund overpayment", async function () {
      const price = await worldCupMatch.calculateVotePrice(0);
      const overpayment = parseEth("0.01"); // Send 10x the required amount

      const balanceBefore = await ethers.provider.getBalance(voter1.address);
      const tx = await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: overpayment });
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(voter1.address);

      // Should only charge the exact price + gas
      const expectedBalance = balanceBefore - price - gasCost;
      expect(balanceAfter).to.equal(expectedBalance);
    });

    it("Should emit VotesPlaced event with correct data", async function () {
      const price = parseEth("0.001");
      const platformFee = (price * 1000n) / 10000n; // 10%
      const prizePool = price - platformFee; // 90%

      await expect(worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: price }))
        .to.emit(worldCupMatch, "VotesPlaced")
        .withArgs(voter1.address, 0, 1, price, platformFee, prizePool);
    });

    it("Should revert if insufficient payment", async function () {
      await expect(
        worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0009") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should revert for invalid team index", async function () {
      await expect(
        worldCupMatch.connect(voter1).vote(2, 1, ethers.ZeroAddress, { value: parseEth("0.001") })
      ).to.be.revertedWith("Invalid team index");
    });
  });

  describe("Phase 2: Exponential Pricing (2-24 hours)", function () {
    beforeEach(async function () {
      // Place some votes in Phase 1
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0011") });

      // Fast forward to Phase 2 (2 hours + 1 second)
      await time.increase(2 * 3600 + 1);
    });

    it("Should be in Phase 2 after 2 hours", async function () {
      expect(await worldCupMatch.getCurrentPhase()).to.equal(2);
    });

    it("Should store Phase 1 end state on first Phase 2 vote", async function () {
      // First vote in Phase 2
      const price = await worldCupMatch.calculateVotePrice(0);
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: price });

      const phase1Details = await worldCupMatch.getPhase1Details();
      expect(phase1Details.ended).to.be.true;
      expect(phase1Details.team1Votes).to.equal(2); // Team 1 had 2 votes in Phase 1
      expect(phase1Details.team2Votes).to.equal(0); // Team 2 had 0 votes in Phase 1
    });

    it("Should apply 1.1x multiplier for each Phase 2 vote", async function () {
      // Get Phase 1 end price (should be 0.0012 for 2 votes)
      const phase1EndPrice = parseEth("0.0012");

      // First Phase 2 vote should be phase1EndPrice
      let price = await worldCupMatch.calculateVotePrice(0);
      expect(price).to.equal(phase1EndPrice);

      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: price });

      // Second Phase 2 vote should be 1.1x higher
      price = await worldCupMatch.calculateVotePrice(0);
      const expected1 = (phase1EndPrice * 11n) / 10n;
      expect(price).to.equal(expected1);

      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: price });

      // Third Phase 2 vote should be 1.1x higher again
      price = await worldCupMatch.calculateVotePrice(0);
      const expected2 = (expected1 * 11n) / 10n;
      expect(price).to.equal(expected2);
    });

    it("Should track vote counts correctly across phases", async function () {
      // 2 votes already in Phase 1
      expect(await worldCupMatch.team1VoteCount()).to.equal(2);

      // Add 3 more votes in Phase 2
      for (let i = 0; i < 3; i++) {
        const price = await worldCupMatch.calculateVotePrice(0);
        await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: price });
      }

      // Total should be 5
      expect(await worldCupMatch.team1VoteCount()).to.equal(5);
      expect(await worldCupMatch.userVoteCount(voter1.address, 0)).to.equal(5);
    });

    it("Should handle exponential growth correctly (10 Phase 2 votes)", async function () {
      let expectedPrice = parseEth("0.0012"); // Phase 1 end price

      for (let i = 0; i < 10; i++) {
        const price = await worldCupMatch.calculateVotePrice(0);

        // Allow small rounding difference due to integer division
        const diff = price > expectedPrice ? price - expectedPrice : expectedPrice - price;
        expect(diff).to.be.lessThan(parseEth("0.000001"));

        await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: price });

        // Calculate next expected price (1.1x)
        expectedPrice = (expectedPrice * 11n) / 10n;
      }

      // Should have 12 total votes (2 from Phase 1 + 10 from Phase 2)
      expect(await worldCupMatch.team1VoteCount()).to.equal(12);
    });
  });

  describe("Phase Transition", function () {
    it("Should transition from Phase 1 to Phase 2 correctly", async function () {
      // Start in Phase 1
      expect(await worldCupMatch.getCurrentPhase()).to.equal(1);

      // Vote in Phase 1
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      // Fast forward to Phase 2
      await time.increase(2 * 3600 + 1);
      expect(await worldCupMatch.getCurrentPhase()).to.equal(2);

      // Phase 1 should not be marked as ended yet
      const phase1DetailsBefore = await worldCupMatch.getPhase1Details();
      expect(phase1DetailsBefore.ended).to.be.false;

      // First Phase 2 vote should trigger phase end
      const price = await worldCupMatch.calculateVotePrice(0);
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: price });

      const phase1DetailsAfter = await worldCupMatch.getPhase1Details();
      expect(phase1DetailsAfter.ended).to.be.true;
      expect(phase1DetailsAfter.team1Votes).to.equal(1); // Team 1 had 1 vote in Phase 1
      expect(phase1DetailsAfter.team2Votes).to.equal(0); // Team 2 had 0 votes in Phase 1
    });

    it("Should close voting after 24 hours", async function () {
      await time.increase(24 * 3600 + 1);
      expect(await worldCupMatch.getCurrentPhase()).to.equal(0);

      await expect(
        worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") })
      ).to.be.revertedWith("Voting is closed");
    });
  });

  describe("Match Finalization", function () {
    beforeEach(async function () {
      // Voter1 votes for team 0 with 0.001 ETH (gets 1 vote)
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      // Voter2 votes for team 0 with 0.0011 ETH (gets 1 vote)
      await worldCupMatch.connect(voter2).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0011") });

      // Voter3 votes for team 1 with 0.001 ETH (gets 1 vote)
      await worldCupMatch.connect(voter3).vote(1, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      // Fast forward past voting end
      await time.increase(24 * 3600 + 1);
    });

    it("Should auto-finalize on first withdrawal", async function () {
      // Not finalized yet
      expect(await worldCupMatch.matchFinalized()).to.be.false;

      // First withdrawal triggers finalization
      await worldCupMatch.connect(voter1).withdrawWinnings();

      // Now finalized
      expect(await worldCupMatch.matchFinalized()).to.be.true;
      expect(await worldCupMatch.winningTeam()).to.equal(0);
    });

    it("Should determine winner by total ETH (not vote count)", async function () {
      // Team 0: 2 votes, 0.0021 ETH total
      // Team 1: 1 vote, 0.001 ETH total
      // Winner should be team 0 (most ETH)

      // Trigger finalization via withdrawal
      await worldCupMatch.connect(voter1).withdrawWinnings();

      expect(await worldCupMatch.matchFinalized()).to.be.true;
      expect(await worldCupMatch.winningTeam()).to.equal(0);
    });

    it("Should handle tie correctly", async function () {
      // Deploy new match with equal votes
      const deployTime = await time.latest();
      const newMatch = await deployNewMatch("A", "B", deployTime, platform.address);

      // Equal ETH on both teams
      await newMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await newMatch.connect(voter2).vote(1, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      await time.increase(24 * 3600 + 1);

      // Trigger finalization via withdrawal
      await newMatch.connect(voter1).withdrawWinnings();

      expect(await newMatch.winningTeam()).to.equal(255); // Tie
    });

    it("Should emit MatchFinalized event on first withdrawal", async function () {
      // Team 0: 0.0021 ETH voted, 90% = 0.00189 prize pool
      // Team 1: 0.001 ETH voted, 90% = 0.0009 prize pool
      const team1PrizePool = parseEth("0.0021") - (parseEth("0.0021") * 1000n) / 10000n;
      const team2PrizePool = parseEth("0.001") - (parseEth("0.001") * 1000n) / 10000n;

      await expect(worldCupMatch.connect(voter1).withdrawWinnings())
        .to.emit(worldCupMatch, "MatchFinalized")
        .withArgs(0, team1PrizePool, team2PrizePool);
    });
  });

  describe("Payout Calculations (CRITICAL: Based on Vote Count)", function () {
    beforeEach(async function () {
      // Voter1: Buys 1 vote at 0.001 ETH
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      // Voter2: Buys 1 vote at 0.0011 ETH (more expensive, same votes)
      await worldCupMatch.connect(voter2).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0011") });

      // Voter3: Buys 2 votes at 0.0012 and 0.0013 ETH
      await worldCupMatch.connect(voter3).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0012") });
      await worldCupMatch.connect(voter3).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0013") });

      // Team 0: 4 votes total, 0.0046 ETH total
      // Voter1: 1 vote (0.001 ETH)
      // Voter2: 1 vote (0.0011 ETH)
      // Voter3: 2 votes (0.0025 ETH)

      await time.increase(24 * 3600 + 1);
      // Trigger auto-finalization via first withdrawal
      await worldCupMatch.connect(voter1).withdrawWinnings();
    });

    it("Should calculate winnings based on vote count, not ETH", async function () {
      // Total pool: 0.0046 ETH
      // Winner pool: 90% = 0.00414 ETH

      const voter1Winnings = await worldCupMatch.calculateWinnings(voter1.address);
      const voter2Winnings = await worldCupMatch.calculateWinnings(voter2.address);
      const voter3Winnings = await worldCupMatch.calculateWinnings(voter3.address);

      // Voter1: 1/4 of pool = 0.001035 ETH
      // Voter2: 1/4 of pool = 0.001035 ETH (same as voter1 despite paying more!)
      // Voter3: 2/4 of pool = 0.00207 ETH

      expect(voter1Winnings).to.equal((parseEth("0.00414") * 1n) / 4n);
      expect(voter2Winnings).to.equal((parseEth("0.00414") * 1n) / 4n);
      expect(voter3Winnings).to.equal((parseEth("0.00414") * 2n) / 4n);

      // Voter1 and Voter2 should get SAME payout despite different ETH spent
      expect(voter1Winnings).to.equal(voter2Winnings);
    });

    it("Should return zero winnings for losing team voters", async function () {
      // Add a losing team voter
      const deployTime = await time.latest();
      const newMatch = await deployNewMatch("A", "B", deployTime, platform.address);

      // Voter1 votes once for team 0: 0.001 ETH
      await newMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      // Voter2 votes twice for team 1: 0.001 + 0.0011 = 0.0021 ETH
      // Team 1 will have more ETH and win
      await newMatch.connect(voter2).vote(1, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await newMatch.connect(voter2).vote(1, 1, ethers.ZeroAddress, { value: parseEth("0.0011") });

      await time.increase(24 * 3600 + 1);
      // Trigger auto-finalization via withdrawal (voter2 is the winner)
      await newMatch.connect(voter2).withdrawWinnings();

      // Voter1 was on losing team (team 0), should get 0
      const loserWinnings = await newMatch.calculateWinnings(voter1.address);
      expect(loserWinnings).to.equal(0);
    });

    it("Should refund all voters in case of tie", async function () {
      const deployTime = await time.latest();
      const newMatch = await deployNewMatch("A", "B", deployTime, platform.address);

      await newMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await newMatch.connect(voter1).vote(1, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      await time.increase(24 * 3600 + 1);
      // Trigger auto-finalization via withdrawal
      await newMatch.connect(voter1).withdrawWinnings();

      const winnings = await newMatch.calculateWinnings(voter1.address);
      // In a tie, voters get back prize pool (90% of what they paid - platform fee already taken)
      const expectedRefund = parseEth("0.002") - (parseEth("0.002") * 1000n) / 10000n; // 0.0018 ETH
      expect(winnings).to.equal(expectedRefund);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Create winning scenario
      // Team 0 gets more votes/ETH and wins
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await worldCupMatch.connect(voter2).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0011") });
      // Team 1 gets less ETH
      await worldCupMatch.connect(voter3).vote(1, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      await time.increase(24 * 3600 + 1);
      // No need to finalize manually - will auto-finalize on first withdrawal
    });

    it("Should allow winners to withdraw", async function () {
      // First trigger finalization via voter2's withdrawal
      await worldCupMatch.connect(voter2).withdrawWinnings();

      // Now calculate voter1's winnings after finalization
      const winnings = await worldCupMatch.calculateWinnings(voter1.address);
      const balanceBefore = await ethers.provider.getBalance(voter1.address);

      const tx = await worldCupMatch.connect(voter1).withdrawWinnings();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(voter1.address);
      expect(balanceAfter).to.equal(balanceBefore + winnings - gasCost);
    });

    it("Should prevent double withdrawals", async function () {
      await worldCupMatch.connect(voter1).withdrawWinnings();
      await expect(worldCupMatch.connect(voter1).withdrawWinnings()).to.be.revertedWith(
        "Already withdrawn"
      );
    });

    it("Should revert withdrawal before voting ends", async function () {
      const newMatch = await deployNewMatch("A", "B", await time.latest(), platform.address);

      await newMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      // Try to withdraw before voting ends (auto-finalization will be blocked)
      await expect(newMatch.connect(voter1).withdrawWinnings()).to.be.revertedWith(
        "Voting not ended yet"
      );
    });

    it("Should revert withdrawal if no winnings", async function () {
      await expect(worldCupMatch.connect(voter3).withdrawWinnings()).to.be.revertedWith(
        "No winnings to withdraw"
      );
    });

    it("Should emit WinningsWithdrawn event", async function () {
      // First trigger finalization via voter2's withdrawal
      await worldCupMatch.connect(voter2).withdrawWinnings();

      // Now calculate voter1's winnings after finalization
      const winnings = await worldCupMatch.calculateWinnings(voter1.address);
      await expect(worldCupMatch.connect(voter1).withdrawWinnings())
        .to.emit(worldCupMatch, "WinningsWithdrawn")
        .withArgs(voter1.address, winnings, 1);
    });
  });

  describe("Platform Fee (Immediate Transfer)", function () {
    it("Should transfer 10% platform fee immediately on vote", async function () {
      const votePrice = parseEth("0.001");
      const expectedFee = (votePrice * 1000n) / 10000n; // 10% (1000 basis points)

      const platformBalanceBefore = await ethers.provider.getBalance(platform.address);
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: votePrice });
      const platformBalanceAfter = await ethers.provider.getBalance(platform.address);

      expect(platformBalanceAfter - platformBalanceBefore).to.equal(expectedFee);
    });

    it("Should track total platform fees collected", async function () {
      const votePrice1 = parseEth("0.001"); // First vote for team 0
      const votePrice2 = parseEth("0.001"); // First vote for team 1 (also 0.001 ETH)

      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: votePrice1 });
      await worldCupMatch.connect(voter2).vote(1, 1, ethers.ZeroAddress, { value: votePrice2 });

      const expectedTotalFee = (votePrice1 * 1000n) / 10000n + (votePrice2 * 1000n) / 10000n;
      expect(await worldCupMatch.totalPlatformFeesCollected()).to.equal(expectedTotalFee);
    });

    it("Should emit PlatformFeeTransferred event on each vote", async function () {
      const votePrice = parseEth("0.001");
      const expectedFee = (votePrice * 1000n) / 10000n;

      await expect(worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: votePrice }))
        .to.emit(worldCupMatch, "PlatformFeeTransferred")
        .withArgs(platform.address, expectedFee);
    });

    it("Should store only prize pool (90%) in contract", async function () {
      const votePrice = parseEth("0.001");
      const expectedPrizePool = votePrice - (votePrice * 1000n) / 10000n; // 90%

      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: votePrice });

      expect(await worldCupMatch.team1TotalETH()).to.equal(expectedPrizePool);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") }); // First vote team 0
      await worldCupMatch.connect(voter1).vote(1, 1, ethers.ZeroAddress, { value: parseEth("0.001") }); // First vote team 1
    });

    it("Should return correct match details", async function () {
      const details = await worldCupMatch.getMatchDetails();

      // ETH values are stored after 10% platform fee deduction (90% of original)
      const team1ETH = parseEth("0.001") - (parseEth("0.001") * 1000n) / 10000n;
      const team2ETH = parseEth("0.001") - (parseEth("0.001") * 1000n) / 10000n;

      expect(details._team1Name).to.equal("Brazil");
      expect(details._team2Name).to.equal("Argentina");
      expect(details._team1Votes).to.equal(1);
      expect(details._team2Votes).to.equal(1);
      expect(details._team1ETH).to.equal(team1ETH);
      expect(details._team2ETH).to.equal(team2ETH);
      expect(details._totalPrizePool).to.equal(team1ETH + team2ETH);
      expect(details._currentPhase).to.equal(1);
      expect(details._isFinalized).to.be.false;
    });

    it("Should return correct user vote stats", async function () {
      const stats = await worldCupMatch.getUserVoteStats(voter1.address);

      // ETH values are stored after 10% platform fee deduction (90% of original)
      const expectedETH = parseEth("0.001") - (parseEth("0.001") * 1000n) / 10000n;

      expect(stats.team1Votes).to.equal(1);
      expect(stats.team2Votes).to.equal(1);
      expect(stats.team1ETH).to.equal(expectedETH);
      expect(stats.team2ETH).to.equal(expectedETH);
      expect(stats.potentialWinnings).to.equal(0); // Not finalized yet
    });

    it("Should return voter count", async function () {
      expect(await worldCupMatch.getVoterCount()).to.equal(1);

      await worldCupMatch.connect(voter2).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0012") });
      expect(await worldCupMatch.getVoterCount()).to.equal(2);
    });

    it("Should return phase 1 details", async function () {
      const details = await worldCupMatch.getPhase1Details();
      expect(details.ended).to.be.false;
      expect(details.team1Votes).to.equal(0);
      expect(details.team2Votes).to.equal(0);
    });
  });

  describe("Early Voter Advantage (Real-world Scenario)", function () {
    it("Should demonstrate early voters get better returns", async function () {
      // Alice votes early: 1 vote at 0.001 ETH
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      // Bob votes later: 1 vote at 0.0011 ETH
      await worldCupMatch.connect(voter2).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0011") });

      // Charlie votes even later: 1 vote at 0.0012 ETH
      await worldCupMatch.connect(voter3).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0012") });

      // Total: 3 votes, 0.0033 ETH
      // Prize pool: 90% = 0.00297 ETH
      // Each voter gets: 0.00297 / 3 = 0.00099 ETH

      await time.increase(24 * 3600 + 1);
      // Trigger auto-finalization via withdrawal
      await worldCupMatch.connect(voter1).withdrawWinnings();

      const aliceWinnings = await worldCupMatch.calculateWinnings(voter1.address);
      const bobWinnings = await worldCupMatch.calculateWinnings(voter2.address);
      const charlieWinnings = await worldCupMatch.calculateWinnings(voter3.address);

      // All get same payout (vote count basis)
      expect(aliceWinnings).to.equal(bobWinnings);
      expect(bobWinnings).to.equal(charlieWinnings);

      // Alice's ROI: (0.00099 / 0.001) = 0.99 (losing 10% to fee)
      // Bob's ROI: (0.00099 / 0.0011) = 0.9 (worse than Alice)
      // Charlie's ROI: (0.00099 / 0.0012) = 0.825 (worst)

      // Early voter advantage confirmed!
      const aliceROI = (aliceWinnings * 1000n) / parseEth("0.001");
      const bobROI = (bobWinnings * 1000n) / parseEth("0.0011");
      const charlieROI = (charlieWinnings * 1000n) / parseEth("0.0012");

      expect(aliceROI).to.be.greaterThan(bobROI);
      expect(bobROI).to.be.greaterThan(charlieROI);
    });
  });

  describe("Withdrawal Deadline & Sweep", function () {
    beforeEach(async function () {
      // Create a match with votes, team 0 wins (more ETH on team 0)
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await worldCupMatch.connect(voter1).vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.0011") });
      await worldCupMatch.connect(voter2).vote(1, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      // Fast forward past voting end
      await time.increase(24 * 3600 + 1);
    });

    it("Should allow withdrawal before deadline", async function () {
      await worldCupMatch.connect(voter1).withdrawWinnings();
      expect(await worldCupMatch.hasWithdrawn(voter1.address)).to.be.true;
    });

    it("Should reject withdrawal after 90-day deadline", async function () {
      // Fast forward 90 days + 1 second past votingEndTime
      await time.increase(90 * 24 * 3600);

      await expect(
        worldCupMatch.connect(voter1).withdrawWinnings()
      ).to.be.revertedWith("Claim period expired");
    });

    it("Should allow owner to sweep after deadline", async function () {
      // Fast forward 90 days past votingEndTime
      await time.increase(90 * 24 * 3600);

      const contractBalance = await ethers.provider.getBalance(await worldCupMatch.getAddress());
      expect(contractBalance).to.be.greaterThan(0);

      const platformBalanceBefore = await ethers.provider.getBalance(platform.address);
      await worldCupMatch.connect(owner).sweepUnclaimed();
      const platformBalanceAfter = await ethers.provider.getBalance(platform.address);

      expect(platformBalanceAfter - platformBalanceBefore).to.equal(contractBalance);
      expect(await ethers.provider.getBalance(await worldCupMatch.getAddress())).to.equal(0);
    });

    it("Should reject sweep before deadline", async function () {
      await expect(
        worldCupMatch.connect(owner).sweepUnclaimed()
      ).to.be.revertedWith("Claim period not expired");
    });

    it("Should reject sweep by non-owner", async function () {
      await time.increase(90 * 24 * 3600);
      await expect(
        worldCupMatch.connect(voter1).sweepUnclaimed()
      ).to.be.revertedWithCustomError(worldCupMatch, "OwnableUnauthorizedAccount");
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy on withdrawWinnings", async function () {
      const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
      const attacker = await ReentrancyAttacker.deploy(await worldCupMatch.getAddress());
      await attacker.waitForDeployment();

      const attackerAddress = await attacker.getAddress();

      // Attacker votes for team 0
      await attacker.attack_vote(0, 1, ethers.ZeroAddress, { value: parseEth("0.01") });

      // Another voter votes for team 1 with less ETH so team 0 wins
      await worldCupMatch.connect(voter1).vote(1, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      // Fast forward past voting end
      await time.increase(24 * 3600 + 1);

      // Attacker tries to re-enter during withdrawal — should revert
      await expect(attacker.attack_withdraw()).to.be.reverted;
    });
  });
});
