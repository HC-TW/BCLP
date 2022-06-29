const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { JWTconfig } = require('../../config');
const User = require('../../models').user;

const Adminconfig = require('../../config.js').Adminconfig;
const RPToken = require('../../abis/RPToken.json');
const BankLiability = require('../../abis/RPToken.json');
const ProductManager = require('../../abis/ProductManager.json');
const PointExchange = require('../../abis/PointExchange.json');

const RPToken_networkData = RPToken.networks[56]
const BankLiability_networkData = BankLiability.networks[56]
const ProductManager_networkData = ProductManager.networks[56]
const PointExchange_networkData = PointExchange.networks[56]

const rpToken = new web3.eth.Contract(RPToken.abi, RPToken_networkData.address)
const bankLiability = new web3.eth.Contract(BankLiability.abi, BankLiability_networkData.address)
const productManager = new web3.eth.Contract(ProductManager.abi, ProductManager_networkData.address)
const pointExchange = new web3.eth.Contract(PointExchange.abi, PointExchange_networkData.address)

const system = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
const bank1 = '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0';
const bank2 = '0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC';
const issuer = '0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b';
const user = '0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9';
const merchant = '0x28a8746e75304c0780E011BEd21C72cD78cd535E';

exports.decentralizedLogin = (req, res, next) => {
	const handleAuthenticate = async ({ publicAddress, signature }) => {
		console.log({ publicAddress, signature })
		const response = await fetch(`http://localhost:8080/api/auth`, {
			body: JSON.stringify({ publicAddress, signature }),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		});
		return await response.json();
	};
	const handleSignMessage = async (user) => {
		try {
			const publicAddress = user.publicAddress;
			const signature = await web3.eth.accounts.sign(
				`I am signing my one-time nonce: ${user.nonce}`,
				privateKey
			).signature;

			return { publicAddress, signature };
		} catch (err) {
			console.log(err)
		}
	};
	const handleSignup = async (publicAddress) => {
		const response = await fetch(`http://localhost:8080/api/users`, {
			body: JSON.stringify({ publicAddress }),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		});
		return await response.json();
	};
	const publicAddress = req.query.publicAddress;
	const privateKey = req.query.privateKey;

	// Look if user with current publicAddress is already present on backend
	return fetch(
		`http://localhost:8080/api/users?publicAddress=${publicAddress}`
	)
		.then((response) => response.json())
		// If yes, retrieve it. If no, create it.
		.then((users) =>
			users.length ? users[0] : handleSignup(publicAddress)
		)
		// Popup MetaMask confirmation modal to sign message
		.then(handleSignMessage)
		// Send signature to backend on the /auth route
		.then(handleAuthenticate)
		.then((accessToken) => res.json({ accessToken }))
		.catch(next)
}

exports.login = (req, res, next) => {
	const handleAuthenticate = async ({ publicAddress, signature }) => {
		console.log({ publicAddress, signature })

		return (
			User.findOne({ where: { publicAddress } })
				////////////////////////////////////////////////////
				// Step 1: Get the user with the given publicAddress
				////////////////////////////////////////////////////
				.then((user) => {
					if (!user) {
						res.status(401).send({
							error: `User with publicAddress ${publicAddress} is not found in database`,
						});

						return null;
					}
					return user;
				})
				////////////////////////////////////////////////////
				// Step 2: Verify digital signature
				////////////////////////////////////////////////////
				.then((user) => {
					if (!(user instanceof User)) {
						// Should not happen, we should have already sent the response
						throw new Error(
							'User is not defined in "Verify digital signature".'
						);
					}

					if (publicAddress === account && signature === password) {
						return user;
					} else {
						res.status(401).send({
							error: 'Signature verification failed',
						});

						return null;
					}
				})
				////////////////////////////////////////////////////
				// Step 3: Generate a new nonce for the user
				////////////////////////////////////////////////////
				.then((user) => {
					if (!(user instanceof User)) {
						// Should not happen, we should have already sent the response

						throw new Error(
							'User is not defined in "Generate a new nonce for the user".'
						);
					}

					user.nonce = Math.floor(Math.random() * 1000000);
					return user.save();
				})
				////////////////////////////////////////////////////
				// Step 4: Create JWT
				////////////////////////////////////////////////////
				.then((user) => {
					return new Promise((resolve, reject) => {
						// https://github.com/auth0/node-jsonwebtoken
						jwt.sign(
							{
								payload: {
									id: user.id,
									account,
								},
							},
							JWTconfig.secret,
							{
								algorithm: JWTconfig.algorithms[0],
							},
							(err, token) => {
								if (err) {
									return reject(err);
								}
								if (!token) {
									return new Error('Empty token');
								}
								return resolve(token);
							}
						)
					});
				})
				.catch(next)
		);
	};
	const handleSignMessage = async (user) => {
		try {
			const publicAddress = user.publicAddress;
			const signature = 'password';

			return { publicAddress, signature };
		} catch (err) {
			console.log(err)
		}
	};
	const handleSignup = async (publicAddress) => {
		const response = await fetch(`http://localhost:8080/api/users`, {
			body: JSON.stringify({ publicAddress }),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		});
		return await response.json();
	};

	const account = req.query.publicAddress;
	const password = 'password';
	// Look if user with current publicAddress is already present on backend
	return fetch(
		`http://localhost:8080/api/users?publicAddress=${account}`
	)
		.then((response) => response.json())
		// If yes, retrieve it. If no, create it.
		.then((users) =>
			users.length ? users[0] : handleSignup(account)
		)
		// Popup MetaMask confirmation modal to sign message
		.then(handleSignMessage)
		// Send signature to backend on the /auth route
		.then(handleAuthenticate)
		.then((accessToken) => {
			res.json({ accessToken: { 'accessToken': accessToken } })
		})
		.catch(next)
}

