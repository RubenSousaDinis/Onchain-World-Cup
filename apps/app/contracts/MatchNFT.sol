// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MatchNFT
 * @dev ERC721 NFT contract for minting Onchain World Cup 2026 match result NFTs.
 * Single mint() function accepting a tokenURI pointing to ERC-721 compliant JSON metadata.
 */
contract MatchNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    struct NFTMetadata {
        uint256 mintedAt;
        string data; // JSON string with match result data
    }

    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public userNFTs;

    event NFTMinted(address indexed user, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("CWC26 Match Results", "CWC26M") Ownable(msg.sender) {}

    /**
     * @dev Mint a match result NFT
     * @param to Address to mint to
     * @param _tokenURI URL pointing to ERC-721 JSON metadata
     * @param metadata JSON string with match result data stored on-chain
     */
    function mint(
        address to,
        string memory _tokenURI,
        string memory metadata
    ) public returns (uint256) {
        uint256 newTokenId = ++_tokenIdCounter;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        nftMetadata[newTokenId] = NFTMetadata({
            mintedAt: block.timestamp,
            data: metadata
        });

        userNFTs[to].push(newTokenId);

        emit NFTMinted(to, newTokenId, _tokenURI);

        return newTokenId;
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
