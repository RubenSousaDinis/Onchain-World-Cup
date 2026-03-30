// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title MatchNFT
 * @dev ERC721 NFT contract for minting Onchain World Cup 2026 match result NFTs.
 * Mints require a valid signature from the authorizedSigner (backend).
 */
contract MatchNFT is ERC721URIStorage, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    uint256 private _tokenIdCounter;

    address public authorizedSigner;

    struct NFTMetadata {
        uint256 mintedAt;
        string data;
    }

    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public userNFTs;
    mapping(address => mapping(string => bool)) public hasMinted;

    event NFTMinted(address indexed user, uint256 indexed tokenId, string tokenURI);
    event AuthorizedSignerUpdated(address indexed oldSigner, address indexed newSigner);

    constructor(address _authorizedSigner) ERC721("OWC26 Match Results", "OWC26M") Ownable(msg.sender) {
        require(_authorizedSigner != address(0), "Invalid signer");
        authorizedSigner = _authorizedSigner;
    }

    function setAuthorizedSigner(address _authorizedSigner) external onlyOwner {
        require(_authorizedSigner != address(0), "Invalid signer");
        emit AuthorizedSignerUpdated(authorizedSigner, _authorizedSigner);
        authorizedSigner = _authorizedSigner;
    }

    function mint(
        address to,
        string memory _tokenURI,
        string memory matchId,
        string memory metadata,
        bytes memory signature
    ) public returns (uint256) {
        require(!hasMinted[to][matchId], "Already minted for this match");

        bytes32 messageHash = keccak256(abi.encodePacked(to, matchId, _tokenURI, address(this)));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address recovered = ethSignedHash.recover(signature);
        require(recovered == authorizedSigner, "Invalid signature");

        hasMinted[to][matchId] = true;

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
     * @dev Override to keep userNFTs in sync with transfers
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);

        // Remove from sender's list
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

        // Add to receiver's list (skip burns)
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