exports.addUser = async (req, res, next) => {
	const publicAddress = req.query.publicAddress
	rpToken.methods.addUser(publicAddress).send({ from: Adminconfig.address })
		.on('receipt', receipt => {
			return res.json(receipt)
		})
		.catch(next)
}

exports.deliver = async (req, res, next) => {
	rpToken.methods.deliver(issuer, 1).send({ from: bank1, gas: 2100000 })
		.on('receipt', receipt => {
			return res.json(receipt)
		})
		.catch(next)
}

exports.issue = async (req, res, next) => {
	rpToken.methods.issue(user, 1).send({ from: issuer, gas: 2100000 })
		.on('receipt', receipt => {
			return res.json(receipt)
		})
		.catch(next)
}

exports.redeem = async (req, res, next) => {
	rpToken.methods.redeem(merchant, 'test', 1, 1).send({ from: user, gas: 2100000 })
		.on('receipt', receipt => {
			return res.json(receipt)
		})
		.catch(next)
}

exports.redeem5000 = async (req, res, next) => {
	const tx = {
		nonce: await web3.eth.getTransactionCount(user, 'pending'),
		from: user,
		to: rpToken._address,
		gas: 6721975,
		data: rpToken.methods.redeem(merchant, 'test5000', 1, 5000).encodeABI()
	};
	const signedTx = await web3.eth.accounts.signTransaction(tx, 'e485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52')
	web3.eth.sendSignedTransaction(signedTx.rawTransaction)
		.on('receipt', receipt => {
			return res.json(receipt)
		})
		.catch(next)
}

exports.realize = async (req, res, next) => {
	rpToken.methods.realize(bank1, 1).send({ from: merchant })
		.on('receipt', receipt => {
			return res.json(receipt)
		})
		.catch(next)
}

exports.exchangeRP = async (req, res, next) => {
	pointExchange.methods.exchangeRP(bank1, user, "OP", 1, 1).send({ from: Adminconfig.address, gas: 210000 })
		.on('receipt', receipt => {
			return res.json(receipt)
		})
		.catch(next)
}

exports.exchangeOther = async (req, res, next) => {
	pointExchange.methods.exchangeOther(bank1, user, "OP", 1, 1).send({ from: Adminconfig.address, gas: 210000 })
		.on('receipt', receipt => {
			return res.json(receipt)
		})
		.catch(next)
}

exports.uploadProduct = async (req, res, next) => {
	productManager.methods.uploadProduct('imageHash', 'productName', 'productDescription', 1).send({ from: merchant, gas: 420000 })
		.on('receipt', receipt => {
			return res.json(receipt)
		})
		.catch(next)
}

exports.removeProduct = async (req, res, next) => {
	const id = req.query.id
	productManager.methods.removeProduct(id).send({ from: merchant, gas: 210000 })
		.on('receipt', receipt => {
			return res.json(receipt)
		})
		.catch(next)
}

exports.viewProduct = async (req, res, next) => {
	const id = req.query.id
	productManager.methods._products(id).call({ from: user })
		.then(result => {
			return res.json(result)
		})
		.catch(next)
}
