const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AchievementNFT", function () {
  let achievementNFT;
  let owner, signer, user1, user2, feeRecipient;

  const MINT_PRICE = ethers.parseEther("0.001");

  // Helper: sign a mint message
  const signMint = async (signerWallet, to, achievementId, tokenURI, contractAddress) => {
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "string", "string", "address"],
      [to, achievementId, tokenURI, contractAddress]
    );
    const signature = await signerWallet.signMessage(ethers.getBytes(messageHash));
    return signature;
  };

  beforeEach(async function () {
    [owner, signer, user1, user2, feeRecipient] = await ethers.getSigners();

    const AchievementNFT = await ethers.getContractFactory("AchievementNFT");
    achievementNFT = await AchievementNFT.deploy(feeRecipient.address, signer.address);
    await achievementNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct fee recipient", async function () {
      expect(await achievementNFT.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("Should set the correct authorized signer", async function () {
      expect(await achievementNFT.authorizedSigner()).to.equal(signer.address);
    });
  });

  describe("Signed Minting", function () {
    const achievementId = "first-100-voters";
    const tokenURI = "ipfs://QmTest123";
    const metadata = '{"achievement":"First 100 Voters"}';

    it("Should mint with valid signature", async function () {
      const contractAddress = await achievementNFT.getAddress();
      const signature = await signMint(signer, user1.address, achievementId, tokenURI, contractAddress);

      await expect(
        achievementNFT.connect(user1).mint(user1.address, tokenURI, achievementId, metadata, signature, {
          value: MINT_PRICE,
        })
      ).to.emit(achievementNFT, "NFTMinted");

      expect(await achievementNFT.totalSupply()).to.equal(1);
      expect(await achievementNFT.ownerOf(1)).to.equal(user1.address);
    });

    it("Should reject mint with invalid signature", async function () {
      const contractAddress = await achievementNFT.getAddress();
      const badSignature = await signMint(user2, user1.address, achievementId, tokenURI, contractAddress);

      await expect(
        achievementNFT.connect(user1).mint(user1.address, tokenURI, achievementId, metadata, badSignature, {
          value: MINT_PRICE,
        })
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should reject duplicate mint for same user + achievementId", async function () {
      const contractAddress = await achievementNFT.getAddress();
      const signature = await signMint(signer, user1.address, achievementId, tokenURI, contractAddress);

      await achievementNFT.connect(user1).mint(user1.address, tokenURI, achievementId, metadata, signature, {
        value: MINT_PRICE,
      });

      await expect(
        achievementNFT.connect(user1).mint(user1.address, tokenURI, achievementId, metadata, signature, {
          value: MINT_PRICE,
        })
      ).to.be.revertedWith("Already minted this achievement");
    });

    it("Should allow different users to mint same achievementId", async function () {
      const contractAddress = await achievementNFT.getAddress();

      const sig1 = await signMint(signer, user1.address, achievementId, tokenURI, contractAddress);
      const sig2 = await signMint(signer, user2.address, achievementId, tokenURI, contractAddress);

      await achievementNFT.connect(user1).mint(user1.address, tokenURI, achievementId, metadata, sig1, {
        value: MINT_PRICE,
      });
      await achievementNFT.connect(user2).mint(user2.address, tokenURI, achievementId, metadata, sig2, {
        value: MINT_PRICE,
      });

      expect(await achievementNFT.totalSupply()).to.equal(2);
    });

    it("Should reject cross-contract signature replay", async function () {
      const fakeAddress = user2.address;
      const signature = await signMint(signer, user1.address, achievementId, tokenURI, fakeAddress);

      await expect(
        achievementNFT.connect(user1).mint(user1.address, tokenURI, achievementId, metadata, signature, {
          value: MINT_PRICE,
        })
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should forward fee to feeRecipient", async function () {
      const contractAddress = await achievementNFT.getAddress();
      const signature = await signMint(signer, user1.address, achievementId, tokenURI, contractAddress);

      const balanceBefore = await ethers.provider.getBalance(feeRecipient.address);
      await achievementNFT.connect(user1).mint(user1.address, tokenURI, achievementId, metadata, signature, {
        value: MINT_PRICE,
      });
      const balanceAfter = await ethers.provider.getBalance(feeRecipient.address);

      expect(balanceAfter - balanceBefore).to.equal(MINT_PRICE);
    });

    it("Should reject insufficient payment", async function () {
      const contractAddress = await achievementNFT.getAddress();
      const signature = await signMint(signer, user1.address, achievementId, tokenURI, contractAddress);

      await expect(
        achievementNFT.connect(user1).mint(user1.address, tokenURI, achievementId, metadata, signature, {
          value: ethers.parseEther("0.0005"),
        })
      ).to.be.revertedWith("Insufficient payment: 0.001 ETH required");
    });
  });

  describe("Admin", function () {
    it("Should allow owner to update authorized signer", async function () {
      await achievementNFT.connect(owner).setAuthorizedSigner(user2.address);
      expect(await achievementNFT.authorizedSigner()).to.equal(user2.address);
    });

    it("Should reject non-owner updating signer", async function () {
      await expect(
        achievementNFT.connect(user1).setAuthorizedSigner(user2.address)
      ).to.be.revertedWithCustomError(achievementNFT, "OwnableUnauthorizedAccount");
    });

    it("Should reject zero address signer", async function () {
      await expect(
        achievementNFT.connect(owner).setAuthorizedSigner(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid signer");
    });
  });
});
