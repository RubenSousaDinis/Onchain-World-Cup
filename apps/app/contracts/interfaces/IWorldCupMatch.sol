// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IWorldCupMatch
 * @dev Interface for WorldCupMatch contract
 */
interface IWorldCupMatch {
    // Match details
    function team1Name() external view returns (string memory);
    function team2Name() external view returns (string memory);
    function matchStartTime() external view returns (uint256);
    function votingEndTime() external view returns (uint256);
    function matchEndTime() external view returns (uint256);

    // Vote tracking
    function team1VoteCount() external view returns (uint256);
    function team2VoteCount() external view returns (uint256);
    function team1TotalETH() external view returns (uint256);
    function team2TotalETH() external view returns (uint256);
    function userVoteCount(address voter, uint8 teamIndex) external view returns (uint256);
    function userETH(address voter, uint8 teamIndex) external view returns (uint256);

    // Platform fee
    function platformAddress() external view returns (address);
    function platformFeePercent() external view returns (uint256);
    function totalPlatformFeesCollected() external view returns (uint256);

    // Phase tracking
    function getCurrentPhase() external view returns (uint8);
    function getPhase1Details() external view returns (
        uint256 team1Votes,
        uint256 team2Votes,
        bool ended
    );

    // Winner tracking
    function matchFinalized() external view returns (bool);
    function winningTeam() external view returns (uint8);

    // Functions
    function calculateVotePrice(uint8 teamIndex) external view returns (uint256);
    function calculateVotePriceAt(uint8 teamIndex, uint256 atVoteCount) external view returns (uint256);
    function vote(uint8 teamIndex, uint256 numVotes) external payable;
    function calculateWinnings(address voter) external view returns (uint256);
    function withdrawWinnings() external;
    function getTotalPrizePool() external view returns (uint256);
    function getMatchDetails() external view returns (
        string memory _team1Name,
        string memory _team2Name,
        uint256 _team1Votes,
        uint256 _team2Votes,
        uint256 _team1ETH,
        uint256 _team2ETH,
        uint256 _totalPrizePool,
        uint256 _totalPlatformFees,
        uint8 _currentPhase,
        bool _isFinalized,
        string memory _winner
    );
    function getUserVoteStats(address user) external view returns (
        uint256 team1Votes,
        uint256 team2Votes,
        uint256 team1ETH,
        uint256 team2ETH,
        uint256 potentialWinnings
    );
    function getVoterCount() external view returns (uint256);

    // Events
    event VotesPlaced(
        address indexed voter,
        uint8 indexed teamIndex,
        uint256 voteCount,
        uint256 totalCost,
        uint256 platformFee,
        uint256 prizePoolAmount
    );
    event MatchFinalized(uint8 indexed winningTeam, uint256 team1Total, uint256 team2Total);
    event WinningsWithdrawn(address indexed voter, uint256 amount, uint256 voteCount);
    event PlatformFeeTransferred(address indexed platform, uint256 amount);
}
