// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

contract ProductManager is Context{

    PM_RPToken private _rp;
	uint public _productCount = 0;
	mapping(uint => Product) public _products;
	mapping (address => uint[]) private _merchantKeys;

	mapping(address => mapping(address => Order[])) private _orders;
    mapping(address => address[]) private _orderParites;

	// Store Products
	struct Product {
		uint id;
		string imgHash;
		string name;
		string description;
		uint price;
		address merchant;
		uint keysIdx;
	}

	struct Order {
		string name;
		uint quantity;
		uint amount;
		bool isFinished;
		uint timestamp;
	}
	
	/* event ProductCreated(
		uint id,
		string imgHash,
		string name,
		string description,
		uint price,
		address merchant
	);

	event ProductRemoved(
		uint id,
		string imgHash,
		string name,
		string description,
		uint price,
		address merchant
	); */

	modifier onlyMerchant() {
        require(_rp._merchants(_msgSender()), "You are not a merchant");
        _;
    }
	
	constructor (address RPTokenAddr) {
        _rp = PM_RPToken(RPTokenAddr);
	}

	// Create Products
	function uploadProduct(string memory imgHash, string memory name, string memory description, uint price) public onlyMerchant {
		require(bytes(imgHash).length > 0, "Product: Product image hash cannot be empty");
		require(bytes(name).length > 0, "Product: Product name cannot be empty");
		require(price > 0, "Product: Product price must be greater than zero");
		_merchantKeys[_msgSender()].push(++_productCount);
		_products[_productCount] = Product(_productCount, imgHash, name, description, price, _msgSender(), _merchantKeys[_msgSender()].length - 1);
		
		// emit ProductCreated(_productCount, imgHash, name, description, price, _msgSender());
	}
	// Remove Products
	function removeProduct(uint id) public onlyMerchant {
		require(id <= _productCount, "Product: No such product");
		Product memory product = _products[id];
		require(product.merchant == _msgSender(), "Product: You cannot remove other merchants' product");
		uint[] storage keys = _merchantKeys[_msgSender()];
        uint rowToDelete = product.keysIdx;
        uint keyToMove = keys[keys.length-1];
        keys[rowToDelete] = keyToMove;
        _products[keyToMove].keysIdx = rowToDelete;
        keys.pop();
		delete _products[id];

		// emit ProductRemoved(_productCount, product.imgHash, product.name, product.description, product.price, product.merchant);
	}
	// Create Orders
	function createOrder(address user, address merchant, string memory name, uint quantity, uint amount) public {
		require(_msgSender() == address(_rp));
		if (_orders[user][merchant].length == 0) {
			_orderParites[user].push(merchant);
			_orderParites[merchant].push(user);
		}
		_orders[user][merchant].push(Order(name, quantity, amount, false, block.timestamp));
	}
	// Finish Orders
	function finishOrder(address user, address merchant, uint idx) public {
		require(_msgSender() == address(_rp));
		Order[] storage orders = _orders[user][merchant];
		require(idx < orders.length, "Product: No such order");
		require(!orders[idx].isFinished, "Product: The order is finished");
		orders[idx].isFinished = true;
	}
	// Get Merchant Keys
	function getMerchantKeys() public view onlyMerchant returns (uint[] memory) {
		return _merchantKeys[_msgSender()];
	}
	// Get Orders
	function getOrders(address user, address merchant) public view returns (Order[] memory) {
		require(_msgSender() == user || _msgSender() == merchant);
		return _orders[user][merchant];
	}
	// Get Order Parties
	function getOrderParties() public view returns (address[] memory){
		return _orderParites[_msgSender()];
	}
}

contract PM_RPToken {
    function _merchants(address) public view returns (bool) {}
}