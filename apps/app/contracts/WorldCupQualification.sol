// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Onchain World Cup – Qualification Phase
 * @notice ETH-based voting to qualify countries for the tournament
 *
 * Trust Guarantees:
 * - Admin can only curate country list (cannot affect outcomes)
 * - Countries cannot qualify without votes
 * - All actions are transparent and time-limited
 * - Community decides the outcome
 */
contract WorldCupQualification is Ownable, ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant BASE_PRICE = 0.001 ether;
    uint256 public constant PRICE_INCREMENT = 0.0005 ether;
    uint256 public constant MAX_PLATFORM_FEE_BPS = 2000; // Max 20%
    uint256 public constant MAX_VOTES_PER_TX = 100;
    uint256 public constant QUALIFICATION_SPOTS = 48;
    uint256 public constant REFERRAL_FEE_BPS = 100; // 1%

    /*//////////////////////////////////////////////////////////////
                                IMMUTABLES
    //////////////////////////////////////////////////////////////*/

    uint256 public immutable qualificationStartTime;
    uint256 public immutable qualificationEndTime;
    address public immutable feeRecipient;

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    bool public qualificationFinalized;
    bool public paused;

    uint256 public totalVotes;
    uint256 public totalQualifiedVotes;

    uint256 public totalPrizePool;            // net ETH for players
    uint256 public totalPlatformFeesCollected; // lifetime platform fees (transferred immediately)
    uint256 public totalETHCollected;         // total ETH collected (before fees)
    uint256 public platformFeeBps;            // Platform fee in basis points (updatable)

    // Country data
    mapping(bytes8 => bool) public validCountry;
    mapping(bytes8 => uint256) public countryVotes;
    mapping(bytes8 => uint256) public countryETH; // ETH collected per country
    mapping(bytes8 => bool) public isQualified;

    bytes8[] public allCountries;
    bytes8[] public qualifiedCountries;

    // User data
    mapping(address => mapping(bytes8 => uint256)) public userVotes;
    mapping(address => bool) public hasClaimed;

    // Referral data
    mapping(address => uint256) public referrerEarnings;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event VotePlaced(
        address indexed voter,
        bytes8 indexed country,
        uint256 votes,
        uint256 cost,
        uint256 timestamp
    );

    event ReferralPaid(address indexed referrer, address indexed voter, uint256 amount);

    event CountryAdded(bytes8 country);
    event CountryRemoved(bytes8 country);
    event PlatformFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event Paused(address indexed account);
    event Unpaused(address indexed account);
    event QualificationEnded();
    event QualificationFinalized(bytes8[] qualifiedCountries);
    event WinningsClaimed(address indexed user, uint256 amount);
    event PlatformFeeTransferred(address indexed recipient, uint256 amount);
    event PrizesDistributed(uint256 totalPrizePool);

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyAfterStart() {
        require(block.timestamp >= qualificationStartTime, "Qualification not started");
        _;
    }

    modifier onlyBeforeEnd() {
        require(block.timestamp < qualificationEndTime, "Qualification ended");
        _;
    }

    modifier onlyAfterEnd() {
        require(block.timestamp >= qualificationEndTime, "Qualification not ended");
        _;
    }

    modifier onlyFinalized() {
        require(qualificationFinalized, "Not finalized");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Contract is not paused");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        uint256 _qualificationStartTime,
        uint256 _qualificationEndTime,
        address _feeRecipient,
        bytes8[] memory _initialCountries,
        uint256 _initialPlatformFeeBps
    ) Ownable(msg.sender) {
        require(_qualificationStartTime >= block.timestamp, "Start time must be in future");
        require(_qualificationEndTime > _qualificationStartTime, "End time must be after start time");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        require(_initialPlatformFeeBps <= MAX_PLATFORM_FEE_BPS, "Fee too high");

        qualificationStartTime = _qualificationStartTime;
        qualificationEndTime = _qualificationEndTime;
        feeRecipient = _feeRecipient;
        platformFeeBps = _initialPlatformFeeBps;

        // Add initial countries
        for (uint256 i = 0; i < _initialCountries.length; i++) {
            bytes8 country = _initialCountries[i];
            if (!validCountry[country] && country != bytes8(0)) {
                validCountry[country] = true;
                allCountries.push(country);
                emit CountryAdded(country);
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Add a new country to the whitelist (owner only, only during qualification)
     * @param country Country code as bytes8 (e.g., "US", "BR", "GB-ENG")
     */
    function addCountry(bytes8 country) external onlyOwner onlyBeforeEnd {
        require(!validCountry[country], "Country already exists");
        require(country != bytes8(0), "Invalid country code");

        validCountry[country] = true;
        allCountries.push(country);

        emit CountryAdded(country);
    }

    /**
     * @dev Add multiple countries at once (owner only, only during qualification)
     */
    function addCountries(bytes8[] calldata countries) external onlyOwner onlyBeforeEnd {
        for (uint256 i = 0; i < countries.length; i++) {
            bytes8 country = countries[i];
            if (!validCountry[country] && country != bytes8(0)) {
                validCountry[country] = true;
                allCountries.push(country);
                emit CountryAdded(country);
            }
        }
    }

    /**
     * @dev Remove a country from the whitelist (owner only, only during qualification)
     * @param country Country code as bytes8
     * @notice Can only remove countries with 0 votes
     */
    function removeCountry(bytes8 country) external onlyOwner onlyBeforeEnd {
        require(validCountry[country], "Country does not exist");
        require(countryVotes[country] == 0, "Country has votes");

        validCountry[country] = false;

        // Remove from allCountries array (swap-and-pop)
        for (uint256 i = 0; i < allCountries.length; i++) {
            if (allCountries[i] == country) {
                allCountries[i] = allCountries[allCountries.length - 1];
                allCountries.pop();
                break;
            }
        }

        emit CountryRemoved(country);
    }

    /**
     * @dev Update platform fee (owner only, only during qualification)
     * @param newFeeBps New platform fee in basis points (e.g., 1000 = 10%)
     * @notice Can be used to offer discounts during qualification phase
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner onlyBeforeEnd {
        require(newFeeBps <= MAX_PLATFORM_FEE_BPS, "Fee too high");
        require(!qualificationFinalized, "Qualification finalized");

        uint256 oldFeeBps = platformFeeBps;
        platformFeeBps = newFeeBps;

        emit PlatformFeeUpdated(oldFeeBps, newFeeBps);
    }

    /**
     * @dev Pause voting (owner only, emergency stop)
     * @notice Can be used to pause voting in case of issues
     */
    function pause() external onlyOwner whenNotPaused {
        paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev Unpause voting (owner only)
     * @notice Resume voting after emergency stop
     */
    function unpause() external onlyOwner whenPaused {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                            PRICING LOGIC
    //////////////////////////////////////////////////////////////*/

    function votePrice(bytes8 country) public view returns (uint256) {
        require(validCountry[country], "Invalid country");
        return BASE_PRICE + (countryVotes[country] * PRICE_INCREMENT);
    }

    function calculateVoteCost(bytes8 country, uint256 votes)
        public
        view
        returns (uint256 totalCost)
    {
        require(votes > 0 && votes <= MAX_VOTES_PER_TX, "Invalid vote count");
        require(validCountry[country], "Invalid country");

        uint256 currentVotes = countryVotes[country];
        // Arithmetic series: sum = n * BASE_PRICE + PRICE_INCREMENT * n * (2*currentVotes + n - 1) / 2
        totalCost = (votes * BASE_PRICE) + (PRICE_INCREMENT * votes * (2 * currentVotes + votes - 1)) / 2;
    }

    /*//////////////////////////////////////////////////////////////
                                VOTING
    //////////////////////////////////////////////////////////////*/

    function vote(bytes8 country, uint256 votes, address referrer)
        external
        payable
        onlyAfterStart
        onlyBeforeEnd
        whenNotPaused
        nonReentrant
    {
        require(!qualificationFinalized, "Finalized");
        require(validCountry[country], "Invalid country");

        uint256 cost = calculateVoteCost(country, votes);
        require(msg.value >= cost, "Insufficient ETH");

        uint256 fee = (cost * platformFeeBps) / 10_000;
        uint256 net = cost - fee; // Prize pool amount — unaffected by referral

        // Apply referral: 1% of cost paid to referrer, deducted from platform fee
        bool hasReferral = referrer != address(0) &&
            referrer != msg.sender &&
            platformFeeBps >= REFERRAL_FEE_BPS;

        if (hasReferral) {
            uint256 referralFee = (cost * REFERRAL_FEE_BPS) / 10_000;
            fee -= referralFee;
            referrerEarnings[referrer] += referralFee;
            (bool refOk,) = referrer.call{value: referralFee}("");
            require(refOk, "Referral transfer failed");
            emit ReferralPaid(referrer, msg.sender, referralFee);
        }

        totalETHCollected += cost;
        totalPlatformFeesCollected += fee;
        totalPrizePool += net;

        countryVotes[country] += votes;
        countryETH[country] += cost;
        userVotes[msg.sender][country] += votes;

        totalVotes += votes;

        // Transfer platform fee immediately
        if (fee > 0) {
            (bool feeOk,) = feeRecipient.call{value: fee}("");
            require(feeOk, "Fee transfer failed");
            emit PlatformFeeTransferred(feeRecipient, fee);
        }

        // Refund overpayment
        if (msg.value > cost) {
            (bool refundOk,) = msg.sender.call{value: msg.value - cost}("");
            require(refundOk, "Refund failed");
        }

        emit VotePlaced(msg.sender, country, votes, cost, block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                        QUALIFICATION FINALIZATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Finalize qualification with top 48 countries
     * @param _qualifiedCountries Array of exactly 48 country codes that qualified
     * @notice CRITICAL: Countries must have votes to qualify (trust guarantee)
     */
    function finalizeQualification(bytes8[] calldata _qualifiedCountries)
        external
        onlyOwner
        onlyAfterEnd
    {
        require(!qualificationFinalized, "Already finalized");
        require(
            _qualifiedCountries.length == QUALIFICATION_SPOTS,
            "Must specify exactly 48 countries"
        );

        for (uint256 i = 0; i < _qualifiedCountries.length; i++) {
            bytes8 country = _qualifiedCountries[i];
            require(validCountry[country], "Invalid country");
            require(countryVotes[country] > 0, "Country has no votes");
            require(!isQualified[country], "Duplicate country");

            isQualified[country] = true;
            totalQualifiedVotes += countryVotes[country];
            qualifiedCountries.push(country);
        }

        qualificationFinalized = true;

        emit QualificationEnded();
        emit QualificationFinalized(_qualifiedCountries);
        emit PrizesDistributed(totalPrizePool);
    }

    /*//////////////////////////////////////////////////////////////
                            CLAIMING LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Calculate claimable amount for a user
     * Formula: (userQualifiedVotes * totalPrizePool) / totalQualifiedVotes
     */
    function claimable(address user)
        public
        view
        returns (uint256)
    {
        if (!qualificationFinalized || hasClaimed[user] || totalQualifiedVotes == 0) {
            return 0;
        }

        uint256 userQualifiedVotes;

        for (uint256 i = 0; i < qualifiedCountries.length; i++) {
            userQualifiedVotes += userVotes[user][qualifiedCountries[i]];
        }

        if (userQualifiedVotes == 0) return 0;

        return (userQualifiedVotes * totalPrizePool) / totalQualifiedVotes;
    }

    function claim() external nonReentrant onlyFinalized {
        require(!hasClaimed[msg.sender], "Already claimed");

        uint256 amount = claimable(msg.sender);
        require(amount > 0, "Nothing to claim");

        hasClaimed[msg.sender] = true;

        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "ETH transfer failed");

        emit WinningsClaimed(msg.sender, amount);
    }

    /**
     * @dev Sweep residual ETH (rounding dust) after all claims are settled
     * @notice Only callable by owner after finalization
     */
    function sweepResidual() external onlyOwner onlyFinalized nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No residual");

        (bool ok,) = feeRecipient.call{value: balance}("");
        require(ok, "Sweep failed");
    }

    /*//////////////////////////////////////////////////////////////
                            READ-ONLY METRICS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Get total ETH allocated to a country (for display purposes)
     * Note: This is not the payout amount - payouts use unified pool
     */
    function ethForCountry(bytes8 country) external view returns (uint256) {
        return countryETH[country];
    }

    /**
     * @dev Get user's votes across all countries
     */
    function getUserVotes(address user)
        external
        view
        returns (bytes8[] memory countries, uint256[] memory votes)
    {
        uint256 count;
        for (uint256 i = 0; i < allCountries.length; i++) {
            if (userVotes[user][allCountries[i]] > 0) count++;
        }

        countries = new bytes8[](count);
        votes = new uint256[](count);

        uint256 idx;
        for (uint256 i = 0; i < allCountries.length; i++) {
            bytes8 c = allCountries[i];
            uint256 v = userVotes[user][c];
            if (v > 0) {
                countries[idx] = c;
                votes[idx] = v;
                idx++;
            }
        }
    }

    /**
     * @dev Get qualification details
     */
    function getQualificationDetails() external view returns (
        uint256 _totalPrizePool,
        uint256 _qualificationEndTime,
        uint8 _qualificationSpots,
        bool _isFinalized,
        uint256 _totalVoters
    ) {
        // Note: For exact voter count, you'd need to track voters array
        // This returns 0 as a placeholder - can be enhanced if needed
        
        return (
            totalPrizePool,
            qualificationEndTime,
            uint8(QUALIFICATION_SPOTS),
            qualificationFinalized,
            0 // voterCount - would need separate tracking
        );
    }

    receive() external payable {
        revert("Direct ETH not accepted");
    }
}
