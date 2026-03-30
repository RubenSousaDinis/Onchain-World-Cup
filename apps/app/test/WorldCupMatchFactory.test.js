const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("WorldCupMatchFactory", function () {
  let eventHub, factory;
  let owner, platform, other;

  beforeEach(async function () {
    [owner, platform, other] = await ethers.getSigners();

    const EventHub = await ethers.getContractFactory("WorldCupEventHub");
    eventHub = await EventHub.deploy();
    await eventHub.waitForDeployment();

    const Factory = await ethers.getContractFactory("WorldCupMatchFactory");
    factory = await Factory.deploy(
      await eventHub.getAddress(),
      platform.address,
      1000 // 10% platform fee
    );
    await factory.waitForDeployment();

    // Set factory as authorized in EventHub
    await eventHub.setAuthorizedFactory(await factory.getAddress());
  });

  describe("Deployment", function () {
    it("Should set correct eventHub", async function () {
      expect(await factory.eventHub()).to.equal(await eventHub.getAddress());
    });

    it("Should set correct platform address", async function () {
      expect(await factory.platformAddress()).to.equal(platform.address);
    });

    it("Should set correct platform fee", async function () {
      expect(await factory.platformFeePercent()).to.equal(1000);
    });
  });

  describe("Match Creation", function () {
    it("Should deploy and authorize a new match", async function () {
      const deployTime = await time.latest();

      const tx = await factory.connect(owner).createMatch("Brazil", "Argentina", deployTime);
      const receipt = await tx.wait();

      expect(await factory.getMatchCount()).to.equal(1);

      const matches = await factory.getDeployedMatches();
      expect(await eventHub.isAuthorized(matches[0])).to.be.true;
    });

    it("Should emit MatchCreated event", async function () {
      const deployTime = await time.latest();

      await expect(factory.connect(owner).createMatch("Brazil", "Argentina", deployTime))
        .to.emit(factory, "MatchCreated");
    });

    it("Should deploy match with correct parameters", async function () {
      const deployTime = await time.latest();

      await factory.connect(owner).createMatch("Brazil", "Argentina", deployTime);

      const matches = await factory.getDeployedMatches();
      const WorldCupMatch = await ethers.getContractFactory("WorldCupMatch");
      const match = WorldCupMatch.attach(matches[0]);

      expect(await match.team1Name()).to.equal("Brazil");
      expect(await match.team2Name()).to.equal("Argentina");
      expect(await match.matchStartTime()).to.equal(deployTime);
      expect(await match.platformAddress()).to.equal(platform.address);
      expect(await match.platformFeePercent()).to.equal(1000);
      expect(await match.eventHub()).to.equal(await eventHub.getAddress());
    });

    it("Should create multiple matches", async function () {
      const deployTime = await time.latest();

      await factory.connect(owner).createMatch("Brazil", "Argentina", deployTime);
      await factory.connect(owner).createMatch("France", "Germany", deployTime);
      await factory.connect(owner).createMatch("Spain", "Italy", deployTime);

      expect(await factory.getMatchCount()).to.equal(3);

      const matches = await factory.getDeployedMatches();
      expect(matches.length).to.equal(3);

      for (const addr of matches) {
        expect(await eventHub.isAuthorized(addr)).to.be.true;
      }
    });

    it("Should reject non-owner creating matches", async function () {
      const deployTime = await time.latest();

      await expect(
        factory.connect(other).createMatch("Brazil", "Argentina", deployTime)
      ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
    });
  });

  describe("Admin", function () {
    it("Should allow owner to update platform address", async function () {
      await factory.connect(owner).setPlatformAddress(other.address);
      expect(await factory.platformAddress()).to.equal(other.address);
    });

    it("Should reject zero address for platform", async function () {
      await expect(
        factory.connect(owner).setPlatformAddress(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should allow owner to update platform fee", async function () {
      await factory.connect(owner).setPlatformFee(500);
      expect(await factory.platformFeePercent()).to.equal(500);
    });

    it("Should reject fee above 20%", async function () {
      await expect(
        factory.connect(owner).setPlatformFee(2001)
      ).to.be.revertedWith("Fee too high");
    });
  });
});
