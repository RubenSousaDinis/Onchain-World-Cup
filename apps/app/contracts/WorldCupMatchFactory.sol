// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./WorldCupMatch.sol";

interface IEventHubFactory {
    function authorizeMatch(address matchAddress) external;
}

/**
 * @title WorldCupMatchFactory
 * @dev Deploys and authorizes WorldCupMatch contracts in a single transaction.
 * Requires being set as authorizedFactory on the WorldCupEventHub.
 */
contract WorldCupMatchFactory is Ownable {
    IEventHubFactory public immutable eventHub;
    address public platformAddress;
    uint256 public platformFeePercent;
    address[] public deployedMatches;

    uint256 public constant MAX_FEE_PERCENT = 2000;

    event MatchCreated(address indexed matchAddress, string team1Name, string team2Name, uint256 deployTime);
    event PlatformAddressUpdated(address indexed newPlatform);
    event PlatformFeeUpdated(uint256 newFeePercent);

    constructor(
        address _eventHub,
        address _platformAddress,
        uint256 _platformFeePercent
    ) Ownable(msg.sender) {
        require(_eventHub != address(0), "Invalid EventHub address");
        require(_platformAddress != address(0), "Invalid address");
        require(_platformFeePercent <= MAX_FEE_PERCENT, "Fee too high");

        eventHub = IEventHubFactory(_eventHub);
        platformAddress = _platformAddress;
        platformFeePercent = _platformFeePercent;
    }

    function createMatch(
        string memory team1Name,
        string memory team2Name,
        uint256 deployTime
    ) external onlyOwner returns (address matchAddress) {
        WorldCupMatch newMatch = new WorldCupMatch(
            team1Name,
            team2Name,
            deployTime,
            platformAddress,
            platformFeePercent,
            address(eventHub)
        );

        matchAddress = address(newMatch);
        deployedMatches.push(matchAddress);

        eventHub.authorizeMatch(matchAddress);

        emit MatchCreated(matchAddress, team1Name, team2Name, deployTime);
    }

    function setPlatformAddress(address _platformAddress) external onlyOwner {
        require(_platformAddress != address(0), "Invalid address");
        platformAddress = _platformAddress;
        emit PlatformAddressUpdated(_platformAddress);
    }

    function setPlatformFee(uint256 _platformFeePercent) external onlyOwner {
        require(_platformFeePercent <= MAX_FEE_PERCENT, "Fee too high");
        platformFeePercent = _platformFeePercent;
        emit PlatformFeeUpdated(_platformFeePercent);
    }

    function getDeployedMatches() external view returns (address[] memory) {
        return deployedMatches;
    }

    function getMatchCount() external view returns (uint256) {
        return deployedMatches.length;
    }
}
