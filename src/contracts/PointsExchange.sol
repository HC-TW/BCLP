// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

contract PointsExchange is Context {
    PE_RPToken private _rp;
    mapping (address => string) _exchangeRates; // Existing points issuer's address => 100 
                                               // means 100 xx points -> 1 RP 

    struct Proposal {
        address proposer;
        string wantPoint;
        string givePoint;
        uint256 wantAmount;
        uint256 giveAmount;
    }
    uint256 public proposalId = 0;
    mapping (uint256 => Proposal) public proposals;
    mapping (address => uint256[]) public proposalIds;
    mapping (address => mapping (uint256 => uint256)) proposalIdToIndexes;
    event ChangeExchangeRate(address bank, string rate);

    modifier onlyBank() {
        require(_rp._banks(_msgSender()), "You are not a bank");
        _;
    }

    constructor(address RPTokenAddr) {
        _rp = PE_RPToken(RPTokenAddr);
    }

    function changeExchangeRate(string memory rate) public onlyBank {
        _exchangeRates[_msgSender()] = rate;
        emit ChangeExchangeRate(_msgSender(), rate);
    }

    function propose(string memory wantPoint, string memory givePoint, uint256 wantAmount, uint256 giveAmount) public {
        proposals[++proposalId] = Proposal(_msgSender(), wantPoint, givePoint, wantAmount, giveAmount);
        proposalIds[_msgSender()].push(proposalId);
        proposalIdToIndexes[_msgSender()][proposalId] = proposalIds[_msgSender()].length-1;
    }

    function receiverAccept(uint256 id) public {
        
    }

    function accept(uint256 index, uint256 id) public {
        address proposer = proposals[id].proposer;
        uint256[] storage tempProposalIds = proposalIds[proposer];
        tempProposalIds[index] = tempProposalIds[tempProposalIds.length-1];
        tempProposalIds.pop();
    }

}

contract PE_RPToken {
    function _banks(address) public view returns (bool) {}
}
