// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IWorldCupQualification
 * @dev Interface for WorldCupQualification contract
 */
interface IWorldCupQualification {
    // Constants
    function BASE_PRICE() external view returns (uint256);
    function PRICE_INCREMENT() external view returns (uint256);
    function MAX_PLATFORM_FEE_BPS() external view returns (uint256);
    function MAX_VOTES_PER_TX() external view returns (uint256);
    function QUALIFICATION_SPOTS() external view returns (uint256);

    // Immutables
    function qualificationEndTime() external view returns (uint256);
    function feeRecipient() external view returns (address);

    // State
    function qualificationFinalized() external view returns (bool);
    function totalVotes() external view returns (uint256);
    function totalQualifiedVotes() external view returns (uint256);
    function totalPrizePool() external view returns (uint256);
    function totalPlatformFees() external view returns (uint256);
    function platformFeeBps() external view returns (uint256);

    // Country data
    function validCountry(bytes2 country) external view returns (bool);
    function countryVotes(bytes2 country) external view returns (uint256);
    function isQualified(bytes2 country) external view returns (bool);

    // User data
    function userVotes(address voter, bytes2 country) external view returns (uint256);
    function hasClaimed(address voter) external view returns (bool);

    // Admin functions
    function addCountry(bytes2 country) external;
    function addCountries(bytes2[] calldata countries) external;
    function removeCountry(bytes2 country) external;
    function setPlatformFee(uint256 newFeeBps) external;

    // Pricing
    function votePrice(bytes2 country) external view returns (uint256);
    function calculateVoteCost(bytes2 country, uint256 votes) external view returns (uint256);

    // Voting
    function vote(bytes2 country, uint256 votes) external payable;

    // Finalization
    function finalizeQualification(bytes2[] calldata qualifiedCountries) external;

    // Claiming
    function claimable(address user) external view returns (uint256);
    function claim() external;

    // Platform fees
    function withdrawPlatformFees() external;

    // View helpers
    function ethForCountry(bytes2 country) external view returns (uint256);
    function getUserVotes(address user) external view returns (bytes2[] memory countries, uint256[] memory votes);
    function getQualificationDetails() external view returns (
        uint256 _totalPrizePool,
        uint256 _qualificationEndTime,
        uint8 _qualificationSpots,
        bool _isFinalized,
        uint256 _totalVoters
    );

    // Events
    event VotePlaced(
        address indexed voter,
        bytes2 indexed country,
        uint256 votes,
        uint256 cost,
        uint256 timestamp
    );
    
    event CountryAdded(bytes2 country);
    event CountryRemoved(bytes2 country);
    event PlatformFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event QualificationEnded();
    event QualificationFinalized(bytes2[] qualifiedCountries);
    event WinningsClaimed(address indexed user, uint256 amount);
    event PlatformFeesWithdrawn(uint256 amount);
    event PrizesDistributed(uint256 totalPrizePool);
}
