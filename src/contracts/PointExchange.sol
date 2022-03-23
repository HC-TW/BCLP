// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

contract PointExchange is Context {
    address public _owner;
    PE_RPToken private _rp;

    uint public _rateCount = 0;
	mapping(uint => Rate) public _rates;
	mapping (address => uint[]) private _bankKeys;

    struct Rate {
        uint id;
        string imgHash;
        string name;
        uint otherPoint;
        uint RP;
        address bank;
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
    // event UpdateRPRate(address indexed bank, uint oldAsset, uint newAsset);
    event ExchangeRP(address indexed bank, address indexed user, string name, uint oldAmount, uint amount);
    event ExchangeOther(address indexed bank, address indexed user, string name, uint oldAmount, uint amount);

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

    function addRPRate(string memory imgHash, string memory name, uint otherPoint, uint rp) public onlyBank {
        // require(bytes(_rpRates[_msgSender()].name).length == 0, "PointExchange: You can only add point exchange rate for RP once");
        require(bytes(imgHash).length > 0, "PointExchange: Points image hash cannot be empty");
        require(bytes(name).length > 0, "PointExchange: Points name cannot be empty");
		require(otherPoint > 0, "PointExchange: Point exchange rate cannot be empty");
        require(rp > 0, "PointExchange: Point exchange rate cannot be empty");
        _bankKeys[_msgSender()].push(++_rateCount);
		_rates[_rateCount] = Rate(_rateCount, imgHash, name, otherPoint, rp, _msgSender(), _bankKeys[_msgSender()].length - 1);
    }

    function removeRPRate(uint id) public onlyBank {
        require(id <= _rateCount, "PointExchange: No such rate");
		Rate memory rate = _rates[id];
		require(rate.bank == _msgSender(), "PointExchange: You cannot remove other banks' rate");
		uint[] storage keys = _bankKeys[_msgSender()];
        uint rowToDelete = rate.keysIdx;
        uint keyToMove = keys[keys.length-1];
        keys[rowToDelete] = keyToMove;
        _rates[keyToMove].keysIdx = rowToDelete;
        keys.pop();
		delete _rates[id];
    }

    function updateRPRate(uint id, uint otherPoint, uint rp) public onlyBank {
        require(id <= _rateCount, "PointExchange: No such rate");
		require(_rates[id].bank == _msgSender(), "PointExchange: You cannot remove other banks' rate");
        _rates[id].otherPoint = otherPoint;
        _rates[id].RP = rp;

        // emit UpdateRPRate(_msgSender(), otherPoint, rp);
    }

    function exchangeRP(address bank, address user, string memory name, uint oldAmount, uint amount) public onlyOwner {
        _rp.transfer(user, amount);
        emit ExchangeRP(bank, user, name, oldAmount, amount);
    }

    function exchangeOther(address bank, address user, string memory name, uint oldAmount, uint amount) public onlyOwner {
        _rp.recycle(bank, user, oldAmount);
        emit ExchangeOther(bank, user, name, oldAmount, amount);
    }

    // Get Issuer Keys
	function getBankKeys() public view onlyBank returns (uint[] memory) {
		return _bankKeys[_msgSender()];
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
    function recycle(address bank, address user, uint256 amount) public returns (bool) {}
}
