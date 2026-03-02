// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WorldCupEventHub
 * @dev Unified event logging for all WorldCup matches
 * All matches emit events through this contract for easy querying
 * Deploy once, all matches reference this address
 */
contract WorldCupEventHub is Ownable {
    // Registry of authorized match contracts
    mapping(address => bool) public authorizedMatches;
    address[] public allMatches;

    // Global events emitted by all matches
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

    event GlobalReferralPaid(
        address indexed contractAddress,
        address indexed referrer,
        address indexed voter,
        uint256 amount
    );

    event MatchAuthorized(address indexed matchAddress);
    event MatchDeauthorized(address indexed matchAddress);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Authorize a match contract to emit events
     * @param matchAddress Address of the match contract
     */
    function authorizeMatch(address matchAddress) external onlyOwner {
        require(matchAddress != address(0), "Invalid match address");
        require(!authorizedMatches[matchAddress], "Already authorized");

        authorizedMatches[matchAddress] = true;
        allMatches.push(matchAddress);

        emit MatchAuthorized(matchAddress);
    }

    /**
     * @dev Deauthorize a match contract (in case of emergency)
     * @param matchAddress Address of the match contract
     */
    function deauthorizeMatch(address matchAddress) external onlyOwner {
        require(authorizedMatches[matchAddress], "Not authorized");
        authorizedMatches[matchAddress] = false;

        emit MatchDeauthorized(matchAddress);
    }

    /**
     * @dev Log match creation
     * Called by match contract in constructor
     */
    function logMatchCreated(
        string memory team1Name,
        string memory team2Name,
        uint256 matchStartTime
    ) external {
        require(authorizedMatches[msg.sender], "Not authorized");

        emit GlobalMatchCreated(
            msg.sender,
            team1Name,
            team2Name,
            matchStartTime,
            allMatches.length - 1
        );
    }

    /**
     * @dev Log vote placement
     * Called by match contract when vote is placed
     */
    function logVotePlaced(
        address voter,
        uint8 teamIndex,
        uint256 voteCount,
        uint256 totalCost,
        uint256 platformFee,
        uint256 prizePoolAmount
    ) external {
        require(authorizedMatches[msg.sender], "Not authorized");

        emit GlobalVotePlaced(
            msg.sender,
            voter,
            teamIndex,
            voteCount,
            totalCost,
            platformFee,
            prizePoolAmount
        );
    }

    /**
     * @dev Log match finalization
     * Called by match contract when finalized
     */
    function logMatchFinalized(
        uint8 winningTeam,
        uint256 team1TotalETH,
        uint256 team2TotalETH,
        uint256 totalPrizePool
    ) external {
        require(authorizedMatches[msg.sender], "Not authorized");

        emit GlobalMatchFinalized(
            msg.sender,
            winningTeam,
            team1TotalETH,
            team2TotalETH,
            totalPrizePool
        );
    }

    /**
     * @dev Log winnings withdrawal
     * Called by match contract when user withdraws
     */
    function logWinningsWithdrawn(
        address voter,
        uint256 amount,
        uint256 voteCount
    ) external {
        require(authorizedMatches[msg.sender], "Not authorized");

        emit GlobalWinningsWithdrawn(msg.sender, voter, amount, voteCount);
    }

    /**
     * @dev Log platform fee transfer
     * Called by match contract when fee is sent
     */
    function logPlatformFeeTransferred(
        address platformAddress,
        uint256 amount
    ) external {
        require(authorizedMatches[msg.sender], "Not authorized");

        emit GlobalPlatformFeeTransferred(msg.sender, platformAddress, amount);
    }

    /**
     * @dev Log referral payment
     * Called by match/qualification contract when referral fee is paid
     */
    function logReferralPaid(
        address referrer,
        address voter,
        uint256 amount
    ) external {
        require(authorizedMatches[msg.sender], "Not authorized");

        emit GlobalReferralPaid(msg.sender, referrer, voter, amount);
    }

    /**
     * @dev Get total number of matches
     */
    function getMatchCount() external view returns (uint256) {
        return allMatches.length;
    }

    /**
     * @dev Get all match addresses
     */
    function getAllMatches() external view returns (address[] memory) {
        return allMatches;
    }

    /**
     * @dev Check if a match is authorized
     */
    function isAuthorized(address matchAddress) external view returns (bool) {
        return authorizedMatches[matchAddress];
    }
}
