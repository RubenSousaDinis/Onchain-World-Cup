// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IWorldCupEventHub
 * @dev Interface for WorldCupEventHub contract
 */
interface IWorldCupEventHub {
    function logMatchCreated(string memory team1Name, string memory team2Name, uint256 matchStartTime) external;
    function logVotePlaced(address voter, uint8 teamIndex, uint256 voteCount, uint256 totalCost, uint256 platformFee, uint256 prizePoolAmount) external;
    function logMatchFinalized(uint8 winningTeam, uint256 team1TotalETH, uint256 team2TotalETH, uint256 totalPrizePool) external;
    function logWinningsWithdrawn(address voter, uint256 amount, uint256 voteCount) external;
    function logPlatformFeeTransferred(address platformAddress, uint256 amount) external;
}

/**
 * @title WorldCupMatch
 * @dev Smart contract for ETH-based voting/betting on World Cup matches
 * Features 2-phase time-based pricing:
 * - Phase 1 (0-2 hours): Linear price increase (0.001 + voteCount × 0.0001)
 * - Phase 2 (2-24 hours): Exponential price increase (phase1EndPrice × 1.1^voteCount)
 * Winner determined by most ETH voted. Prize pool distributed proportional to VOTE COUNT.
 *
 * IMPORTANT: Payouts are based on NUMBER OF VOTES, not ETH amount.
 * Early voters benefit by getting more votes at lower prices.
 *
 * FEATURES:
 * - Multiple votes in single transaction (batch voting)
 * - Platform fee transferred immediately on vote
 * - Auto-finalize on first withdrawal
 * - Owner can update platform address and fee
 * - Emergency pause capability
 * - Unified event logging through EventHub
 */
