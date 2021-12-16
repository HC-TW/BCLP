pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

contract ProductManager is Context{

	address public _RPToken;
    PM_RPToken private _rp;
	uint public productCount = 0;
	mapping(uint => Product) public products;

	// Store Images
	struct Product {
		uint id;
		string imgHash;
		string name;
		string description;
		uint price;
		address merchant;
	}
	
	event ProductCreated(
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
	);

	modifier onlyMerchant() {
        require(_rp._merchants(_msgSender()), "You are not a bank");
        _;
    }
	
	constructor (address RPTokenAddr) {
		_RPToken = RPTokenAddr;
        _rp = PM_RPToken(RPTokenAddr);
	}

	// Create Products
	function uploadProduct(string memory imgHash, string memory name, string memory description, uint price) public onlyMerchant {
		require(bytes(imgHash).length > 0, "Product: Product image hash cannot be empty");
		require(bytes(name).length > 0, "Product: Product name cannot be empty");
		require(price > 0, "Product: Product price must be greater than zero");
		products[++productCount] = Product(productCount, imgHash, name, description, price, _msgSender());
		emit ProductCreated(productCount, imgHash, name, description, price, _msgSender());
	}
	// Remove Products
	function removeProduct(uint id) public onlyMerchant {
		require(id <= productCount, "Product: No such product");
		Product memory product = products[id];
		require(product.merchant == _msgSender(), "Product: You cannot remove other merchants' product");
		delete products[id];
		emit ProductRemoved(productCount, product.imgHash, product.name, product.description, product.price, product.merchant);
	}
}

contract PM_RPToken {
    function _merchants(address) public view returns (bool) {}
}