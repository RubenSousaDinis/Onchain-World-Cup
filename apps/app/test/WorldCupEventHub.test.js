const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WorldCupEventHub", function () {
  let eventHub;
  let owner, factory, other;

  beforeEach(async function () {
    [owner, factory, other] = await ethers.getSigners();

    const EventHub = await ethers.getContractFactory("WorldCupEventHub");
    eventHub = await EventHub.deploy();
    await eventHub.waitForDeployment();
  });

  describe("Authorized Factory", function () {
    it("Should allow owner to set authorized factory", async function () {
      await eventHub.connect(owner).setAuthorizedFactory(factory.address);
      expect(await eventHub.authorizedFactory()).to.equal(factory.address);
    });

    it("Should emit AuthorizedFactoryUpdated event", async function () {
      await expect(eventHub.connect(owner).setAuthorizedFactory(factory.address))
        .to.emit(eventHub, "AuthorizedFactoryUpdated")
        .withArgs(ethers.ZeroAddress, factory.address);
    });

    it("Should reject non-owner setting factory", async function () {
      await expect(
        eventHub.connect(other).setAuthorizedFactory(factory.address)
      ).to.be.revertedWithCustomError(eventHub, "OwnableUnauthorizedAccount");
    });

    it("Should allow factory to authorize matches", async function () {
      await eventHub.connect(owner).setAuthorizedFactory(factory.address);

      await expect(eventHub.connect(factory).authorizeMatch(other.address))
        .to.emit(eventHub, "MatchAuthorized")
        .withArgs(other.address);

      expect(await eventHub.isAuthorized(other.address)).to.be.true;
    });

    it("Should still allow owner to authorize matches", async function () {
      await eventHub.connect(owner).setAuthorizedFactory(factory.address);

      await eventHub.connect(owner).authorizeMatch(other.address);
      expect(await eventHub.isAuthorized(other.address)).to.be.true;
    });

    it("Should reject unauthorized address from authorizing matches", async function () {
      await eventHub.connect(owner).setAuthorizedFactory(factory.address);

      await expect(
        eventHub.connect(other).authorizeMatch(factory.address)
      ).to.be.revertedWith("Not authorized");
    });
  });
});