contract WorldCupMatch is Ownable {
    // Event Hub for unified logging
    IWorldCupEventHub public immutable eventHub;

    // Match details
    string public team1Name;
    string public team2Name;
    uint256 public matchStartTime;
    uint256 public votingEndTime;
    uint256 public matchEndTime;

    // Vote count tracking (critical for payouts)
    uint256 public team1VoteCount;
    uint256 public team2VoteCount;
    mapping(address => mapping(uint8 => uint256)) public userVoteCount;

    // ETH tracking (prize pool only, platform fee sent immediately)
    uint256 public team1TotalETH;
    uint256 public team2TotalETH;
    mapping(address => mapping(uint8 => uint256)) public userETH;

    // Platform fee tracking
    uint256 public totalPlatformFeesCollected;

    // Referral earnings
    mapping(address => uint256) public referrerEarnings;

    // Voter tracking
    address[] public voters;
    mapping(address => bool) public hasVoted;
    mapping(address => bool) public hasWithdrawn;

    // Phase 1 state tracking (per-team)
    uint256 public team1Phase1Votes;
    uint256 public team2Phase1Votes;
    bool public phase1Ended;

    // Configurable parameters (owner can update)
    address public platformAddress;
    uint256 public platformFeePercent; // Basis points (1000 = 10%)

    // Emergency controls
    bool public paused;

    // Constants
    uint256 public constant PHASE_1_DURATION = 2 hours;
    uint256 public constant TOTAL_VOTING_DURATION = 24 hours;
    uint256 public constant BASE_PRICE = 0.001 ether;
    uint256 public constant LINEAR_INCREMENT = 0.0001 ether;
    uint256 public constant MAX_VOTES_PER_TX = 100;
    uint256 public constant MAX_FEE_PERCENT = 2000; // Max 20%
    uint256 public constant REFERRAL_FEE_BPS = 100; // 1%

    // Winner tracking
    bool public matchFinalized;
    uint8 public winningTeam; // 0 for team1, 1 for team2, 255 for tie

    // Local events (also emitted globally via EventHub)
    event VotesPlaced(
        address indexed voter,
        uint8 indexed teamIndex,
        uint256 voteCount,
        uint256 totalCost,
        uint256 platformFee,
        uint256 prizePoolAmount
    );
    event ReferralPaid(address indexed referrer, address indexed voter, uint256 amount);
    event MatchFinalized(uint8 indexed winningTeam, uint256 team1Total, uint256 team2Total);
    event WinningsWithdrawn(address indexed voter, uint256 amount, uint256 voteCount);
    event PlatformFeeTransferred(address indexed platform, uint256 amount);
    event PlatformAddressUpdated(address indexed newPlatform);
    event PlatformFeeUpdated(uint256 newFeePercent);
    event Paused();
    event Unpaused();

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor(
        string memory _team1Name,
        string memory _team2Name,
        uint256 _deployTime,
        address _platformAddress,
        uint256 _platformFeePercent,
        address _eventHub
    ) Ownable(msg.sender) {
        require(_platformAddress != address(0), "Invalid platform address");
        require(bytes(_team1Name).length > 0, "Team 1 name required");
        require(bytes(_team2Name).length > 0, "Team 2 name required");
        require(_platformFeePercent <= MAX_FEE_PERCENT, "Fee too high");
        require(_eventHub != address(0), "Invalid EventHub address");

        team1Name = _team1Name;
        team2Name = _team2Name;
        matchStartTime = _deployTime;
        votingEndTime = _deployTime + TOTAL_VOTING_DURATION;
        matchEndTime = votingEndTime + 2 hours;
        platformAddress = _platformAddress;
        platformFeePercent = _platformFeePercent;
        eventHub = IWorldCupEventHub(_eventHub);
    }

    /**
     * @dev Get current pricing phase
     */
    function getCurrentPhase() public view returns (uint8) {
        if (block.timestamp >= votingEndTime) return 0;
        uint256 timeElapsed = block.timestamp - matchStartTime;
        if (timeElapsed <= PHASE_1_DURATION) {
            return 1;
        } else {
            return 2;
        }
    }

    /**
     * @dev Calculate price for a vote at specific vote count
     */
    function calculateVotePriceAt(uint8 teamIndex, uint256 atVoteCount) public view returns (uint256) {
        uint8 phase = getCurrentPhase();
        require(phase > 0, "Voting is closed");
        require(teamIndex == 0 || teamIndex == 1, "Invalid team index");

        if (phase == 1) {
            return BASE_PRICE + (atVoteCount * LINEAR_INCREMENT);
        } else {
            uint256 teamPhase1Votes;
            if (phase1Ended) {
                teamPhase1Votes = teamIndex == 0 ? team1Phase1Votes : team2Phase1Votes;
            } else {
                teamPhase1Votes = atVoteCount;
            }

            uint256 startPrice = BASE_PRICE + (teamPhase1Votes * LINEAR_INCREMENT);
            uint256 phase2Votes = atVoteCount > teamPhase1Votes ? atVoteCount - teamPhase1Votes : 0;

            uint256 price = startPrice;
            for (uint256 i = 0; i < phase2Votes; i++) {
                price = (price * 11) / 10;
                require(price < type(uint256).max / 11, "Price overflow");
            }

            return price;
        }
    }

    /**
     * @dev Calculate price for next vote
     */
    function calculateVotePrice(uint8 teamIndex) public view returns (uint256) {
        uint256 currentVoteCount = teamIndex == 0 ? team1VoteCount : team2VoteCount;
        return calculateVotePriceAt(teamIndex, currentVoteCount);
    }

    /**
     * @dev Place multiple votes for a team
     * @param teamIndex 0 for team1, 1 for team2
     * @param numVotes Number of votes to purchase (1-100)
     * @param referrer Address of referrer (address(0) for none)
     */
    function vote(uint8 teamIndex, uint256 numVotes, address referrer) external payable whenNotPaused {
        require(teamIndex == 0 || teamIndex == 1, "Invalid team index");
        require(getCurrentPhase() > 0, "Voting is closed");
        require(!matchFinalized, "Match already finalized");
        require(numVotes > 0 && numVotes <= MAX_VOTES_PER_TX, "Invalid vote count");

        uint8 currentPhase = getCurrentPhase();

        // Track phase transition
        if (currentPhase == 2 && !phase1Ended) {
            phase1Ended = true;
            team1Phase1Votes = team1VoteCount;
            team2Phase1Votes = team2VoteCount;
        }

        // Calculate total cost
        uint256 totalCost = 0;
        uint256 currentVoteCount = teamIndex == 0 ? team1VoteCount : team2VoteCount;

        for (uint256 i = 0; i < numVotes; i++) {
            uint256 votePrice = calculateVotePriceAt(teamIndex, currentVoteCount + i);
            totalCost += votePrice;
        }

        require(msg.value >= totalCost, "Insufficient payment");

        // Calculate fees
        uint256 platformFee = (totalCost * platformFeePercent) / 10000; // Basis points
        uint256 prizePoolAmount = totalCost - platformFee; // Prize pool unaffected by referral

        // Apply referral: 1% of cost to referrer, deducted from platform fee
        bool hasReferral = referrer != address(0) &&
            referrer != msg.sender &&
            platformFeePercent >= REFERRAL_FEE_BPS;

        if (hasReferral) {
            uint256 referralFee = (totalCost * REFERRAL_FEE_BPS) / 10000;
            platformFee -= referralFee;
            referrerEarnings[referrer] += referralFee;
            (bool refOk, ) = referrer.call{value: referralFee}("");
            require(refOk, "Referral transfer failed");
            emit ReferralPaid(referrer, msg.sender, referralFee);
        }

        // Transfer platform fee immediately
        if (platformFee > 0) {
            (bool feeSuccess, ) = platformAddress.call{value: platformFee}("");
            require(feeSuccess, "Platform fee transfer failed");
        }
        totalPlatformFeesCollected += platformFee;

        // Track voter
        if (!hasVoted[msg.sender]) {
            voters.push(msg.sender);
            hasVoted[msg.sender] = true;
        }

        // Increment vote counts
        userVoteCount[msg.sender][teamIndex] += numVotes;
        if (teamIndex == 0) {
            team1VoteCount += numVotes;
        } else {
            team2VoteCount += numVotes;
        }

        // Track prize pool ETH
        userETH[msg.sender][teamIndex] += prizePoolAmount;
        if (teamIndex == 0) {
            team1TotalETH += prizePoolAmount;
        } else {
            team2TotalETH += prizePoolAmount;
        }

        // Refund overpayment
        if (msg.value > totalCost) {
            uint256 refund = msg.value - totalCost;
            (bool refundSuccess, ) = msg.sender.call{value: refund}("");
            require(refundSuccess, "Refund failed");
        }

        // Emit local event
        emit VotesPlaced(msg.sender, teamIndex, numVotes, totalCost, platformFee, prizePoolAmount);

        // Log to EventHub
        eventHub.logVotePlaced(msg.sender, teamIndex, numVotes, totalCost, platformFee, prizePoolAmount);
        eventHub.logPlatformFeeTransferred(platformAddress, platformFee);

        emit PlatformFeeTransferred(platformAddress, platformFee);
    }

    /**
     * @dev Internal finalize function (called automatically on first withdrawal)
     */
    function _finalizeMatch() internal {
        require(block.timestamp >= votingEndTime, "Voting not ended yet");
        require(!matchFinalized, "Match already finalized");

        matchFinalized = true;

        // Determine winner by total ETH
        if (team1TotalETH > team2TotalETH) {
            winningTeam = 0;
        } else if (team2TotalETH > team1TotalETH) {
            winningTeam = 1;
        } else {
            winningTeam = 255; // Tie
        }

        uint256 totalPrizePool = team1TotalETH + team2TotalETH;

        emit MatchFinalized(winningTeam, team1TotalETH, team2TotalETH);
        eventHub.logMatchFinalized(winningTeam, team1TotalETH, team2TotalETH, totalPrizePool);
    }

    /**
     * @dev Calculate winnings for a voter
     */
    function calculateWinnings(address voter) public view returns (uint256) {
        if (!matchFinalized) return 0;

        uint256 totalPrizePool = team1TotalETH + team2TotalETH;

        // Tie: full refund
        if (winningTeam == 255) {
            return userETH[voter][0] + userETH[voter][1];
        }

        uint256 voterVoteCount = userVoteCount[voter][winningTeam];
        if (voterVoteCount == 0) return 0;

        uint256 winningTeamVoteCount = winningTeam == 0 ? team1VoteCount : team2VoteCount;
        return (totalPrizePool * voterVoteCount) / winningTeamVoteCount;
    }

    /**
     * @dev Withdraw winnings (auto-finalizes if needed)
     */
    function withdrawWinnings() external whenNotPaused {
        require(block.timestamp >= votingEndTime, "Voting not ended yet");

        if (!matchFinalized) {
            _finalizeMatch();
        }

        require(!hasWithdrawn[msg.sender], "Already withdrawn");

        uint256 winnings = calculateWinnings(msg.sender);
        require(winnings > 0, "No winnings to withdraw");

        hasWithdrawn[msg.sender] = true;

        uint256 voterVoteCount = userVoteCount[msg.sender][0] + userVoteCount[msg.sender][1];

        (bool success, ) = msg.sender.call{value: winnings}("");
        require(success, "Withdrawal failed");

        emit WinningsWithdrawn(msg.sender, winnings, voterVoteCount);
        eventHub.logWinningsWithdrawn(msg.sender, winnings, voterVoteCount);
    }

    // ========== OWNER FUNCTIONS ==========

    /**
     * @dev Update platform address
     */
    function setPlatformAddress(address newPlatform) external onlyOwner {
        require(newPlatform != address(0), "Invalid address");
        platformAddress = newPlatform;
        emit PlatformAddressUpdated(newPlatform);
    }

    /**
     * @dev Update platform fee (max 20%)
     */
    function setPlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= MAX_FEE_PERCENT, "Fee too high");
        require(!matchFinalized, "Cannot change after finalization");
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }

    // ========== VIEW FUNCTIONS ==========

    function getTotalPrizePool() public view returns (uint256) {
        return team1TotalETH + team2TotalETH;
    }

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
    ) {
        string memory winner = "";
        if (matchFinalized) {
            if (winningTeam == 0) winner = team1Name;
            else if (winningTeam == 1) winner = team2Name;
            else winner = "TIE";
        }

        return (
            team1Name,
            team2Name,
            team1VoteCount,
            team2VoteCount,
            team1TotalETH,
            team2TotalETH,
            getTotalPrizePool(),
            totalPlatformFeesCollected,
            getCurrentPhase(),
            matchFinalized,
            winner
        );
    }

    function getUserVoteStats(address user) external view returns (
        uint256 team1Votes,
        uint256 team2Votes,
        uint256 team1ETH,
        uint256 team2ETH,
        uint256 potentialWinnings
    ) {
        return (
            userVoteCount[user][0],
            userVoteCount[user][1],
            userETH[user][0],
            userETH[user][1],
            calculateWinnings(user)
        );
    }

    function getVoterCount() external view returns (uint256) {
        return voters.length;
    }

    function getPhase1Details() external view returns (
        uint256 team1Votes,
        uint256 team2Votes,
        bool ended
    ) {
        return (team1Phase1Votes, team2Phase1Votes, phase1Ended);
    }
}
