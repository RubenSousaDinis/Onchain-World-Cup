// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WorldCupMatch.sol";

/**
 * @title WorldCupFactory
 * @dev Factory contract to deploy and manage World Cup match contracts
 */
contract WorldCupFactory {
    address public platformAddress;
    address[] public allMatches;
    mapping(address => bool) public isMatch;
    
    event MatchCreated(
        address indexed matchAddress,
        string team1Name,
        string team2Name,
        uint256 matchStartTime,
        uint256 indexed timestamp
    );
    
    constructor(address _platformAddress) {
        require(_platformAddress != address(0), "Invalid platform address");
        platformAddress = _platformAddress;
    }
    
    /**
     * @dev Create a new World Cup match contract
     * @param _team1Name Name of team 1
     * @param _team2Name Name of team 2
     * @param _matchStartTime Unix timestamp of match start
     * @return matchAddress Address of the deployed match contract
     */
    function createMatch(
        string memory _team1Name,
        string memory _team2Name,
        uint256 _matchStartTime
    ) external returns (address) {
        require(_matchStartTime > block.timestamp, "Match must be in future");
        
        WorldCupMatch newMatch = new WorldCupMatch(
            _team1Name,
            _team2Name,
            _matchStartTime,
            platformAddress
        );
        
        address matchAddress = address(newMatch);
        allMatches.push(matchAddress);
        isMatch[matchAddress] = true;
        
        emit MatchCreated(matchAddress, _team1Name, _team2Name, _matchStartTime, block.timestamp);
        
        return matchAddress;
    }
    
    /**
     * @dev Get all match addresses
     */
    function getAllMatches() external view returns (address[] memory) {
        return allMatches;
    }
    
    /**
     * @dev Get total number of matches
     */
    function getMatchCount() external view returns (uint256) {
        return allMatches.length;
    }
}
