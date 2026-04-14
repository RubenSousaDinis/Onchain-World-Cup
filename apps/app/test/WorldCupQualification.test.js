const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("WorldCupQualification", function () {
  let qualification;
  let owner, platform, voter1, voter2, voter3, referrer;
  let qualificationStartTime, qualificationEndTime;

  const parseEth = (amount) => ethers.parseEther(amount.toString());

  const toBytes8 = (str) => {
    const bytes = ethers.toUtf8Bytes(str);
    const hex = Buffer.from(bytes).toString("hex");
    return "0x" + hex.padEnd(16, "0");
  };

  const US = toBytes8("US");
  const BR = toBytes8("BR");
  const AR = toBytes8("AR");
  const FR = toBytes8("FR");
  const DE = toBytes8("DE");
  const IT = toBytes8("IT");
  const ES = toBytes8("ES");
  const NL = toBytes8("NL");
  const GB_ENG = toBytes8("GB-ENG");

  const generateCountries = (n) => {
    const countries = [];
    for (let i = 0; i < n; i++) {
      const c1 = String.fromCharCode(65 + (i % 26));
      const c2 = String.fromCharCode(65 + Math.floor(i / 26));
      countries.push(toBytes8(c1 + c2));
    }
    return countries;
  };

  // Helper: deploy a contract with 48 countries and votes placed, ready to finalize
  async function deployAndFinalize(extraSetup) {
    const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
    const currentTime = await time.latest();
    const startTime = currentTime + 60;
    const endTime = currentTime + 2000;
    const countries48 = generateCountries(48);

    const q = await WorldCupQualification.deploy(
      startTime, endTime, platform.address, countries48, 1000
    );
    await q.waitForDeployment();
    await time.increaseTo(startTime);

    if (extraSetup) await extraSetup(q, countries48);

    for (const c of countries48) {
      if ((await q.countryVotes(c)) === 0n) {
        await q.connect(voter1).vote(c, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      }
    }

    await time.increase(2001);
    await q.connect(owner).finalizeQualification();
    return { q, countries48 };
  }

  beforeEach(async function () {
    [owner, platform, voter1, voter2, voter3, referrer] = await ethers.getSigners();

    const currentTime = await time.latest();
    qualificationStartTime = currentTime + 60;
    qualificationEndTime = qualificationStartTime + 7 * 24 * 3600;

    const initialCountries = [US, BR, AR, FR, DE, IT, ES, NL, GB_ENG];

    const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
    qualification = await WorldCupQualification.deploy(
      qualificationStartTime,
      qualificationEndTime,
      platform.address,
      initialCountries,
      1000 // 10%
    );
    await qualification.waitForDeployment();
  });

  // ============================================================
  // DEPLOYMENT
  // ============================================================

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
      expect(await qualification.MAX_PLATFORM_FEE_BPS()).to.equal(2000);
      expect(await qualification.QUALIFICATION_SPOTS()).to.equal(48);
      expect(await qualification.REFERRAL_FEE_BPS()).to.equal(100);
    });

    it("Should initialize valid countries", async function () {
      expect(await qualification.validCountry(US)).to.be.true;
      expect(await qualification.validCountry(BR)).to.be.true;
      expect(await qualification.validCountry(AR)).to.be.true;
    });

    it("Should not start paused", async function () {
      expect(await qualification.paused()).to.be.false;
    });

    it("Should revert with start time in the past", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      await expect(
        WorldCupQualification.deploy(currentTime - 1000, currentTime + 10000, platform.address, [US], 1000)
      ).to.be.revertedWith("Start time must be in future");
    });

    it("Should revert with end time before start time", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      await expect(
        WorldCupQualification.deploy(currentTime + 10000, currentTime + 5000, platform.address, [US], 1000)
      ).to.be.revertedWith("End time must be after start time");
    });

    it("Should revert with zero fee recipient", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      await expect(
        WorldCupQualification.deploy(currentTime + 60, currentTime + 10000, ethers.ZeroAddress, [US], 1000)
      ).to.be.revertedWith("Invalid fee recipient");
    });

    it("Should revert with fee too high", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      await expect(
        WorldCupQualification.deploy(currentTime + 60, currentTime + 10000, platform.address, [US], 2001)
      ).to.be.revertedWith("Fee too high");
    });
  });

  // ============================================================
  // ADMIN FUNCTIONS
  // ============================================================

  describe("Admin Functions", function () {
    beforeEach(async function () {
      await time.increaseTo(qualificationStartTime);
    });

    it("Should allow owner to add a new country", async function () {
      const GB = toBytes8("GB");
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
      await expect(
        qualification.connect(voter1).addCountry(toBytes8("GB"))
      ).to.be.revertedWithCustomError(qualification, "OwnableUnauthorizedAccount");
    });

    it("Should revert if trying to add duplicate country", async function () {
      await expect(
        qualification.connect(owner).addCountry(US)
      ).to.be.revertedWith("Country already exists");
    });

    it("Should revert if trying to add country after qualification ends", async function () {
      await time.increase(7 * 24 * 3600 + 1);
      await expect(
        qualification.connect(owner).addCountry(toBytes8("GB"))
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
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
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
      await expect(qualification.connect(owner).setPlatformFee(500))
        .to.emit(qualification, "PlatformFeeUpdated")
        .withArgs(1000, 500);
      expect(await qualification.platformFeeBps()).to.equal(500);
    });

    it("Should allow owner to set platform fee to 0", async function () {
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
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 2000;
      const countries48 = generateCountries(48);

      const testQual = await WorldCupQualification.deploy(startTime, endTime, platform.address, countries48, 1000);
      await testQual.waitForDeployment();
      await time.increaseTo(startTime);

      for (const c of countries48) {
        await testQual.connect(voter1).vote(c, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      }
      await time.increase(2001);
      await testQual.connect(owner).finalizeQualification();

      await expect(
        testQual.connect(owner).setPlatformFee(500)
      ).to.be.revertedWith("Qualification ended");
    });

    it("Should apply updated fee to new votes", async function () {
      await qualification.connect(owner).setPlatformFee(500);
      const votePrice = parseEth("0.001");
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: votePrice });

      const expectedFee = (votePrice * 500n) / 10000n;
      expect(await qualification.totalPlatformFeesCollected()).to.equal(expectedFee);
      expect(await qualification.totalPrizePool()).to.equal(votePrice - expectedFee);
    });
  });

  // ============================================================
  // PAUSE / UNPAUSE
  // ============================================================

  describe("Pause / Unpause", function () {
    beforeEach(async function () {
      await time.increaseTo(qualificationStartTime);
    });

    it("Owner can pause voting", async function () {
      await expect(qualification.connect(owner).pause())
        .to.emit(qualification, "Paused")
        .withArgs(owner.address);
      expect(await qualification.paused()).to.be.true;
    });

    it("Owner can unpause voting", async function () {
      await qualification.connect(owner).pause();
      await expect(qualification.connect(owner).unpause())
        .to.emit(qualification, "Unpaused")
        .withArgs(owner.address);
      expect(await qualification.paused()).to.be.false;
    });

    it("Non-owner cannot pause", async function () {
      await expect(
        qualification.connect(voter1).pause()
      ).to.be.revertedWithCustomError(qualification, "OwnableUnauthorizedAccount");
    });

    it("Non-owner cannot unpause", async function () {
      await qualification.connect(owner).pause();
      await expect(
        qualification.connect(voter1).unpause()
      ).to.be.revertedWithCustomError(qualification, "OwnableUnauthorizedAccount");
    });

    it("Voting reverts when paused", async function () {
      await qualification.connect(owner).pause();
      await expect(
        qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") })
      ).to.be.revertedWith("Contract is paused");
    });

    it("Voting works after unpausing", async function () {
      await qualification.connect(owner).pause();
      await qualification.connect(owner).unpause();
      await expect(
        qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") })
      ).to.not.be.reverted;
    });

    it("Reverts if already paused", async function () {
      await qualification.connect(owner).pause();
      await expect(qualification.connect(owner).pause()).to.be.revertedWith("Contract is paused");
    });

    it("Reverts if not paused when unpausing", async function () {
      await expect(qualification.connect(owner).unpause()).to.be.revertedWith("Contract is not paused");
    });
  });

  // ============================================================
  // LINEAR PRICING
  // ============================================================

  describe("Linear Pricing", function () {
    beforeEach(async function () {
      await time.increaseTo(qualificationStartTime);
    });

    it("Should calculate correct first vote price (0.001 ETH)", async function () {
      expect(await qualification.votePrice(US)).to.equal(parseEth("0.001"));
    });

    it("Should increase price linearly by 0.0005 ETH per vote", async function () {
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      expect(await qualification.votePrice(US)).to.equal(parseEth("0.0015"));

      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.0015") });
      expect(await qualification.votePrice(US)).to.equal(parseEth("0.002"));

      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.002") });
      expect(await qualification.votePrice(US)).to.equal(parseEth("0.0025"));
    });

    it("Should calculate correct price for multiple votes in one transaction", async function () {
      const price = await qualification.calculateVoteCost(US, 3);
      const expected = parseEth("0.001") + parseEth("0.0015") + parseEth("0.002");
      expect(price).to.equal(expected);
    });

    it("Should track vote count correctly after 10 votes", async function () {
      for (let i = 0; i < 10; i++) {
        const price = await qualification.votePrice(US);
        await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: price });
      }
      expect(await qualification.countryVotes(US)).to.equal(10);
      expect(await qualification.userVotes(voter1.address, US)).to.equal(10);
      expect(await qualification.votePrice(US)).to.equal(parseEth("0.006"));
    });

    it("Should track ETH per country", async function () {
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.0015") });
      expect(await qualification.ethForCountry(US)).to.equal(parseEth("0.0025"));
      expect(await qualification.countryETH(US)).to.equal(parseEth("0.0025"));
    });

    it("Should allow different voters on different countries", async function () {
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await qualification.connect(voter2).vote(BR, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await qualification.connect(voter3).vote(AR, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      expect(await qualification.countryVotes(US)).to.equal(1);
      expect(await qualification.countryVotes(BR)).to.equal(1);
      expect(await qualification.countryVotes(AR)).to.equal(1);
    });

    it("Should refund overpayment", async function () {
      const price = await qualification.votePrice(US);
      const overpayment = parseEth("0.01");

      const balanceBefore = await ethers.provider.getBalance(voter1.address);
      const tx = await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: overpayment });
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(voter1.address);

      expect(balanceAfter).to.equal(balanceBefore - price - gasCost);
    });

    it("Should emit VotePlaced event with correct data", async function () {
      const price = parseEth("0.001");
      const tx = await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: price });
      const receipt = await tx.wait();

      const eventFilter = qualification.filters.VotePlaced(voter1.address, US);
      const events = await qualification.queryFilter(eventFilter, receipt.blockNumber, receipt.blockNumber);

      expect(events.length).to.equal(1);
      expect(events[0].args.voter).to.equal(voter1.address);
      expect(events[0].args.country).to.equal(US);
      expect(events[0].args.votes).to.equal(1);
      expect(events[0].args.cost).to.equal(price);
    });

    it("Should revert if insufficient payment", async function () {
      await expect(
        qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.0009") })
      ).to.be.revertedWith("Insufficient ETH");
    });

    it("Should revert for invalid country", async function () {
      await expect(
        qualification.connect(voter1).vote(toBytes8("XX"), 1, ethers.ZeroAddress, { value: parseEth("0.001") })
      ).to.be.revertedWith("Invalid country");
    });

    it("Should revert for zero vote count", async function () {
      await expect(
        qualification.connect(voter1).vote(US, 0, ethers.ZeroAddress, { value: parseEth("0.001") })
      ).to.be.revertedWith("Invalid vote count");
    });

    it("Should revert for vote count exceeding max", async function () {
      await expect(
        qualification.connect(voter1).vote(US, 101, ethers.ZeroAddress, { value: parseEth("10") })
      ).to.be.revertedWith("Invalid vote count");
    });

    it("Should revert voting before start time", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 1000;
      const endTime = startTime + 10000;
      const q = await WorldCupQualification.deploy(startTime, endTime, platform.address, [US], 1000);
      await q.waitForDeployment();

      await expect(
        q.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") })
      ).to.be.revertedWith("Qualification not started");
    });
  });

  // ============================================================
  // PLATFORM FEE
  // ============================================================

  describe("Platform Fee", function () {
    beforeEach(async function () {
      await time.increaseTo(qualificationStartTime);
    });

    it("Should transfer 10% platform fee immediately on vote", async function () {
      const votePrice = parseEth("0.001");
      const expectedFee = (votePrice * 1000n) / 10000n;

      const platformBalanceBefore = await ethers.provider.getBalance(platform.address);
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: votePrice });
      const platformBalanceAfter = await ethers.provider.getBalance(platform.address);

      expect(platformBalanceAfter - platformBalanceBefore).to.equal(expectedFee);
    });

    it("Should track total platform fees collected", async function () {
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await qualification.connect(voter2).vote(BR, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      const expectedTotalFee = (parseEth("0.001") * 1000n) / 10000n + (parseEth("0.001") * 1000n) / 10000n;
      expect(await qualification.totalPlatformFeesCollected()).to.equal(expectedTotalFee);
    });

    it("Should store only prize pool (90%) in contract", async function () {
      const votePrice = parseEth("0.001");
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: votePrice });

      const expectedPrizePool = votePrice - (votePrice * 1000n) / 10000n;
      expect(await qualification.totalPrizePool()).to.equal(expectedPrizePool);
    });

    it("Should emit PlatformFeeTransferred event on each vote", async function () {
      const votePrice = parseEth("0.001");
      const expectedFee = (votePrice * 1000n) / 10000n;

      await expect(qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: votePrice }))
        .to.emit(qualification, "PlatformFeeTransferred")
        .withArgs(platform.address, expectedFee);
    });

    it("Should not emit PlatformFeeTransferred when fee is 0", async function () {
      await qualification.connect(owner).setPlatformFee(0);
      const tx = await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      const receipt = await tx.wait();
      const events = await qualification.queryFilter(
        qualification.filters.PlatformFeeTransferred(),
        receipt.blockNumber,
        receipt.blockNumber
      );
      expect(events.length).to.equal(0);
    });
  });

  // ============================================================
  // REFERRAL SYSTEM
  // ============================================================

  describe("Referral System", function () {
    beforeEach(async function () {
      await time.increaseTo(qualificationStartTime);
    });

    it("Referrer receives 1% of vote cost when valid referrer is provided", async function () {
      const votePrice = parseEth("0.001");
      const expectedReferral = (votePrice * 100n) / 10000n; // 1%

      const referrerBalanceBefore = await ethers.provider.getBalance(referrer.address);
      await qualification.connect(voter1).vote(US, 1, referrer.address, { value: votePrice });
      const referrerBalanceAfter = await ethers.provider.getBalance(referrer.address);

      expect(referrerBalanceAfter - referrerBalanceBefore).to.equal(expectedReferral);
    });

    it("Referral is deducted from platform fee, not prize pool", async function () {
      const votePrice = parseEth("0.001");
      const platformFee = (votePrice * 1000n) / 10000n; // 10%
      const referralFee = (votePrice * 100n) / 10000n; // 1%
      const expectedPlatformFee = platformFee - referralFee; // 9%
      const expectedPrizePool = votePrice - platformFee; // 90%

      await qualification.connect(voter1).vote(US, 1, referrer.address, { value: votePrice });

      expect(await qualification.totalPlatformFeesCollected()).to.equal(expectedPlatformFee);
      expect(await qualification.totalPrizePool()).to.equal(expectedPrizePool);
    });

    it("Emits ReferralPaid event with correct args", async function () {
      const votePrice = parseEth("0.001");
      const expectedReferral = (votePrice * 100n) / 10000n;

      await expect(
        qualification.connect(voter1).vote(US, 1, referrer.address, { value: votePrice })
      )
        .to.emit(qualification, "ReferralPaid")
        .withArgs(referrer.address, voter1.address, expectedReferral);
    });

    it("Tracks referrer earnings correctly", async function () {
      const votePrice = parseEth("0.001");
      const expectedReferral = (votePrice * 100n) / 10000n;

      await qualification.connect(voter1).vote(US, 1, referrer.address, { value: votePrice });
      expect(await qualification.referrerEarnings(referrer.address)).to.equal(expectedReferral);
    });

    it("Accumulates referrer earnings across multiple votes", async function () {
      const votePrice1 = parseEth("0.001");
      const votePrice2 = parseEth("0.0015"); // second vote for same country

      await qualification.connect(voter1).vote(US, 1, referrer.address, { value: votePrice1 });
      await qualification.connect(voter2).vote(US, 1, referrer.address, { value: votePrice2 });

      const expectedTotal =
        (votePrice1 * 100n) / 10000n +
        (votePrice2 * 100n) / 10000n;

      expect(await qualification.referrerEarnings(referrer.address)).to.equal(expectedTotal);
    });

    it("No referral paid when referrer is zero address", async function () {
      const votePrice = parseEth("0.001");
      const platformFee = (votePrice * 1000n) / 10000n;

      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: votePrice });

      // Full platform fee goes to platform (no referral deducted)
      expect(await qualification.totalPlatformFeesCollected()).to.equal(platformFee);
    });

    it("No referral paid when voter is their own referrer", async function () {
      const votePrice = parseEth("0.001");
      const platformFee = (votePrice * 1000n) / 10000n;

      await qualification.connect(voter1).vote(US, 1, voter1.address, { value: votePrice });

      expect(await qualification.totalPlatformFeesCollected()).to.equal(platformFee);
      expect(await qualification.referrerEarnings(voter1.address)).to.equal(0);
    });

    it("No referral paid when platform fee is below 1% (REFERRAL_FEE_BPS)", async function () {
      await qualification.connect(owner).setPlatformFee(50); // 0.5% < 1%
      const votePrice = parseEth("0.001");
      const expectedFee = (votePrice * 50n) / 10000n;

      const referrerBalanceBefore = await ethers.provider.getBalance(referrer.address);
      await qualification.connect(voter1).vote(US, 1, referrer.address, { value: votePrice });
      const referrerBalanceAfter = await ethers.provider.getBalance(referrer.address);

      expect(referrerBalanceAfter).to.equal(referrerBalanceBefore);
      expect(await qualification.totalPlatformFeesCollected()).to.equal(expectedFee);
    });

    it("No referral paid when platform fee is exactly 0%", async function () {
      await qualification.connect(owner).setPlatformFee(0);

      const referrerBalanceBefore = await ethers.provider.getBalance(referrer.address);
      await qualification.connect(voter1).vote(US, 1, referrer.address, { value: parseEth("0.001") });
      const referrerBalanceAfter = await ethers.provider.getBalance(referrer.address);

      expect(referrerBalanceAfter).to.equal(referrerBalanceBefore);
    });

    it("Referral correct for multi-vote transaction", async function () {
      // 2 votes from 0 existing: cost = 0.001 + 0.0015 = 0.0025 ETH
      const cost = await qualification.calculateVoteCost(US, 2);
      const expectedReferral = (cost * 100n) / 10000n;

      const referrerBalanceBefore = await ethers.provider.getBalance(referrer.address);
      await qualification.connect(voter1).vote(US, 2, referrer.address, { value: cost });
      const referrerBalanceAfter = await ethers.provider.getBalance(referrer.address);

      expect(referrerBalanceAfter - referrerBalanceBefore).to.equal(expectedReferral);
    });
  });

  // ============================================================
  // QUALIFICATION FINALIZATION
  // ============================================================

  describe("Qualification Finalization", function () {
    let countries48;

    beforeEach(async function () {
      await time.increaseTo(qualificationStartTime);

      const additionalCountries = [];
      for (let i = 9; i < 48; i++) {
        const c1 = String.fromCharCode(65 + (i % 26));
        const c2 = String.fromCharCode(65 + (Math.floor(i / 26) % 26));
        additionalCountries.push(toBytes8(c1 + c2));
      }
      await qualification.connect(owner).addCountries(additionalCountries);
      countries48 = [US, BR, AR, FR, DE, IT, ES, NL, GB_ENG, ...additionalCountries];

      for (const c of countries48) {
        await qualification.connect(voter1).vote(c, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      }

      await time.increase(7 * 24 * 3600 + 1);
    });

    it("Should revert finalization before end time", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;
      const newQual = await WorldCupQualification.deploy(startTime, endTime, platform.address, [US, BR, AR], 1000);
      await newQual.waitForDeployment();

      await expect(newQual.finalizeQualification()).to.be.revertedWith("Qualification not ended");
    });

    it("Should finalize and emit correct events", async function () {
      await expect(qualification.connect(owner).finalizeQualification())
        .to.emit(qualification, "QualificationEnded")
        .to.emit(qualification, "QualificationFinalized")
        .to.emit(qualification, "PrizesDistributed");

      expect(await qualification.qualificationFinalized()).to.be.true;
    });

    it("Should revert if not owner tries to finalize", async function () {
      await expect(
        qualification.connect(voter1).finalizeQualification()
      ).to.be.revertedWithCustomError(qualification, "OwnableUnauthorizedAccount");
    });

    it("Automatically selects the 48 countries with the most votes", async function () {
      // beforeEach already voted for all 48 countries and advanced past end time
      await qualification.connect(owner).finalizeQualification();

      expect(await qualification.qualificationFinalized()).to.be.true;
      expect(await qualification.isQualified(US)).to.be.true;
      expect(await qualification.isQualified(BR)).to.be.true;
    });

    it("Countries with more votes rank above those with fewer (CRITICAL TRUST GUARANTEE)", async function () {
      // Deploy fresh contract with 49 countries
      // country[0] gets 10 votes, countries[1..48] get 1 vote each
      // Only top 48 qualify — country[0] and 47 of the 1-vote countries
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 2000;
      const c49 = generateCountries(49);

      const q = await WorldCupQualification.deploy(startTime, endTime, platform.address, c49, 1000);
      await q.waitForDeployment();
      await time.increaseTo(startTime);

      // c49[0] gets 10 votes
      for (let i = 0; i < 10; i++) {
        const price = await q.votePrice(c49[0]);
        await q.connect(voter1).vote(c49[0], 1, ethers.ZeroAddress, { value: price });
      }
      // c49[1..47] each get 2 votes — clearly above c49[48]
      for (let i = 1; i < 48; i++) {
        const cost = await q.calculateVoteCost(c49[i], 2);
        await q.connect(voter1).vote(c49[i], 2, ethers.ZeroAddress, { value: cost });
      }
      // c49[48] gets only 1 vote — fewest, must be excluded regardless of tiebreaker
      await q.connect(voter1).vote(c49[48], 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      await time.increase(2001);
      await q.connect(owner).finalizeQualification();

      // c49[0] must qualify (most votes)
      expect(await q.isQualified(c49[0])).to.be.true;
      // c49[48] must NOT qualify (fewer votes than the other 48 countries)
      expect(await q.isQualified(c49[48])).to.be.false;
    });

    it("Countries with zero votes are never selected", async function () {
      // Deploy fresh contract: 49 countries but only 48 get votes
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 2000;
      const c49 = generateCountries(49);

      const q = await WorldCupQualification.deploy(startTime, endTime, platform.address, c49, 1000);
      await q.waitForDeployment();
      await time.increaseTo(startTime);

      // Only vote for first 48 — last one has 0 votes
      for (let i = 0; i < 48; i++) {
        await q.connect(voter1).vote(c49[i], 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      }

      await time.increase(2001);
      await q.connect(owner).finalizeQualification();

      expect(await q.isQualified(c49[48])).to.be.false;
      expect(await q.isQualified(c49[0])).to.be.true;
    });

    it("Reverts if fewer than 48 countries have votes", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;
      const c48 = generateCountries(48);

      const testQual = await WorldCupQualification.deploy(startTime, endTime, platform.address, c48, 1000);
      await testQual.waitForDeployment();
      await time.increaseTo(startTime);

      // Only vote for 47 countries — not enough for 48 spots
      for (let i = 0; i < 47; i++) {
        await testQual.connect(voter1).vote(c48[i], 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      }

      await time.increase(1001);
      await expect(testQual.connect(owner).finalizeQualification())
        .to.be.revertedWith("Not enough countries with votes");
    });

    it("Tiebreaker: lower bytes8 code qualifies when vote counts are equal", async function () {
      // Deploy with 49 countries, all get exactly 1 vote
      // The 48 with the lowest codes should qualify
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 2000;
      const c49 = generateCountries(49);

      const q = await WorldCupQualification.deploy(startTime, endTime, platform.address, c49, 1000);
      await q.waitForDeployment();
      await time.increaseTo(startTime);

      for (const c of c49) {
        await q.connect(voter1).vote(c, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      }

      await time.increase(2001);
      await q.connect(owner).finalizeQualification();

      // Sort c49 by bytes8 value ascending — the top 48 (lowest codes) should qualify
      const sorted = [...c49].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      for (let i = 0; i < 48; i++) {
        expect(await q.isQualified(sorted[i])).to.be.true;
      }
      expect(await q.isQualified(sorted[48])).to.be.false;
    });

    it("Should prevent double finalization", async function () {
      await qualification.connect(owner).finalizeQualification();
      await expect(
        qualification.connect(owner).finalizeQualification()
      ).to.be.revertedWith("Already finalized");
    });

    it("Should prevent voting after qualification period ends", async function () {
      await expect(
        qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") })
      ).to.be.revertedWith("Qualification ended");
    });
  });

  // ============================================================
  // WINNINGS CALCULATION AND CLAIMING
  // ============================================================

  describe("Winnings Calculation and Claiming", function () {
    let winningsCountries48;

    beforeEach(async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 7 * 24 * 3600 + 60;

      winningsCountries48 = [US, BR, AR];
      let idx = 0;
      while (winningsCountries48.length < 48) {
        const c = toBytes8("Z" + String.fromCharCode(65 + (idx % 26)) + String.fromCharCode(65 + Math.floor(idx / 26)));
        if (!winningsCountries48.includes(c)) winningsCountries48.push(c);
        idx++;
      }

      qualification = await WorldCupQualification.deploy(startTime, endTime, platform.address, winningsCountries48, 1000);
      await qualification.waitForDeployment();
      await time.increaseTo(startTime);

      for (let i = 0; i < 5; i++) {
        const price = await qualification.votePrice(US);
        await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: price });
      }
      for (let i = 0; i < 4; i++) {
        const price = await qualification.votePrice(AR);
        await qualification.connect(voter2).vote(AR, 1, ethers.ZeroAddress, { value: price });
      }
      for (let i = 0; i < 3; i++) {
        const price = await qualification.votePrice(BR);
        await qualification.connect(voter3).vote(BR, 1, ethers.ZeroAddress, { value: price });
      }
      for (const c of winningsCountries48) {
        if (c !== US && c !== BR && c !== AR) {
          await qualification.connect(voter1).vote(c, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
        }
      }

      await time.increase(7 * 24 * 3600 + 1);
      await qualification.connect(owner).finalizeQualification();
    });

    it("Should calculate winnings using unified pool formula", async function () {
      const totalQualifiedVotes = await qualification.totalQualifiedVotes();
      const totalPrizePool = await qualification.totalPrizePool();

      const [countries, votes] = await qualification.getUserVotes(voter1.address);
      let voter1QualifiedVotes = 0n;
      for (let i = 0; i < countries.length; i++) voter1QualifiedVotes += votes[i];

      const expectedWinnings = (voter1QualifiedVotes * totalPrizePool) / totalQualifiedVotes;
      expect(await qualification.claimable(voter1.address)).to.equal(expectedWinnings);
    });

    it("Should return zero for voter of non-qualified country", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;
      const c48 = generateCountries(48);

      const testQual = await WorldCupQualification.deploy(startTime, endTime, platform.address, [...c48, BR], 1000);
      await testQual.waitForDeployment();
      await time.increaseTo(startTime);

      // c48 countries get 2 votes each — clearly outrank BR
      for (const c of c48) {
        const cost = await testQual.calculateVoteCost(c, 2);
        await testQual.connect(voter1).vote(c, 2, ethers.ZeroAddress, { value: cost });
      }
      // BR gets only 1 vote — fewer than all c48 countries, must not qualify
      await testQual.connect(voter2).vote(BR, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      await time.increase(1001);
      await testQual.connect(owner).finalizeQualification();

      expect(await testQual.claimable(voter2.address)).to.equal(0);
    });

    it("Should return zero for address with no votes", async function () {
      expect(await qualification.claimable(owner.address)).to.equal(0);
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
      await expect(qualification.connect(voter1).claim()).to.be.revertedWith("Already claimed");
    });

    it("Should return zero claimable after claiming", async function () {
      await qualification.connect(voter1).claim();
      expect(await qualification.claimable(voter1.address)).to.equal(0);
    });

    it("Should revert claim before finalization", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;
      const newQual = await WorldCupQualification.deploy(startTime, endTime, platform.address, [US], 1000);
      await newQual.waitForDeployment();
      await time.increaseTo(startTime);
      await newQual.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      await expect(newQual.connect(voter1).claim()).to.be.revertedWith("Not finalized");
    });

    it("Should revert claim if nothing to claim", async function () {
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;
      const c48 = generateCountries(48);

      const testQual = await WorldCupQualification.deploy(startTime, endTime, platform.address, [...c48, BR], 1000);
      await testQual.waitForDeployment();
      await time.increaseTo(startTime);

      // c48 countries get 2 votes each — clearly outrank BR
      for (const c of c48) {
        const cost = await testQual.calculateVoteCost(c, 2);
        await testQual.connect(voter1).vote(c, 2, ethers.ZeroAddress, { value: cost });
      }
      // BR gets only 1 vote — fewer than all c48 countries, must not qualify
      await testQual.connect(voter2).vote(BR, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      await time.increase(1001);
      await testQual.connect(owner).finalizeQualification();

      await expect(testQual.connect(voter2).claim()).to.be.revertedWith("Nothing to claim");
    });

    it("Should emit WinningsClaimed event", async function () {
      const winnings = await qualification.claimable(voter1.address);
      await expect(qualification.connect(voter1).claim())
        .to.emit(qualification, "WinningsClaimed")
        .withArgs(voter1.address, winnings);
    });
  });

  // ============================================================
  // SWEEP RESIDUAL
  // ============================================================

  describe("sweepResidual", function () {
    it("Owner can sweep residual ETH after finalization", async function () {
      const { q } = await deployAndFinalize();

      // Voter1 claims their winnings (leaves rounding dust)
      await q.connect(voter1).claim();

      const contractBalance = await ethers.provider.getBalance(await q.getAddress());
      if (contractBalance > 0n) {
        const platformBefore = await ethers.provider.getBalance(platform.address);
        await q.connect(owner).sweepResidual();
        const platformAfter = await ethers.provider.getBalance(platform.address);
        expect(platformAfter - platformBefore).to.equal(contractBalance);
      }
    });

    it("Non-owner cannot sweep", async function () {
      const { q } = await deployAndFinalize();

      // Add some claimable balance by having voter1 not claim
      const contractBalance = await ethers.provider.getBalance(await q.getAddress());
      if (contractBalance > 0n) {
        await expect(
          q.connect(voter1).sweepResidual()
        ).to.be.revertedWithCustomError(q, "OwnableUnauthorizedAccount");
      }
    });

    it("Reverts sweep before finalization", async function () {
      await expect(
        qualification.connect(owner).sweepResidual()
      ).to.be.revertedWith("Not finalized");
    });

    it("Reverts sweep when contract has no ETH", async function () {
      // Deploy and finalize with all voters claiming
      const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
      const currentTime = await time.latest();
      const startTime = currentTime + 60;
      const endTime = currentTime + 1000;
      const c48 = generateCountries(48);

      const q = await WorldCupQualification.deploy(startTime, endTime, platform.address, c48, 0); // 0% fee means contract holds all ETH
      await q.waitForDeployment();
      await time.increaseTo(startTime);

      for (const c of c48) {
        await q.connect(voter1).vote(c, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      }

      await time.increase(1001);
      await q.connect(owner).finalizeQualification();

      // Voter1 claims everything
      await q.connect(voter1).claim();

      const balance = await ethers.provider.getBalance(await q.getAddress());
      if (balance === 0n) {
        await expect(q.connect(owner).sweepResidual()).to.be.revertedWith("No residual");
      }
    });
  });

  // ============================================================
  // READ-ONLY METRICS
  // ============================================================

  describe("Read-Only Metrics", function () {
    beforeEach(async function () {
      await time.increaseTo(qualificationStartTime);
      const usPrice2 = await qualification.calculateVoteCost(US, 2);
      await qualification.connect(voter1).vote(US, 2, ethers.ZeroAddress, { value: usPrice2 });
      await qualification.connect(voter1).vote(BR, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await qualification.connect(voter2).vote(AR, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
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
      expect(prizePool).to.equal(totalETH - (totalETH * 1000n) / 10000n);
    });

    it("Should return platform fee amount via public getter", async function () {
      const fees = await qualification.totalPlatformFeesCollected();
      expect(fees).to.be.greaterThan(0);
      const totalETH = parseEth("0.0025") + parseEth("0.001") + parseEth("0.001");
      expect(fees).to.equal((totalETH * 1000n) / 10000n);
    });

    it("totalETHCollected equals sum of all votes", async function () {
      const expected = parseEth("0.0025") + parseEth("0.001") + parseEth("0.001");
      expect(await qualification.totalETHCollected()).to.equal(expected);
    });

    it("totalVotes equals sum of all vote counts", async function () {
      // voter1: 2 votes for US, 1 vote for BR = 3; voter2: 1 vote for AR = 1; total = 4
      expect(await qualification.totalVotes()).to.equal(4);
    });
  });

  // ============================================================
  // VIEW FUNCTIONS
  // ============================================================

  describe("View Functions", function () {
    beforeEach(async function () {
      await time.increaseTo(qualificationStartTime);
      const usPrice2 = await qualification.calculateVoteCost(US, 2);
      await qualification.connect(voter1).vote(US, 2, ethers.ZeroAddress, { value: usPrice2 });
      await qualification.connect(voter1).vote(BR, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await qualification.connect(voter2).vote(AR, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
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

  // ============================================================
  // EDGE CASES
  // ============================================================

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await time.increaseTo(qualificationStartTime);
    });

    it("Should handle voting after qualification period ends", async function () {
      await time.increase(7 * 24 * 3600 + 1);
      await expect(
        qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") })
      ).to.be.revertedWith("Qualification ended");
    });

    it("Should handle multiple votes for same country from same user", async function () {
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.0015") });
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.002") });

      expect(await qualification.userVotes(voter1.address, US)).to.equal(3);
      expect(await qualification.countryVotes(US)).to.equal(3);
    });

    it("Should handle user voting for multiple countries", async function () {
      await qualification.connect(voter1).vote(US, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(BR, 1, ethers.ZeroAddress, { value: parseEth("0.001") });
      await qualification.connect(voter1).vote(AR, 1, ethers.ZeroAddress, { value: parseEth("0.001") });

      expect(await qualification.userVotes(voter1.address, US)).to.equal(1);
      expect(await qualification.userVotes(voter1.address, BR)).to.equal(1);
      expect(await qualification.userVotes(voter1.address, AR)).to.equal(1);
    });

    it("Should prevent direct ETH transfers", async function () {
      await expect(
        voter1.sendTransaction({ to: await qualification.getAddress(), value: parseEth("0.001") })
      ).to.be.revertedWith("Direct ETH not accepted");
    });

    it("Voting reverts when contract is finalized (double guard via time check)", async function () {
      const { q } = await deployAndFinalize();
      await expect(
        q.connect(voter1).vote(toBytes8("AA"), 1, ethers.ZeroAddress, { value: parseEth("0.001") })
      ).to.be.revertedWith("Qualification ended");
    });
  });
});
