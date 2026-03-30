const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MatchNFT", function () {
  let matchNFT;
  let owner, signer, user1, user2;

  const signMint = async (signerWallet, to, matchId, tokenURI, contractAddress) => {
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "string", "string", "address"],
      [to, matchId, tokenURI, contractAddress]
    );
    const signature = await signerWallet.signMessage(ethers.getBytes(messageHash));
    return signature;
  };

  beforeEach(async function () {
    [owner, signer, user1, user2] = await ethers.getSigners();

    const MatchNFT = await ethers.getContractFactory("MatchNFT");
    matchNFT = await MatchNFT.deploy(signer.address);
    await matchNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct authorized signer", async function () {
      expect(await matchNFT.authorizedSigner()).to.equal(signer.address);
    });
  });

  describe("Signed Minting", function () {
    const matchId = "match-brazil-argentina-2026-06-15";
    const tokenURI = "ipfs://QmMatchResult123";
    const metadata = '{"match":"Brazil vs Argentina","winner":"Brazil"}';

    it("Should mint with valid signature", async function () {
      const contractAddress = await matchNFT.getAddress();
      const signature = await signMint(signer, user1.address, matchId, tokenURI, contractAddress);

      await expect(
        matchNFT.connect(user1).mint(user1.address, tokenURI, matchId, metadata, signature)
      ).to.emit(matchNFT, "NFTMinted");

      expect(await matchNFT.totalSupply()).to.equal(1);
      expect(await matchNFT.ownerOf(1)).to.equal(user1.address);
    });

    it("Should reject mint with invalid signature", async function () {
      const contractAddress = await matchNFT.getAddress();
      const badSignature = await signMint(user2, user1.address, matchId, tokenURI, contractAddress);

      await expect(
        matchNFT.connect(user1).mint(user1.address, tokenURI, matchId, metadata, badSignature)
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should reject duplicate mint for same user + matchId", async function () {
      const contractAddress = await matchNFT.getAddress();
      const signature = await signMint(signer, user1.address, matchId, tokenURI, contractAddress);

      await matchNFT.connect(user1).mint(user1.address, tokenURI, matchId, metadata, signature);

      await expect(
        matchNFT.connect(user1).mint(user1.address, tokenURI, matchId, metadata, signature)
      ).to.be.revertedWith("Already minted for this match");
    });

    it("Should allow different users to mint same matchId", async function () {
      const contractAddress = await matchNFT.getAddress();

      const sig1 = await signMint(signer, user1.address, matchId, tokenURI, contractAddress);
      const sig2 = await signMint(signer, user2.address, matchId, tokenURI, contractAddress);

      await matchNFT.connect(user1).mint(user1.address, tokenURI, matchId, metadata, sig1);
      await matchNFT.connect(user2).mint(user2.address, tokenURI, matchId, metadata, sig2);

      expect(await matchNFT.totalSupply()).to.equal(2);
    });

    it("Should reject cross-contract signature replay", async function () {
      const fakeAddress = user2.address;
      const signature = await signMint(signer, user1.address, matchId, tokenURI, fakeAddress);

      await expect(
        matchNFT.connect(user1).mint(user1.address, tokenURI, matchId, metadata, signature)
      ).to.be.revertedWith("Invalid signature");
    });
  });

  describe("Admin", function () {
    it("Should allow owner to update authorized signer", async function () {
      await matchNFT.connect(owner).setAuthorizedSigner(user2.address);
      expect(await matchNFT.authorizedSigner()).to.equal(user2.address);
    });

    it("Should reject non-owner updating signer", async function () {
      await expect(
        matchNFT.connect(user1).setAuthorizedSigner(user2.address)
      ).to.be.revertedWithCustomError(matchNFT, "OwnableUnauthorizedAccount");
    });

    it("Should reject zero address signer", async function () {
      await expect(
        matchNFT.connect(owner).setAuthorizedSigner(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid signer");
    });
  });
});
