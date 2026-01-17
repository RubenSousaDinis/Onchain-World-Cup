// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IWorldCupEventHub
 * @dev Interface for WorldCupEventHub contract
 */
interface IWorldCupEventHub {
    function authorizedMatches(address matchAddress) external view returns (bool);
    function allMatches(uint256 index) external view returns (address);
    function getMatchCount() external view returns (uint256);
    function getAllMatches() external view returns (address[] memory);
    function isAuthorized(address matchAddress) external view returns (bool);
    
    function authorizeMatch(address matchAddress) external;
    function deauthorizeMatch(address matchAddress) external;
    function logMatchCreated(string memory team1Name, string memory team2Name, uint256 matchStartTime) external;
    function logVotePlaced(address voter, uint8 teamIndex, uint256 voteCount, uint256 totalCost, uint256 platformFee, uint256 prizePoolAmount) external;
    function logMatchFinalized(uint8 winningTeam, uint256 team1TotalETH, uint256 team2TotalETH, uint256 totalPrizePool) external;
    function logWinningsWithdrawn(address voter, uint256 amount, uint256 voteCount) external;
    function logPlatformFeeTransferred(address platformAddress, uint256 amount) external;

    event GlobalMatchCreated(
        address indexed matchAddress,
        string team1Name,
        string team2Name,
        uint256 matchStartTime,
        uint256 indexed matchId
    );
    event GlobalVotePlaced(
        address indexed matchAddress,
        address indexed voter,
        uint8 indexed teamIndex,
        uint256 voteCount,
        uint256 totalCost,
        uint256 platformFee,
        uint256 prizePoolAmount
    );
    event GlobalMatchFinalized(
        address indexed matchAddress,
        uint8 indexed winningTeam,
        uint256 team1TotalETH,
        uint256 team2TotalETH,
        uint256 totalPrizePool
    );
    event GlobalWinningsWithdrawn(
        address indexed matchAddress,
        address indexed voter,
        uint256 amount,
        uint256 voteCount
    );
    event GlobalPlatformFeeTransferred(
        address indexed matchAddress,
        address indexed platformAddress,
        uint256 amount
    );
    event MatchAuthorized(address indexed matchAddress);
    event MatchDeauthorized(address indexed matchAddress);
}
