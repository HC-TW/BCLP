// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

contract Credit is Context {
    struct loanRecord {
        // address borrower;
        // address bank;
        uint256 loanAmount;
        uint256 pointsAmount;
        uint256 timestamp;
        uint16 monthN;
        uint16 annualInterestRate; // This value should be divided by 1000. Ex: 3% = 30 / 1000
        uint256 loanBalance;
        string option; // Loan case or something else
    }

    struct keyList {
        address[] keys;
        mapping(address => bool) existing;
    }

    address public _owner;
    address public _BankLiabilityAddr;
    C_RPToken private _rp;

    mapping(address => mapping(address => loanRecord[])) private _loanRecords;
    mapping(address => keyList) private _bankToBorrowers;

    event Loan(
        address indexed borrower,
        address indexed bank,
        uint256 loanAmount,
        uint256 pointsAmount,
        uint256 timestamp,
        uint16 monthN,
        uint16 annualInterestRate,
        uint256 loanBalance
    );

    event Repay(address indexed borrower, address indexed bank, uint16 index, uint256 amount);

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
        _rp = C_RPToken(RPTokenAddr);
    }

    function setBankLiabilityAddr(address addr) public onlyOwner {
        _BankLiabilityAddr = addr;
    }

    function loan(
        address borrower,
        uint256 loanAmount,
        uint256 pointsAmount,
        uint16 monthN,
        uint16 annualInterestRate,
        string memory option
    ) public onlyBank {
        //uint256 monthlyDueDate = block.timestamp + 30 days;
        uint256 timestamp = block.timestamp;
        _loanRecords[_msgSender()][borrower].push() = loanRecord(
            loanAmount,
            pointsAmount,
            timestamp,
            monthN,
            annualInterestRate,
            loanAmount,
            option
        );
        if (!_bankToBorrowers[_msgSender()].existing[borrower]) {
            _bankToBorrowers[_msgSender()].keys.push(borrower);
            _bankToBorrowers[_msgSender()].existing[borrower] = true;
        }
        _rp.deliver(_msgSender(), borrower, pointsAmount);

        emit Loan(borrower, _msgSender(), loanAmount, pointsAmount, timestamp, monthN, annualInterestRate, loanAmount);
    }

    function repay(address borrower, uint16 index, uint256 amount) public onlyBank {
        require(_loanRecords[_msgSender()][borrower][index].loanBalance >= amount, "Repay too much money");
        _loanRecords[_msgSender()][borrower][index].loanBalance -= amount;

        emit Repay(borrower, _msgSender(), index, amount);
    }

    function changeLoanLender(address oldBank, address newBank) public {
        require(_msgSender() == _owner || _msgSender() == _BankLiabilityAddr);
        address[] memory keys = _bankToBorrowers[oldBank].keys;
        for (uint256 i = 0; i < keys.length; i++) {
            _loanRecords[newBank][keys[i]] = _loanRecords[oldBank][keys[i]];
            delete _loanRecords[oldBank][keys[i]];
        }
        delete _bankToBorrowers[oldBank];
    }

    function getLoanBalanceOfBank() public view onlyBank returns (uint256) {
        uint256 totalLoanBalance;
        address[] memory keys = _bankToBorrowers[_msgSender()].keys;
        for (uint256 i = 0; i < keys.length; i++) {
            loanRecord[] memory loanRecords = _loanRecords[_msgSender()][keys[i]];
            for (uint256 j = 0; j < loanRecords.length; j++) {
                totalLoanBalance += loanRecords[j].loanBalance;
            }
        }
        return totalLoanBalance;
    }

    function getLoanRecord(address bank, address borrower, uint16 index) public view returns (loanRecord memory) {
        require(_msgSender() == bank || _msgSender() == borrower, "You can only get records related to yourself");
        return _loanRecords[bank][borrower][index];
    }
}

contract C_RPToken {
    function _banks(address) public view returns (bool) {}

    function deliver(address, address, uint256) public returns (bool) {}
}
