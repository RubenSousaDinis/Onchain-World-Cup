// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WorldCupNFT
 * @dev NFT contract for minting milestone achievements and match result NFTs
 * Supports two types: Milestone NFTs and Match Result NFTs
 * Updated for OpenZeppelin v5.0+ (removed deprecated Counters library)
 */
contract WorldCupNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    enum NFTType { MILESTONE, MATCH_RESULT }
    
    struct NFTMetadata {
        NFTType nftType;
        uint256 mintedAt;
        string data; // JSON string with milestone or match data
    }
    
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public userNFTs;
    
    // Events
    event MilestoneNFTMinted(address indexed user, uint256 indexed tokenId, string milestoneId);
    event MatchResultNFTMinted(address indexed user, uint256 indexed tokenId, string matchId);
    
    constructor() ERC721("Onchain World Cup 2026", "OWC26") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a milestone achievement NFT
     * @param to Address to mint to
     * @param tokenURI IPFS URI for the NFT metadata
     * @param milestoneData JSON string with milestone information
     */
    function mintMilestoneNFT(
        address to,
        string memory tokenURI,
        string memory milestoneData
    ) public returns (uint256) {
        uint256 newTokenId = ++_tokenIdCounter;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        nftMetadata[newTokenId] = NFTMetadata({
            nftType: NFTType.MILESTONE,
            mintedAt: block.timestamp,
            data: milestoneData
        });

        userNFTs[to].push(newTokenId);

        emit MilestoneNFTMinted(to, newTokenId, milestoneData);

        return newTokenId;
    }
    
    /**
     * @dev Mint a match result NFT
     * @param to Address to mint to
     * @param tokenURI IPFS URI for the NFT metadata
     * @param matchData JSON string with match result information
     */
    function mintMatchResultNFT(
        address to,
        string memory tokenURI,
        string memory matchData
    ) public returns (uint256) {
        uint256 newTokenId = ++_tokenIdCounter;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        nftMetadata[newTokenId] = NFTMetadata({
            nftType: NFTType.MATCH_RESULT,
            mintedAt: block.timestamp,
            data: matchData
        });

        userNFTs[to].push(newTokenId);

        emit MatchResultNFTMinted(to, newTokenId, matchData);

        return newTokenId;
    }
    
    /**
     * @dev Get all NFTs owned by a user
     */
    function getUserNFTs(address user) public view returns (uint256[] memory) {
        return userNFTs[user];
    }
    
    /**
     * @dev Get NFT metadata
     */
    function getNFTMetadata(uint256 tokenId) public view returns (NFTMetadata memory) {
        require(ownerOf(tokenId) != address(0), "NFT does not exist");
        return nftMetadata[tokenId];
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
