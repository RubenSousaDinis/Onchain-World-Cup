// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title WorldCupMatch
 * @dev Smart contract for ETH-based voting/betting on World Cup matches
 * Features 2-phase time-based pricing:
 * - Phase 1 (0-2 hours): Linear price increase
 * - Phase 2 (2-24 hours): Exponential price increase
 * Winner determined by most ETH voted. 90% to winners, 10% platform fee.
 */
contract WorldCupMatch {
    // Match details
    string public team1Name;
    string public team2Name;
    uint256 public matchStartTime;
    uint256 public votingEndTime;
    uint256 public matchEndTime;
    
    // Voting state
    uint256 public team1TotalVotes;
    uint256 public team2TotalVotes;
    mapping(address => mapping(uint8 => uint256)) public userVotes; // user => teamIndex => amount
    address[] public voters;
    mapping(address => bool) public hasVoted;
    
    // Pricing constants
    uint256 public constant PHASE_1_DURATION = 2 hours;
    uint256 public constant PHASE_2_DURATION = 22 hours;
    uint256 public constant TOTAL_VOTING_DURATION = 24 hours;
    uint256 public constant BASE_PRICE = 0.001 ether;
    uint256 public constant WINNER_SHARE_PERCENT = 90; // 90% to winners
    uint256 public constant PLATFORM_FEE_PERCENT = 10; // 10% platform fee
    
    // Winner tracking
    bool public matchFinalized;
    uint8 public winningTeam; // 0 for team1, 1 for team2
    address public platformAddress;
    
    // Events
    event VotePlaced(address indexed voter, uint8 indexed teamIndex, uint256 amount, uint256 timestamp);
    event MatchFinalized(uint8 indexed winningTeam, uint256 team1Total, uint256 team2Total);
    event WinningsWithdrawn(address indexed voter, uint256 amount);
    event PlatformFeeWithdrawn(uint256 amount);
    
    constructor(
        string memory _team1Name,
        string memory _team2Name,
        uint256 _deployTime,
        address _platformAddress
    ) {
        require(_platformAddress != address(0), "Invalid platform address");
        
        team1Name = _team1Name;
        team2Name = _team2Name;
        matchStartTime = _deployTime;
        votingEndTime = _deployTime + TOTAL_VOTING_DURATION;
        matchEndTime = votingEndTime + 2 hours; // Allow 2 hours after voting closes to finalize
        platformAddress = _platformAddress;
    }
    
    /**
     * @dev Get current pricing phase
     * @return phase 1 for linear, 2 for exponential, 0 if voting closed
     */
    function getCurrentPhase() public view returns (uint8) {
        if (block.timestamp >= votingEndTime) return 0; // Voting closed
        
        uint256 timeElapsed = block.timestamp - matchStartTime;
        
        if (timeElapsed <= PHASE_1_DURATION) {
            return 1; // Phase 1: First 2 hours
        } else if (timeElapsed <= TOTAL_VOTING_DURATION) {
            return 2; // Phase 2: Hours 2-24
        }
        
        return 0; // Voting closed
    }
    
    /**
     * @dev Calculate current vote price
     * Phase 1: Linear increase based on existing votes
     * Phase 2: Exponential increase based on existing votes
     * @param teamIndex 0 for team1, 1 for team2
     * @return price The price for the next vote
     */
    function calculateVotePrice(uint8 teamIndex) public view returns (uint256) {
        uint8 phase = getCurrentPhase();
        require(phase > 0, "Voting is closed");
        require(teamIndex == 0 || teamIndex == 1, "Invalid team index");
        
        uint256 existingVotes = teamIndex == 0 ? team1TotalVotes : team2TotalVotes;
        uint256 voteCount = existingVotes / BASE_PRICE; // Number of votes placed
        
        if (phase == 1) {
            // Phase 1: Linear - price increases gradually
            // Formula: BASE_PRICE * (1 + voteCount * 0.005)
            return BASE_PRICE + (BASE_PRICE * voteCount * 5) / 1000;
        } else {
            // Phase 2: Exponential - price increases rapidly
            // Formula: BASE_PRICE * (1.02 ^ voteCount)
            uint256 price = BASE_PRICE;
            for (uint256 i = 0; i < voteCount && i < 100; i++) {
                price = (price * 102) / 100; // 2% increase per vote
            }
            return price;
        }
    }
    
    /**
     * @dev Place a vote for a team
     * @param teamIndex 0 for team1, 1 for team2
     */
    function vote(uint8 teamIndex) external payable {
        require(teamIndex == 0 || teamIndex == 1, "Invalid team index");
        require(msg.value > 0, "Must send ETH to vote");
        require(getCurrentPhase() > 0, "Voting is closed");
        require(!matchFinalized, "Match already finalized");
        
        // Track voter
        if (!hasVoted[msg.sender]) {
            voters.push(msg.sender);
            hasVoted[msg.sender] = true;
        }
        
        // Record vote
        userVotes[msg.sender][teamIndex] += msg.value;
        
        if (teamIndex == 0) {
            team1TotalVotes += msg.value;
        } else {
            team2TotalVotes += msg.value;
        }
        
        emit VotePlaced(msg.sender, teamIndex, msg.value, block.timestamp);
    }
    
    /**
     * @dev Finalize match and determine winner
     * Can be called by anyone after voting ends
     */
    function finalizeMatch() external {
        require(block.timestamp >= votingEndTime, "Voting not ended yet");
        require(!matchFinalized, "Match already finalized");
        
        matchFinalized = true;
        
        // Determine winner by most ETH voted
        if (team1TotalVotes > team2TotalVotes) {
            winningTeam = 0;
        } else if (team2TotalVotes > team1TotalVotes) {
            winningTeam = 1;
        } else {
            // In case of tie, refund all voters (no winner)
            winningTeam = 255; // Special value for tie
        }
        
        emit MatchFinalized(winningTeam, team1TotalVotes, team2TotalVotes);
    }
    
    /**
     * @dev Calculate winnings for a voter
     * @param voter Address of the voter
     * @return amount Winnings amount
     */
    function calculateWinnings(address voter) public view returns (uint256) {
        require(matchFinalized, "Match not finalized yet");
        
        // In case of tie, return full refund
        if (winningTeam == 255) {
            return userVotes[voter][0] + userVotes[voter][1];
        }
        
        uint256 voterAmount = userVotes[voter][winningTeam];
        if (voterAmount == 0) return 0;
        
        uint256 totalPrizePool = team1TotalVotes + team2TotalVotes;
        uint256 winnerPool = (totalPrizePool * WINNER_SHARE_PERCENT) / 100;
        uint256 winningTeamTotal = winningTeam == 0 ? team1TotalVotes : team2TotalVotes;
        
        // Calculate proportional share
        return (winnerPool * voterAmount) / winningTeamTotal;
    }
    
    /**
     * @dev Withdraw winnings for a voter
     */
    function withdrawWinnings() external {
        require(matchFinalized, "Match not finalized yet");
        
        uint256 winnings = calculateWinnings(msg.sender);
        require(winnings > 0, "No winnings to withdraw");
        
        // Mark as withdrawn
        userVotes[msg.sender][0] = 0;
        userVotes[msg.sender][1] = 0;
        
        // Transfer winnings
        (bool success, ) = msg.sender.call{value: winnings}("");
        require(success, "Transfer failed");
        
        emit WinningsWithdrawn(msg.sender, winnings);
    }
    
    /**
     * @dev Withdraw platform fee (only platform address)
     */
    function withdrawPlatformFee() external {
        require(msg.sender == platformAddress, "Only platform can withdraw");
        require(matchFinalized, "Match not finalized yet");
        
        uint256 totalPrizePool = team1TotalVotes + team2TotalVotes;
        uint256 platformFee = (totalPrizePool * PLATFORM_FEE_PERCENT) / 100;
        
        require(platformFee > 0, "No fee to withdraw");
        
        // Transfer platform fee
        (bool success, ) = platformAddress.call{value: platformFee}("");
        require(success, "Transfer failed");
        
        emit PlatformFeeWithdrawn(platformFee);
    }
    
    /**
     * @dev Get match details
     */
    function getMatchDetails() external view returns (
        string memory _team1Name,
        string memory _team2Name,
        uint256 _team1Votes,
        uint256 _team2Votes,
        uint256 _totalPrizePool,
        uint8 _currentPhase,
        bool _isFinalized,
        uint8 _winningTeam
    ) {
        return (
            team1Name,
            team2Name,
            team1TotalVotes,
            team2TotalVotes,
            team1TotalVotes + team2TotalVotes,
            getCurrentPhase(),
            matchFinalized,
            winningTeam
        );
    }
    
    /**
     * @dev Get voter count
     */
    function getVoterCount() external view returns (uint256) {
        return voters.length;
    }
}
