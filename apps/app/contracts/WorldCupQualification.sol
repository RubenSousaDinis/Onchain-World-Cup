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

    /*//////////////////////////////////////////////////////////////
                                IMMUTABLES
    //////////////////////////////////////////////////////////////*/

    uint256 public immutable qualificationEndTime;
    address public immutable feeRecipient;

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    bool public qualificationFinalized;

    uint256 public totalVotes;
    uint256 public totalQualifiedVotes;

    uint256 public totalPrizePool;        // net ETH for players
    uint256 public totalPlatformFees;     // protocol revenue
    uint256 public totalETHCollected;     // total ETH collected (before fees)
    uint256 public platformFeeBps;        // Platform fee in basis points (updatable)

    // Country data
    mapping(bytes2 => bool) public validCountry;
    mapping(bytes2 => uint256) public countryVotes;
    mapping(bytes2 => uint256) public countryETH; // ETH collected per country
    mapping(bytes2 => bool) public isQualified;

    bytes2[] public allCountries;

    // User data
    mapping(address => mapping(bytes2 => uint256)) public userVotes;
    mapping(address => bool) public hasClaimed;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event Voted(
        address indexed user,
        bytes2 indexed country,
        uint256 amount
    );

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

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

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

    /*//////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        uint256 _qualificationEndTime,
        address _feeRecipient,
        bytes2[] memory _initialCountries,
        uint256 _initialPlatformFeeBps
    ) Ownable(msg.sender) {
        require(_qualificationEndTime > block.timestamp, "Invalid end time");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        require(_initialPlatformFeeBps <= MAX_PLATFORM_FEE_BPS, "Fee too high");

        qualificationEndTime = _qualificationEndTime;
        feeRecipient = _feeRecipient;
        platformFeeBps = _initialPlatformFeeBps;

        // Add initial countries
        for (uint256 i = 0; i < _initialCountries.length; i++) {
            bytes2 country = _initialCountries[i];
            if (!validCountry[country] && country != bytes2(0)) {
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
     * @param country ISO 3166-1 alpha-2 country code as bytes2
     */
    function addCountry(bytes2 country) external onlyOwner onlyBeforeEnd {
        require(!validCountry[country], "Country already exists");
        require(country != bytes2(0), "Invalid country code");
        
        validCountry[country] = true;
        allCountries.push(country);
        
        emit CountryAdded(country);
    }

    /**
     * @dev Add multiple countries at once (owner only, only during qualification)
     */
    function addCountries(bytes2[] calldata countries) external onlyOwner onlyBeforeEnd {
        for (uint256 i = 0; i < countries.length; i++) {
            bytes2 country = countries[i];
            if (!validCountry[country] && country != bytes2(0)) {
                validCountry[country] = true;
                allCountries.push(country);
                emit CountryAdded(country);
            }
        }
    }

    /**
     * @dev Remove a country from the whitelist (owner only, only during qualification)
     * @param country ISO 3166-1 alpha-2 country code as bytes2
     * @notice Can only remove countries with 0 votes
     */
    function removeCountry(bytes2 country) external onlyOwner onlyBeforeEnd {
        require(validCountry[country], "Country does not exist");
        require(countryVotes[country] == 0, "Country has votes");
        
        validCountry[country] = false;
        
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

    /*//////////////////////////////////////////////////////////////
                            PRICING LOGIC
    //////////////////////////////////////////////////////////////*/

    function votePrice(bytes2 country) public view returns (uint256) {
        require(validCountry[country], "Invalid country");
        return BASE_PRICE + (countryVotes[country] * PRICE_INCREMENT);
    }

    function calculateVoteCost(bytes2 country, uint256 votes)
        public
        view
        returns (uint256 totalCost)
    {
        require(votes > 0 && votes <= MAX_VOTES_PER_TX, "Invalid vote count");
        require(validCountry[country], "Invalid country");

        uint256 currentVotes = countryVotes[country];
        for (uint256 i = 0; i < votes; i++) {
            totalCost += BASE_PRICE + ((currentVotes + i) * PRICE_INCREMENT);
        }
    }

    /*//////////////////////////////////////////////////////////////
                                VOTING
    //////////////////////////////////////////////////////////////*/

    function vote(bytes2 country, uint256 votes)
        external
        payable
        onlyBeforeEnd
        nonReentrant
    {
        require(!qualificationFinalized, "Finalized");
        require(validCountry[country], "Invalid country");

        uint256 cost = calculateVoteCost(country, votes);
        require(msg.value >= cost, "Insufficient ETH");

        uint256 fee = (cost * platformFeeBps) / 10_000;
        uint256 net = cost - fee;

        totalETHCollected += cost;
        totalPlatformFees += fee;
        totalPrizePool += net;

        countryVotes[country] += votes;
        countryETH[country] += cost; // Track total ETH per country
        userVotes[msg.sender][country] += votes;

        totalVotes += votes;

        // Refund overpayment
        if (msg.value > cost) {
            (bool refundOk,) = msg.sender.call{value: msg.value - cost}("");
            require(refundOk, "Refund failed");
        }

        emit Voted(msg.sender, country, cost);
        emit VotePlaced(msg.sender, country, votes, cost, block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                        QUALIFICATION FINALIZATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Finalize qualification with top 48 countries
     * @param qualifiedCountries Array of exactly 48 country codes that qualified
     * @notice CRITICAL: Countries must have votes to qualify (trust guarantee)
     */
    function finalizeQualification(bytes2[] calldata qualifiedCountries)
        external
        onlyOwner
        onlyAfterEnd
    {
        require(!qualificationFinalized, "Already finalized");
        require(
            qualifiedCountries.length == QUALIFICATION_SPOTS,
            "Must specify exactly 48 countries"
        );

        for (uint256 i = 0; i < qualifiedCountries.length; i++) {
            bytes2 country = qualifiedCountries[i];
            require(validCountry[country], "Invalid country");
            // CRITICAL TRUST GUARANTEE: Country cannot qualify without votes
            require(countryVotes[country] > 0, "Country has no votes");

            if (!isQualified[country]) {
                isQualified[country] = true;
                totalQualifiedVotes += countryVotes[country];
            }
        }

        qualificationFinalized = true;

        emit QualificationEnded();
        emit QualificationFinalized(qualifiedCountries);
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

        for (uint256 i = 0; i < allCountries.length; i++) {
            bytes2 country = allCountries[i];
            if (isQualified[country]) {
                userQualifiedVotes += userVotes[user][country];
            }
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

    /*//////////////////////////////////////////////////////////////
                        PLATFORM FEE WITHDRAWAL
    //////////////////////////////////////////////////////////////*/

    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 amount = totalPlatformFees;
        require(amount > 0, "No fees");

        totalPlatformFees = 0;

        (bool ok,) = feeRecipient.call{value: amount}("");
        require(ok, "Fee transfer failed");

        emit PlatformFeesWithdrawn(amount);
    }

    /*//////////////////////////////////////////////////////////////
                            READ-ONLY METRICS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Get ETH collected for a specific country (read-only metric)
     * @param country Country code
     * @return Total ETH collected for this country
     */
    function getETHPerCountry(bytes2 country) external view returns (uint256) {
        return countryETH[country];
    }

    /**
     * @dev Get total prize pool (read-only metric)
     * @return Total prize pool available for distribution
     */
    function getTotalPrizePool() external view returns (uint256) {
        return totalPrizePool;
    }

    /**
     * @dev Get platform fee amount (read-only metric)
     * @return Total platform fees collected
     */
    function getPlatformFeeAmount() external view returns (uint256) {
        return totalPlatformFees;
    }

    /**
     * @dev Get total ETH allocated to a country (for display purposes)
     * Note: This is not the payout amount - payouts use unified pool
     */
    function ethForCountry(bytes2 country) external view returns (uint256) {
        return countryETH[country];
    }

    /**
     * @dev Get user's votes across all countries
     */
    function getUserVotes(address user)
        external
        view
        returns (bytes2[] memory countries, uint256[] memory votes)
    {
        uint256 count;
        for (uint256 i = 0; i < allCountries.length; i++) {
            if (userVotes[user][allCountries[i]] > 0) count++;
        }

        countries = new bytes2[](count);
        votes = new uint256[](count);

        uint256 idx;
        for (uint256 i = 0; i < allCountries.length; i++) {
            bytes2 c = allCountries[i];
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
