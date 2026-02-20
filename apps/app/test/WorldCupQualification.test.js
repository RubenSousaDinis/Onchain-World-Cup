const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("WorldCupQualification", function () {
  let qualification;
  let owner, platform, voter1, voter2, voter3;
  let qualificationStartTime, qualificationEndTime;

  // Helper to parse ether amounts
  const parseEth = (amount) => ethers.parseEther(amount.toString());
  const formatEth = (amount) => ethers.formatEther(amount);

  // Helper to convert string to bytes8
  const toBytes8 = (str) => {
    const bytes = ethers.toUtf8Bytes(str);
    // Convert to hex and pad to exactly 8 bytes (16 hex chars)
    const hex = Buffer.from(bytes).toString("hex");
    return "0x" + hex.padEnd(16, "0");
  };

  // Test countries
  const US = toBytes8("US");
  const BR = toBytes8("BR");
  const AR = toBytes8("AR");
  const FR = toBytes8("FR");
  const DE = toBytes8("DE");
  const IT = toBytes8("IT");
  const ES = toBytes8("ES");
  const NL = toBytes8("NL");
  const GB_ENG = toBytes8("GB-ENG"); // Test longer country code

  // Helper: generate N unique country bytes8 codes
  const generateCountries = (n) => {
    const countries = [];
    for (let i = 0; i < n; i++) {
      const c1 = String.fromCharCode(65 + (i % 26));
      const c2 = String.fromCharCode(65 + Math.floor(i / 26));
      countries.push(toBytes8(c1 + c2));
    }
    return countries;
  };

  beforeEach(async function () {
    [owner, platform, voter1, voter2, voter3] = await ethers.getSigners();

    const currentTime = await time.latest();
    qualificationStartTime = currentTime + 60; // Start in 1 minute
    qualificationEndTime = qualificationStartTime + 7 * 24 * 3600; // 7 days after start

    // Initial countries for testing
    const initialCountries = [US, BR, AR, FR, DE, IT, ES, NL, GB_ENG];

    const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
    qualification = await WorldCupQualification.deploy(
      qualificationStartTime,
      qualificationEndTime,
      platform.address,
      initialCountries,
      1000 // Initial platform fee: 10% (1000 basis points)
    );

    await qualification.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct qualification start time", async function () {
      expect(await qualification.qualificationStartTime()).to.equal(qualificationStartTime);
    });

    it("Should set the correct qualification end time", async function () {
      expect(await qualification.qualificationEndTime()).to.equal(qualificationEndTime);
    });

    it("Should set the correct fee recipient", async function () {
      expect(await qualification.feeRecipient()).to.equal(platform.address);
    });

    it("Should initialize with zero prize pool", async function () {
      expect(await qualification.totalPrizePool()).to.equal(0);
    });

    it("Should not be finalized initially", async function () {
      expect(await qualification.qualificationFinalized()).to.be.false;
    });

    it("Should have correct constants", async function () {
      expect(await qualification.BASE_PRICE()).to.equal(parseEth("0.001"));
      expect(await qualification.PRICE_INCREMENT()).to.equal(parseEth("0.0005"));
      expect(await qualification.MAX_PLATFORM_FEE_BPS()).to.equal(2000); // Max 20%
      expect(await qualification.QUALIFICATION_SPOTS()).to.equal(48);
    });

    it("Should initialize valid countries", async function () {
      expect(await qualification.validCountry(US)).to.be.true;
      expect(await qualification.validCountry(BR)).to.be.true;
      expect(await qualification.validCountry(AR)).to.be.true;
    });

    it("Should revert with start time in the past", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const pastTime = currentTime - 1000;
      const futureTime = currentTime + 10000;

      await expect(
        WorldCupQualification.deploy(pastTime, futureTime, platform.address, [US], 1000)
      ).to.be.revertedWith("Start time must be in future");
    });

    it("Should revert with end time before start time", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 10000;
      const endTime = currentTime + 5000; // Before start time

      await expect(
        WorldCupQualification.deploy(startTime, endTime, platform.address, [US], 1000)
      ).to.be.revertedWith("End time must be after start time");
    });

    it("Should revert with zero fee recipient", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = startTime + 10000;

      await expect(
        WorldCupQualification.deploy(startTime, endTime, ethers.ZeroAddress, [US], 1000)
      ).to.be.revertedWith("Invalid fee recipient");
    });

    it("Should revert with fee too high", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = startTime + 10000;

      await expect(
        WorldCupQualification.deploy(startTime, endTime, platform.address, [US], 2001)
      ).to.be.revertedWith("Fee too high");
    });
  });

  describe("Admin Functions", function () {
    beforeEach(async function () {
      // Fast forward to qualification start time for voting tests
      await time.increaseTo(qualificationStartTime);
    });

    it("Should allow owner to add a new country", async function () {
      const GB = toBytes8("GB");
      expect(await qualification.validCountry(GB)).to.be.false;

      await expect(qualification.connect(owner).addCountry(GB))
        .to.emit(qualification, "CountryAdded")
        .withArgs(GB);

      expect(await qualification.validCountry(GB)).to.be.true;
    });

    it("Should allow owner to add multiple countries", async function () {
      const GB = toBytes8("GB");
      const JP = toBytes8("JP");
      const CN = toBytes8("CN");

      await qualification.connect(owner).addCountries([GB, JP, CN]);

      expect(await qualification.validCountry(GB)).to.be.true;
      expect(await qualification.validCountry(JP)).to.be.true;
      expect(await qualification.validCountry(CN)).to.be.true;
    });

    it("Should revert if non-owner tries to add country", async function () {
      const GB = toBytes8("GB");
      await expect(
        qualification.connect(voter1).addCountry(GB)
      ).to.be.revertedWithCustomError(qualification, "OwnableUnauthorizedAccount");
    });

    it("Should revert if trying to add duplicate country", async function () {
      await expect(
        qualification.connect(owner).addCountry(US)
      ).to.be.revertedWith("Country already exists");
    });

    it("Should revert if trying to add country after qualification ends", async function () {
      await time.increase(7 * 24 * 3600 + 1);
      const GB = toBytes8("GB");
      
      await expect(
        qualification.connect(owner).addCountry(GB)
      ).to.be.revertedWith("Qualification ended");
    });

    it("Should allow owner to remove country with no votes", async function () {
      const GB = toBytes8("GB");
      await qualification.connect(owner).addCountry(GB);
      
      await expect(qualification.connect(owner).removeCountry(GB))
        .to.emit(qualification, "CountryRemoved")
        .withArgs(GB);

      expect(await qualification.validCountry(GB)).to.be.false;
    });

    it("Should revert if trying to remove country with votes", async function () {
      await qualification.connect(voter1).vote(US, 1, { value: parseEth("0.001") });
      
      await expect(
        qualification.connect(owner).removeCountry(US)
      ).to.be.revertedWith("Country has votes");
    });

    it("Should revert if non-owner tries to remove country", async function () {
      const GB = toBytes8("GB");
      await qualification.connect(owner).addCountry(GB);
      
      await expect(
        qualification.connect(voter1).removeCountry(GB)
      ).to.be.revertedWithCustomError(qualification, "OwnableUnauthorizedAccount");
    });

    it("Should revert if trying to remove country after qualification ends", async function () {
      const GB = toBytes8("GB");
      await qualification.connect(owner).addCountry(GB);
      
      await time.increase(7 * 24 * 3600 + 1);
      
      await expect(
        qualification.connect(owner).removeCountry(GB)
      ).to.be.revertedWith("Qualification ended");
    });

    it("Should allow owner to update platform fee during qualification", async function () {
      expect(await qualification.platformFeeBps()).to.equal(1000); // Initial 10%
      
      await expect(qualification.connect(owner).setPlatformFee(500))
        .to.emit(qualification, "PlatformFeeUpdated")
        .withArgs(1000, 500);
      
      expect(await qualification.platformFeeBps()).to.equal(500); // Now 5%
    });

    it("Should allow owner to set platform fee to 0 (100% discount)", async function () {
      await qualification.connect(owner).setPlatformFee(0);
      expect(await qualification.platformFeeBps()).to.equal(0);
    });

    it("Should revert if fee exceeds maximum", async function () {
      await expect(
        qualification.connect(owner).setPlatformFee(2001)
      ).to.be.revertedWith("Fee too high");
    });

    it("Should revert if non-owner tries to update fee", async function () {
      await expect(
        qualification.connect(voter1).setPlatformFee(500)
      ).to.be.revertedWithCustomError(qualification, "OwnableUnauthorizedAccount");
    });

    it("Should revert if trying to update fee after qualification ends", async function () {
      await time.increase(7 * 24 * 3600 + 1);
      
      await expect(
        qualification.connect(owner).setPlatformFee(500)
      ).to.be.revertedWith("Qualification ended");
    });

    it("Should revert if trying to update fee after finalization", async function () {
      // Create a fresh contract for this test
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 2000;

      // Create 48 unique countries
      const countries48 = [];
      for (let i = 0; i < 48; i++) {
        const c1 = String.fromCharCode(65 + (i % 26));
        const c2 = String.fromCharCode(65 + Math.floor(i / 26));
        countries48.push(toBytes8(c1 + c2));
      }

      const testQual = await WorldCupQualification.deploy(
        startTime,
        endTime,
        platform.address,
        countries48,
        1000
      );
      await testQual.waitForDeployment();

      // Fast forward to start time and add votes to all 48 countries
      await time.increaseTo(startTime);
      for (const c of countries48) {
        await testQual.connect(voter1).vote(c, 1, { value: parseEth("0.001") });
      }
      await time.increase(2001);

      await testQual.connect(owner).finalizeQualification(countries48);

      // The modifier checks time first, so it will revert with "Qualification ended"
      await expect(
        testQual.connect(owner).setPlatformFee(500)
      ).to.be.revertedWith("Qualification ended");
    });

    it("Should apply updated fee to new votes", async function () {
      // Set fee to 5%
      await qualification.connect(owner).setPlatformFee(500);
      
      const votePrice = parseEth("0.001");
      await qualification.connect(voter1).vote(US, 1, { value: votePrice });
      
      // Fee should be 5% now
      const expectedFee = (votePrice * 500n) / 10000n;
      expect(await qualification.totalPlatformFeesCollected()).to.equal(expectedFee);
      
      // Prize pool should be 95%
      const expectedPrizePool = votePrice - expectedFee;
      expect(await qualification.totalPrizePool()).to.equal(expectedPrizePool);
    });
  });

  describe("Linear Pricing", function () {
    beforeEach(async function () {
      // Fast forward to qualification start time
      await time.increaseTo(qualificationStartTime);
    });

    it("Should calculate correct first vote price (0.001 ETH)", async function () {
      const price = await qualification.votePrice(US);
      expect(price).to.equal(parseEth("0.001"));
    });

    it("Should increase price linearly by 0.0005 ETH per vote", async function () {
      // First vote: 0.001 ETH
      await qualification.connect(voter1).vote(US, 1, { value: parseEth("0.001") });
      expect(await qualification.votePrice(US)).to.equal(parseEth("0.0015"));

      // Second vote: 0.0015 ETH
      await qualification.connect(voter1).vote(US, 1, { value: parseEth("0.0015") });
      expect(await qualification.votePrice(US)).to.equal(parseEth("0.002"));

      // Third vote: 0.002 ETH
      await qualification.connect(voter1).vote(US, 1, { value: parseEth("0.002") });
      expect(await qualification.votePrice(US)).to.equal(parseEth("0.0025"));
    });

    it("Should calculate correct price for multiple votes in one transaction", async function () {
      // Calculate price for 3 votes
      const price = await qualification.calculateVoteCost(US, 3);
      // 0.001 + 0.0015 + 0.002 = 0.0045 ETH
      const expected = parseEth("0.001") + parseEth("0.0015") + parseEth("0.002");
      expect(price).to.equal(expected);
    });

    it("Should track vote count correctly after 10 votes", async function () {
      for (let i = 0; i < 10; i++) {
        const price = await qualification.votePrice(US);
        await qualification.connect(voter1).vote(US, 1, { value: price });
      }

      expect(await qualification.countryVotes(US)).to.equal(10);
      expect(await qualification.userVotes(voter1.address, US)).to.equal(10);

      // Price should be 0.001 + (10 * 0.0005) = 0.006 ETH
      const nextPrice = await qualification.votePrice(US);
      expect(nextPrice).to.equal(parseEth("0.006"));
    });

    it("Should track ETH per country", async function () {
      await qualification.connect(voter1).vote(US, 1, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(US, 1, { value: parseEth("0.0015") });

      expect(await qualification.ethForCountry(US)).to.equal(parseEth("0.0025"));
      expect(await qualification.countryETH(US)).to.equal(parseEth("0.0025"));
    });

    it("Should allow different voters on different countries", async function () {
      await qualification.connect(voter1).vote(US, 1, { value: parseEth("0.001") });
      await qualification.connect(voter2).vote(BR, 1, { value: parseEth("0.001") });
      await qualification.connect(voter3).vote(AR, 1, { value: parseEth("0.001") });

      expect(await qualification.countryVotes(US)).to.equal(1);
      expect(await qualification.countryVotes(BR)).to.equal(1);
      expect(await qualification.countryVotes(AR)).to.equal(1);
      expect(await qualification.userVotes(voter1.address, US)).to.equal(1);
      expect(await qualification.userVotes(voter2.address, BR)).to.equal(1);
      expect(await qualification.userVotes(voter3.address, AR)).to.equal(1);
    });

    it("Should refund overpayment", async function () {
      const price = await qualification.votePrice(US);
      const overpayment = parseEth("0.01"); // Send 10x the required amount

      const balanceBefore = await ethers.provider.getBalance(voter1.address);
      const tx = await qualification.connect(voter1).vote(US, 1, { value: overpayment });
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(voter1.address);

      // Should only charge the exact price + gas
      const expectedBalance = balanceBefore - price - gasCost;
      expect(balanceAfter).to.equal(expectedBalance);
    });

    it("Should emit VotePlaced event with correct data", async function () {
      const price = parseEth("0.001");
      
      const tx = await qualification.connect(voter1).vote(US, 1, { value: price });
      const receipt = await tx.wait();
      
      // Find the VotePlaced event
      const eventFilter = qualification.filters.VotePlaced(voter1.address, US);
      const events = await qualification.queryFilter(eventFilter, receipt.blockNumber, receipt.blockNumber);
      
      expect(events.length).to.equal(1);
      const event = events[0];
      expect(event.args.voter).to.equal(voter1.address);
      expect(event.args.country).to.equal(US);
      expect(event.args.votes).to.equal(1);
      expect(event.args.cost).to.equal(price);
      // Timestamp should be approximately current time (within 10 seconds)
      const currentTime = await time.latest();
      expect(Number(event.args.timestamp)).to.be.closeTo(currentTime, 10);
    });

    it("Should revert if insufficient payment", async function () {
      await expect(
        qualification.connect(voter1).vote(US, 1, { value: parseEth("0.0009") })
      ).to.be.revertedWith("Insufficient ETH");
    });

    it("Should revert for invalid country", async function () {
      const invalidCountry = toBytes8("XX");
      await expect(
        qualification.connect(voter1).vote(invalidCountry, 1, { value: parseEth("0.001") })
      ).to.be.revertedWith("Invalid country");
    });

    it("Should revert for zero vote count", async function () {
      await expect(
        qualification.connect(voter1).vote(US, 0, { value: parseEth("0.001") })
      ).to.be.revertedWith("Invalid vote count");
    });

    it("Should revert for vote count exceeding max", async function () {
      await expect(
        qualification.connect(voter1).vote(US, 101, { value: parseEth("10") })
      ).to.be.revertedWith("Invalid vote count");
    });
  });

  describe("Platform Fee", function () {
    beforeEach(async function () {
      await time.increaseTo(qualificationStartTime);
    });

    it("Should transfer 10% platform fee immediately on vote", async function () {
      const votePrice = parseEth("0.001");
      const expectedFee = (votePrice * 1000n) / 10000n; // 10%

      const platformBalanceBefore = await ethers.provider.getBalance(platform.address);
      await qualification.connect(voter1).vote(US, 1, { value: votePrice });
      const platformBalanceAfter = await ethers.provider.getBalance(platform.address);

      expect(platformBalanceAfter - platformBalanceBefore).to.equal(expectedFee);
    });

    it("Should track total platform fees collected", async function () {
      const votePrice1 = parseEth("0.001");
      const votePrice2 = parseEth("0.001");

      await qualification.connect(voter1).vote(US, 1, { value: votePrice1 });
      await qualification.connect(voter2).vote(BR, 1, { value: votePrice2 });

      const expectedTotalFee = (votePrice1 * 1000n) / 10000n + (votePrice2 * 1000n) / 10000n;
      expect(await qualification.totalPlatformFeesCollected()).to.equal(expectedTotalFee);
    });

    it("Should store only prize pool (90%) in contract", async function () {
      const votePrice = parseEth("0.001");
      const expectedPrizePool = votePrice - (votePrice * 1000n) / 10000n; // 90%

      await qualification.connect(voter1).vote(US, 1, { value: votePrice });

      expect(await qualification.totalPrizePool()).to.equal(expectedPrizePool);
    });

    it("Should emit PlatformFeeTransferred event on each vote", async function () {
      const votePrice = parseEth("0.001");
      const expectedFee = (votePrice * 1000n) / 10000n;

      await expect(qualification.connect(voter1).vote(US, 1, { value: votePrice }))
        .to.emit(qualification, "PlatformFeeTransferred")
        .withArgs(platform.address, expectedFee);
    });
  });

  describe("Qualification Finalization", function () {
    beforeEach(async function () {
      // Fast forward to qualification start time
      await time.increaseTo(qualificationStartTime);

      // Add more countries before period ends (we need 48 total for finalization)
      const additionalCountries = [];
      for (let i = 9; i < 48; i++) { // Start from 9 since we now have 9 initial countries (including GB_ENG)
        const countryCode = String.fromCharCode(65 + (i % 26)) + String.fromCharCode(65 + ((Math.floor(i / 26)) % 26));
        const countryBytes = toBytes8(countryCode);
        additionalCountries.push(countryBytes);
      }
      await qualification.connect(owner).addCountries(additionalCountries);

      // Create votes for multiple countries
      // US: 5 votes
      for (let i = 0; i < 5; i++) {
        const price = await qualification.votePrice(US);
        await qualification.connect(voter1).vote(US, 1, { value: price });
      }

      // BR: 3 votes
      for (let i = 0; i < 3; i++) {
        const price = await qualification.votePrice(BR);
        await qualification.connect(voter2).vote(BR, 1, { value: price });
      }

      // AR: 4 votes
      for (let i = 0; i < 4; i++) {
        const price = await qualification.votePrice(AR);
        await qualification.connect(voter3).vote(AR, 1, { value: price });
      }

      // Add votes to other countries for finalization tests
      await qualification.connect(voter1).vote(FR, 1, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(DE, 1, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(IT, 1, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(ES, 1, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(NL, 1, { value: parseEth("0.001") });

      // Fast forward past qualification end time
      await time.increase(7 * 24 * 3600 + 1);
    });

    it("Should revert finalization before end time", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;
      const newQual = await WorldCupQualification.deploy(
        startTime,
        endTime,
        platform.address,
        [US, BR, AR],
        1000
      );
      await newQual.waitForDeployment();

      await expect(
        newQual.finalizeQualification([US, BR, AR])
      ).to.be.revertedWith("Qualification not ended");
    });

    it("Should finalize qualification with specified countries", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;

      // Generate 48 unique countries
      const countries48 = generateCountries(48);

      const testQual = await WorldCupQualification.deploy(
        startTime,
        endTime,
        platform.address,
        countries48,
        1000
      );
      await testQual.waitForDeployment();

      await time.increaseTo(startTime);

      // Vote for all 48 countries (required: each must have votes)
      for (const c of countries48) {
        await testQual.connect(voter1).vote(c, 1, { value: parseEth("0.001") });
      }

      await time.increase(1001);

      await expect(testQual.connect(owner).finalizeQualification(countries48))
        .to.emit(testQual, "QualificationEnded")
        .to.emit(testQual, "QualificationFinalized")
        .to.emit(testQual, "PrizesDistributed");

      expect(await testQual.qualificationFinalized()).to.be.true;
      expect(await testQual.isQualified(countries48[0])).to.be.true;
      expect(await testQual.isQualified(countries48[47])).to.be.true;
    });

    it("Should revert if trying to qualify country with no votes (CRITICAL TRUST GUARANTEE)", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;

      const countries48 = generateCountries(48);

      const testQual = await WorldCupQualification.deploy(
        startTime,
        endTime,
        platform.address,
        countries48,
        1000
      );
      await testQual.waitForDeployment();

      await time.increaseTo(startTime);

      // Only vote for the first country
      await testQual.connect(voter1).vote(countries48[0], 1, { value: parseEth("0.001") });

      await time.increase(1001);

      // Try to finalize with all 48 — second country has no votes
      await expect(
        testQual.connect(owner).finalizeQualification(countries48)
      ).to.be.revertedWith("Country has no votes");
    });

    it("Should revert if not owner tries to finalize", async function () {
      await expect(
        qualification.connect(voter1).finalizeQualification([US, BR, AR])
      ).to.be.revertedWithCustomError(qualification, "OwnableUnauthorizedAccount");
    });

    it("Should prevent voting after finalization", async function () {
      // Create a fresh contract for this test
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 2000;
      const testQual = await WorldCupQualification.deploy(
        startTime,
        endTime,
        platform.address,
        [US, BR, AR, FR, DE, IT, ES, NL],
        1000
      );
      await testQual.waitForDeployment();

      // Fast forward to start time
      await time.increaseTo(startTime);

      // Add more countries to reach 48
      const additionalCountries = [];
      for (let i = 8; i < 48; i++) {
        const countryCode = String.fromCharCode(65 + (i % 26)) + String.fromCharCode(65 + ((Math.floor(i / 26)) % 26));
        const countryBytes = toBytes8(countryCode);
        additionalCountries.push(countryBytes);
      }
      await testQual.connect(owner).addCountries(additionalCountries);

      // Add votes to all countries before finalization (required for trust guarantee)
      const countriesToVote = [US, BR, AR, FR, DE, IT, ES, NL, ...additionalCountries];
      for (let i = 0; i < countriesToVote.length; i++) {
        await testQual.connect(voter1).vote(countriesToVote[i], 1, { value: parseEth("0.001") });
      }

      // Fast forward past end time
      await time.increase(2001);

      // Verify that finalization sets the flag correctly
      const all48Countries = [US, BR, AR, FR, DE, IT, ES, NL, ...additionalCountries];

      await testQual.connect(owner).finalizeQualification(all48Countries);

      // Verify finalization happened
      expect(await testQual.qualificationFinalized()).to.be.true;

      // Voting is prevented after period ends (checked first in modifier)
      // Finalization provides an additional check for safety
      await expect(
        testQual.connect(voter1).vote(US, 1, { value: parseEth("0.001") })
      ).to.be.revertedWith("Qualification ended");
    });

    it("Should prevent double finalization", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 2000;

      const countries48 = generateCountries(48);

      const testQual = await WorldCupQualification.deploy(
        startTime,
        endTime,
        platform.address,
        countries48,
        1000
      );
      await testQual.waitForDeployment();

      await time.increaseTo(startTime);

      // Vote for all 48 countries
      for (const c of countries48) {
        await testQual.connect(voter1).vote(c, 1, { value: parseEth("0.001") });
      }

      await time.increase(2001);

      await testQual.connect(owner).finalizeQualification(countries48);
      expect(await testQual.qualificationFinalized()).to.be.true;

      // Try to finalize again
      await expect(
        testQual.connect(owner).finalizeQualification(countries48)
      ).to.be.revertedWith("Already finalized");
    });
  });

  describe("Winnings Calculation and Claiming", function () {
    let winningsCountries48;

    beforeEach(async function () {
      // Deploy a fresh contract with 48 unique countries including US, AR, BR
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 7 * 24 * 3600 + 60;

      // Build 48 unique countries, ensuring US, BR, AR are included
      winningsCountries48 = [US, BR, AR];
      let idx = 0;
      while (winningsCountries48.length < 48) {
        const c = toBytes8("Z" + String.fromCharCode(65 + (idx % 26)) + String.fromCharCode(65 + Math.floor(idx / 26)));
        if (!winningsCountries48.includes(c)) {
          winningsCountries48.push(c);
        }
        idx++;
      }

      qualification = await WorldCupQualification.deploy(
        startTime,
        endTime,
        platform.address,
        winningsCountries48,
        1000
      );
      await qualification.waitForDeployment();

      await time.increaseTo(startTime);

      // voter1 votes for US (5 votes)
      for (let i = 0; i < 5; i++) {
        const price = await qualification.votePrice(US);
        await qualification.connect(voter1).vote(US, 1, { value: price });
      }

      // voter2 votes for AR (4 votes)
      for (let i = 0; i < 4; i++) {
        const price = await qualification.votePrice(AR);
        await qualification.connect(voter2).vote(AR, 1, { value: price });
      }

      // voter3 votes for BR (3 votes)
      for (let i = 0; i < 3; i++) {
        const price = await qualification.votePrice(BR);
        await qualification.connect(voter3).vote(BR, 1, { value: price });
      }

      // Vote for remaining countries (1 vote each so they can qualify)
      for (const c of winningsCountries48) {
        if (c !== US && c !== BR && c !== AR) {
          await qualification.connect(voter1).vote(c, 1, { value: parseEth("0.001") });
        }
      }

      // Fast forward and finalize
      await time.increase(7 * 24 * 3600 + 1);
      await qualification.connect(owner).finalizeQualification(winningsCountries48);
    });

    it("Should calculate winnings using unified pool formula", async function () {
      // voter1 has 5 votes for US + 45 votes for filler countries = 50 qualified votes
      // voter2 has 4 votes for AR
      // voter3 has 3 votes for BR
      // Total qualified votes = 50 + 4 + 3 = 57 (plus 45 filler = counted once each)

      const totalQualifiedVotes = await qualification.totalQualifiedVotes();
      const totalPrizePool = await qualification.totalPrizePool();

      // Calculate voter1's total qualified votes across all countries
      const [countries, votes] = await qualification.getUserVotes(voter1.address);
      let voter1QualifiedVotes = 0n;
      for (let i = 0; i < countries.length; i++) {
        voter1QualifiedVotes += votes[i];
      }

      const expectedWinnings = (voter1QualifiedVotes * totalPrizePool) / totalQualifiedVotes;
      const actualWinnings = await qualification.claimable(voter1.address);

      expect(actualWinnings).to.equal(expectedWinnings);
    });

    it("Should return zero winnings for non-qualified country voters", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;

      // 48 unique countries; BR is NOT included so voter2 loses
      const countries48 = generateCountries(48);

      const testQual = await WorldCupQualification.deploy(
        startTime,
        endTime,
        platform.address,
        [...countries48, BR], // add BR as valid but won't be in qualified list
        1000
      );
      await testQual.waitForDeployment();

      await time.increaseTo(startTime);

      // Vote for all 48 qualifying countries
      for (const c of countries48) {
        await testQual.connect(voter1).vote(c, 1, { value: parseEth("0.001") });
      }
      // voter2 only votes for BR (not in qualified list)
      await testQual.connect(voter2).vote(BR, 1, { value: parseEth("0.001") });

      await time.increase(1001);
      await testQual.connect(owner).finalizeQualification(countries48);

      // voter2 should get 0 winnings (BR didn't qualify)
      expect(await testQual.claimable(voter2.address)).to.equal(0);
    });

    it("Should allow winners to claim", async function () {
      const winnings = await qualification.claimable(voter1.address);
      const balanceBefore = await ethers.provider.getBalance(voter1.address);

      const tx = await qualification.connect(voter1).claim();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(voter1.address);
      expect(balanceAfter).to.equal(balanceBefore + winnings - gasCost);
    });

    it("Should prevent double claims", async function () {
      await qualification.connect(voter1).claim();
      
      await expect(
        qualification.connect(voter1).claim()
      ).to.be.revertedWith("Already claimed");
    });

    it("Should revert claim before finalization", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;
      const newQual = await WorldCupQualification.deploy(
        startTime,
        endTime,
        platform.address,
        [US],
        1000
      );
      await newQual.waitForDeployment();

      await time.increaseTo(startTime);
      await newQual.connect(voter1).vote(US, 1, { value: parseEth("0.001") });

      await expect(
        newQual.connect(voter1).claim()
      ).to.be.revertedWith("Not finalized");
    });

    it("Should revert claim if no winnings", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;

      const countries48 = generateCountries(48);

      const testQual = await WorldCupQualification.deploy(
        startTime,
        endTime,
        platform.address,
        [...countries48, BR], // BR valid but not qualified
        1000
      );
      await testQual.waitForDeployment();

      await time.increaseTo(startTime);

      for (const c of countries48) {
        await testQual.connect(voter1).vote(c, 1, { value: parseEth("0.001") });
      }
      await testQual.connect(voter2).vote(BR, 1, { value: parseEth("0.001") });

      await time.increase(1001);
      await testQual.connect(owner).finalizeQualification(countries48);

      await expect(
        testQual.connect(voter2).claim()
      ).to.be.revertedWith("Nothing to claim");
    });

    it("Should emit WinningsClaimed event", async function () {
      const winnings = await qualification.claimable(voter1.address);
      
      await expect(qualification.connect(voter1).claim())
        .to.emit(qualification, "WinningsClaimed")
        .withArgs(voter1.address, winnings);
    });
  });

  describe("Read-Only Metrics", function () {
    beforeEach(async function () {
      await time.increaseTo(qualificationStartTime);

      const usPrice2 = await qualification.calculateVoteCost(US, 2);
      await qualification.connect(voter1).vote(US, 2, { value: usPrice2 });
      await qualification.connect(voter1).vote(BR, 1, { value: parseEth("0.001") });
      await qualification.connect(voter2).vote(AR, 1, { value: parseEth("0.001") });
    });

    it("Should return ETH per country", async function () {
      expect(await qualification.ethForCountry(US)).to.equal(parseEth("0.0025"));
      expect(await qualification.ethForCountry(BR)).to.equal(parseEth("0.001"));
      expect(await qualification.ethForCountry(AR)).to.equal(parseEth("0.001"));
    });

    it("Should return total prize pool via public getter", async function () {
      const prizePool = await qualification.totalPrizePool();
      expect(prizePool).to.be.greaterThan(0);
      const totalETH = parseEth("0.0025") + parseEth("0.001") + parseEth("0.001");
      const expectedPrizePool = totalETH - (totalETH * 1000n) / 10000n;
      expect(prizePool).to.equal(expectedPrizePool);
    });

    it("Should return platform fee amount via public getter", async function () {
      const fees = await qualification.totalPlatformFeesCollected();
      expect(fees).to.be.greaterThan(0);
      const totalETH = parseEth("0.0025") + parseEth("0.001") + parseEth("0.001");
      const expectedFees = (totalETH * 1000n) / 10000n;
      expect(fees).to.equal(expectedFees);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Fast forward to qualification start time
      await time.increaseTo(qualificationStartTime);

      // Calculate correct prices for 2 votes: 0.001 + 0.0015 = 0.0025
      const usPrice2 = await qualification.calculateVoteCost(US, 2);
      await qualification.connect(voter1).vote(US, 2, { value: usPrice2 }); // 2 votes
      await qualification.connect(voter1).vote(BR, 1, { value: parseEth("0.001") }); // 1 vote
      await qualification.connect(voter2).vote(AR, 1, { value: parseEth("0.001") }); // 1 vote
    });

    it("Should return correct qualification details", async function () {
      const details = await qualification.getQualificationDetails();

      expect(details._qualificationEndTime).to.equal(qualificationEndTime);
      expect(details._qualificationSpots).to.equal(48);
      expect(details._isFinalized).to.be.false;
      expect(details._totalPrizePool).to.be.greaterThan(0);
    });

    it("Should return user votes correctly", async function () {
      const [countries, votes] = await qualification.getUserVotes(voter1.address);

      expect(countries.length).to.equal(2);
      expect(votes.length).to.equal(2);
      
      // Check that US has 2 votes and BR has 1 vote
      const usIndex = countries.findIndex(c => c === US);
      const brIndex = countries.findIndex(c => c === BR);
      expect(votes[usIndex]).to.equal(2);
      expect(votes[brIndex]).to.equal(1);
    });

    it("Should return empty arrays for user with no votes", async function () {
      const [countries, votes] = await qualification.getUserVotes(voter3.address);

      expect(countries.length).to.equal(0);
      expect(votes.length).to.equal(0);
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      // Fast forward to qualification start time
      await time.increaseTo(qualificationStartTime);
    });

    it("Should handle voting after qualification period ends", async function () {
      await time.increase(7 * 24 * 3600 + 1);

      await expect(
        qualification.connect(voter1).vote(US, 1, { value: parseEth("0.001") })
      ).to.be.revertedWith("Qualification ended");
    });

    it("Should handle multiple votes for same country from same user", async function () {
      await qualification.connect(voter1).vote(US, 1, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(US, 1, { value: parseEth("0.0015") });
      await qualification.connect(voter1).vote(US, 1, { value: parseEth("0.002") });

      expect(await qualification.userVotes(voter1.address, US)).to.equal(3);
      expect(await qualification.countryVotes(US)).to.equal(3);
    });

    it("Should handle user voting for multiple countries", async function () {
      await qualification.connect(voter1).vote(US, 1, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(BR, 1, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(AR, 1, { value: parseEth("0.001") });

      expect(await qualification.userVotes(voter1.address, US)).to.equal(1);
      expect(await qualification.userVotes(voter1.address, BR)).to.equal(1);
      expect(await qualification.userVotes(voter1.address, AR)).to.equal(1);
    });

    it("Should prevent direct ETH transfers", async function () {
      await expect(
        voter1.sendTransaction({ to: await qualification.getAddress(), value: parseEth("0.001") })
      ).to.be.revertedWith("Direct ETH not accepted");
    });
  });
});
