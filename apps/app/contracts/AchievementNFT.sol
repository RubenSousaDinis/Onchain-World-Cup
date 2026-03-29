// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title AchievementNFT
 * @dev ERC721 NFT contract for minting Onchain World Cup 2026 achievement milestone NFTs.
 * Mint fee (0.001 ETH) is forwarded directly to feeRecipient on each mint.
 * Mints require a valid signature from the authorizedSigner (backend).
 */
contract AchievementNFT is ERC721URIStorage, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    uint256 public constant MINT_PRICE = 0.001 ether;
    uint256 private _tokenIdCounter;

    address public feeRecipient;
    address public authorizedSigner;

    struct NFTMetadata {
        uint256 mintedAt;
        string data;
    }

    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public userNFTs;
    mapping(address => mapping(string => uint256)) public mintCount;

    event NFTMinted(address indexed user, uint256 indexed tokenId, string tokenURI);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event AuthorizedSignerUpdated(address indexed oldSigner, address indexed newSigner);

    constructor(address _feeRecipient, address _authorizedSigner) ERC721("OWC26 Achievements", "OWC26A") Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        require(_authorizedSigner != address(0), "Invalid signer");
        feeRecipient = _feeRecipient;
        authorizedSigner = _authorizedSigner;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        emit FeeRecipientUpdated(feeRecipient, _feeRecipient);
        feeRecipient = _feeRecipient;
    }

    function setAuthorizedSigner(address _authorizedSigner) external onlyOwner {
        require(_authorizedSigner != address(0), "Invalid signer");
        emit AuthorizedSignerUpdated(authorizedSigner, _authorizedSigner);
        authorizedSigner = _authorizedSigner;
    }

    function mint(
        address to,
        string memory _tokenURI,
        string memory achievementId,
        string memory metadata,
        bytes memory signature
    ) public payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient payment: 0.001 ETH required");
        require(mintCount[to][achievementId] == 0, "Already minted this achievement");

        bytes32 messageHash = keccak256(abi.encodePacked(to, achievementId, _tokenURI, address(this)));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address recovered = ethSignedHash.recover(signature);
        require(recovered == authorizedSigner, "Invalid signature");

        (bool ok, ) = feeRecipient.call{value: MINT_PRICE}("");
        require(ok, "Fee transfer failed");

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
