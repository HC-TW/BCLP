// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

contract BankLiability is Context {
    address public _owner;
    BL_RPToken private _rp;
    // BL_Credit private _credit;
    // int256 public _totalLiability;

    mapping(address => int256) public _liabilities;

    struct Request {
        uint256 amount;
        uint transferKeysIdx;
        uint confirmKeysIdx;
    }

    mapping(address => mapping(address => Request)) private _transferRequest;
    mapping(address => address[]) private _transferRequestKeys;
    mapping(address => address[]) private _confirmRemittanceKeys;

    /* event TransferRequest(
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );
    event RevokeRequest(address indexed sender, address indexed recipient); */
    event Accept(
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );

    modifier onlyOwner() {
        require(_msgSender() == _owner);
        _;
    }

    modifier onlyBank() {
        require(_rp._banks(_msgSender()), "You are not a bank");
        _;
    }

    constructor(address RPTokenAddr) {
        _owner = _msgSender();
        _rp = BL_RPToken(RPTokenAddr);
    }

    /* function loadCredit(address addr) public onlyOwner {
        _credit = BL_Credit(addr);
    } */

    function transferRequest(address recipient, uint256 amount) public onlyBank returns (bool) {
        require(_rp._banks(recipient), "Liability: You can only request to transfer liability to banks");
        require(amount != 0, "Liability: transfer zero amount");
        require(_transferRequest[_msgSender()][recipient].amount == 0, "Liability: You cannot send multiple requests to the same bank");

        _transferRequestKeys[_msgSender()].push(recipient);
        _confirmRemittanceKeys[recipient].push(_msgSender());
        _transferRequest[_msgSender()][recipient] = Request(amount, _transferRequestKeys[_msgSender()].length - 1, _confirmRemittanceKeys[recipient].length - 1);

        // emit TransferRequest(_msgSender(), recipient, amount);
        return true;
    }

    function deleteRequest(address sender, address recipient) internal {
        address[] storage keys = _transferRequestKeys[sender];
        uint rowToDelete = _transferRequest[sender][recipient].transferKeysIdx;
        address keyToMove = keys[keys.length-1];
        keys[rowToDelete] = keyToMove;
        _transferRequest[sender][keyToMove].transferKeysIdx = rowToDelete;
        keys.pop();

        keys = _confirmRemittanceKeys[recipient];
        rowToDelete = _transferRequest[sender][recipient].confirmKeysIdx;
        keyToMove = keys[keys.length-1];
        keys[rowToDelete] = keyToMove;
        _transferRequest[keyToMove][recipient].confirmKeysIdx = rowToDelete;
        keys.pop();
        delete _transferRequest[sender][recipient];
    }

    function revokeRequest(address recipient) public onlyBank returns (bool) {
        require(_rp._banks(recipient), "Liability: You can only revoke the request to banks");
        require(_transferRequest[_msgSender()][recipient].amount > 0, "Liability: You cannot revoke the request before sending the request");

        deleteRequest(_msgSender(), recipient);

        // emit RevokeRequest(_msgSender(), recipient);
        return true;
    }

    function accept(address sender) public onlyBank returns (bool) {
        require(_rp._banks(sender), "Liability: You can only accept the request from banks");
        uint256 amount = _transferRequest[sender][_msgSender()].amount;
        require(amount != 0, "Liability: The sender didn't send the transfer request");
        _liabilities[sender] += int256(amount);
        _liabilities[_msgSender()] -= int256(amount);
        
        deleteRequest(sender, _msgSender());

        // _credit.changeLoanLender(sender, _msgSender());

        emit Accept(_msgSender(), sender, amount);
        return true;
    }

    function increaseLiability(address addr, uint256 amount) public {
        require(_msgSender() == _owner || _msgSender() == address(_rp));
        require(amount != 0, "Liability: increase zero amount");
        _liabilities[addr] -= int256(amount);
        // _totalLiability -= int256(amount);
    }

    function decreaseLiability(address addr, uint256 amount) public {
        require(_msgSender() == _owner || _msgSender() == address(_rp));
        require(amount != 0, "Liability: decrease zero amount");
        _liabilities[addr] += int256(amount);
        // _totalLiability += int256(amount);
    }

    function getTransferRequest(address recipient) public view onlyBank returns (uint256) {
        return _transferRequest[_msgSender()][recipient].amount;
    }

    function getTransferRequestKeys() public view onlyBank returns (address[] memory) {
        return _transferRequestKeys[_msgSender()];
    }

    function getConfirmRemittance(address sender) public view onlyBank returns (uint256) {
        return _transferRequest[sender][_msgSender()].amount;
    }

    function getConfirmRemittanceKeys() public view onlyBank returns (address[] memory) {
        return _confirmRemittanceKeys[_msgSender()];
    }    
}

contract BL_RPToken {
    function _banks(address) public view returns (bool) {}
}

/* contract BL_Credit {
    function changeLoanLender(address, address) public {}
} */
