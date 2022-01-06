// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

contract PointsExchange is Context {
    address public _owner;
    PE_RPToken private _rp;

	mapping(address => Rate) public _rpRates;
	address[] private _existingIssuer2RPs;


    mapping(address => string) _rp2other; 

    struct Rate {
        string imgHash;
        string name;
        uint oldAsset;
        uint newAsset;
        uint keysIdx;
    }
    /* struct Proposal {
        address proposer;
        string wantPoint;
        string givePoint;
        uint256 wantAmount;
        uint256 giveAmount;
    }
    uint256 public proposalId = 0;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256[]) public proposalIds;
    mapping(uint256 => uint256) proposalIdToIndexes; */
    event UpdateRPRate(address indexed bank, uint oldAsset, uint newAsset);
    event ExchangeRP(address indexed issuer, address indexed user, string name, uint oldAmount, uint amount);
    event ChangeOtherRate(address indexed merchant, string rate);

    modifier onlyOwner() {
        require(_msgSender() == _owner, "You are not a contract owner");
        _;
    }

    modifier onlyBank() {
        require(_rp._banks(_msgSender()), "You are not a bank");
        _;
    }

    constructor(address RPTokenAddr) {
        _owner = _msgSender();
        _rp = PE_RPToken(RPTokenAddr);
    }

    function addRPRate(string memory imgHash, string memory name, uint oldAsset, uint newAsset) public onlyBank {
        require(bytes(_rpRates[_msgSender()].name).length == 0, "PointsExchange: You can only add points exchange rate for RP once");
        require(bytes(imgHash).length > 0, "PointsExchange: Points image hash cannot be empty");
        require(bytes(name).length > 0, "PointsExchange: Points name cannot be empty");
		require(oldAsset > 0, "PointsExchange: Points exchange rate cannot be empty");
        require(newAsset > 0, "PointsExchange: Points exchange rate cannot be empty");
        _existingIssuer2RPs.push(_msgSender());
        _rpRates[_msgSender()] = Rate(imgHash, name, oldAsset, newAsset, _existingIssuer2RPs.length-1);
    }

    function removeRPRate() public onlyBank {
        require(bytes(_rpRates[_msgSender()].name).length > 0, "PointsExchange: You did not add points exchange rate for RP");
        uint rowToDelete = _rpRates[_msgSender()].keysIdx;
        address keyToMove = _existingIssuer2RPs[_existingIssuer2RPs.length-1];
        _existingIssuer2RPs[rowToDelete] = keyToMove;
        _rpRates[keyToMove].keysIdx = rowToDelete;
        _existingIssuer2RPs.pop();
        delete _rpRates[_msgSender()];
    }

    function updateRPRate(uint oldAsset, uint newAsset) public onlyBank {
        _rpRates[_msgSender()].oldAsset = oldAsset;
        _rpRates[_msgSender()].newAsset = newAsset;

        emit UpdateRPRate(_msgSender(), oldAsset, newAsset);
    }

    function exchangeRP(address issuer, address user, string memory name, uint oldAmount, uint amount) public onlyOwner{
        _rp.transfer(user, amount);
        emit ExchangeRP(issuer, user, name, oldAmount, amount);
    }

    function getExistingIssuer2RPs() public view returns (address[] memory) {
        return _existingIssuer2RPs;
    }

    /* function propose(
        string memory wantPoint,
        string memory givePoint,
        uint256 wantAmount,
        uint256 giveAmount
    ) public {
        proposals[++proposalId] = Proposal(
            _msgSender(),
            wantPoint,
            givePoint,
            wantAmount,
            giveAmount
        );
        proposalIds[_msgSender()].push(proposalId);
        proposalIdToIndexes[proposalId] = proposalIds[_msgSender()].length - 1;
    }

    function accept(uint256 id) public {
        uint256[] storage proposerProposalIds = proposalIds[
            proposals[id].proposer
        ];
        proposerProposalIds[proposalIdToIndexes[id]] = proposerProposalIds[
            proposerProposalIds.length - 1
        ];
        proposerProposalIds.pop();
        delete proposalIdToIndexes[id];
    } */
}

contract PE_RPToken {
    function _banks(address) public view returns (bool) {}
    function transfer(address recipient, uint256 amount) public virtual returns (bool) {}
}
