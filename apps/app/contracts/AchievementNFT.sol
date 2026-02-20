// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AchievementNFT
 * @dev ERC721 NFT contract for minting Onchain World Cup 2026 achievement milestone NFTs.
 * Single mint() function accepting a tokenURI pointing to ERC-721 compliant JSON metadata.
 * Mint fee (0.001 ETH) is forwarded directly to feeRecipient on each mint.
 */
contract AchievementNFT is ERC721URIStorage, Ownable {
    uint256 public constant MINT_PRICE = 0.001 ether;
    uint256 private _tokenIdCounter;

    address public feeRecipient;

    struct NFTMetadata {
        uint256 mintedAt;
        string data; // JSON string with achievement data
    }

    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public userNFTs;
    mapping(address => mapping(string => uint256)) public mintCount; // user => achievementId => number of times minted

    event NFTMinted(address indexed user, uint256 indexed tokenId, string tokenURI);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);

    constructor(address _feeRecipient) ERC721("OWC26 Achievements", "OWC26A") Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Update the fee recipient address
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        emit FeeRecipientUpdated(feeRecipient, _feeRecipient);
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Mint an achievement NFT. Forwards 0.001 ETH to feeRecipient.
     * Each address can only mint each achievementId once.
     * @param to Address to mint to
     * @param _tokenURI URL pointing to ERC-721 JSON metadata
     * @param achievementId Unique identifier for the achievement (prevents duplicate mints)
     * @param metadata JSON string with achievement data stored on-chain
     */
    function mint(
        address to,
        string memory _tokenURI,
        string memory achievementId,
        string memory metadata
    ) public payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient payment: 0.001 ETH required");

        (bool ok, ) = feeRecipient.call{value: MINT_PRICE}("");
        require(ok, "Fee transfer failed");

        // Refund overpayment
        if (msg.value > MINT_PRICE) {
            (bool refundOk, ) = msg.sender.call{value: msg.value - MINT_PRICE}("");
            require(refundOk, "Refund failed");
        }

        uint256 newTokenId = ++_tokenIdCounter;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        nftMetadata[newTokenId] = NFTMetadata({
            mintedAt: block.timestamp,
            data: metadata
        });

        userNFTs[to].push(newTokenId);
        mintCount[to][achievementId]++;

        emit NFTMinted(to, newTokenId, _tokenURI);

        return newTokenId;
    }

    /**
     * @dev Override to keep userNFTs in sync with transfers
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);

        if (from != address(0)) {
            uint256[] storage fromNFTs = userNFTs[from];
            for (uint256 i = 0; i < fromNFTs.length; i++) {
                if (fromNFTs[i] == tokenId) {
                    fromNFTs[i] = fromNFTs[fromNFTs.length - 1];
                    fromNFTs.pop();
                    break;
                }
            }
        }

        if (to != address(0) && from != address(0)) {
            userNFTs[to].push(tokenId);
        }

        return from;
    }

    /**
     * @dev Get all NFT token IDs owned by a user
     */
    function getUserNFTs(address user) public view returns (uint256[] memory) {
        return userNFTs[user];
    }

    /**
     * @dev Get metadata stored on-chain for a token
     */
    function getNFTMetadata(uint256 tokenId) public view returns (NFTMetadata memory) {
        require(ownerOf(tokenId) != address(0), "NFT does not exist");
        return nftMetadata[tokenId];
    }

    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
