const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const fetch = require('node-fetch');

const RPToken = require('../../abis/RPToken.json');
const RPToken_networkData = RPToken.networks[56]
const rpToken = new web3.eth.Contract(RPToken.abi, RPToken_networkData.address)

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
			const signature = await web3.eth.sign(
				`I am signing my one-time nonce: ${user.nonce}`,
				publicAddress
			);
			console.log(signature)

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

exports.deliver = (req, res, next) => {
	rpToken.methods.deliver(issuer, 1).send({ from: bank1 })
		.on('receipt', receipt => {
			return res.json(receipt)
		})
		.on('error', error => {
			const msg = error.message
			const startIdx = msg.indexOf('"reason":') + 10
			const endIdx = msg.indexOf('"},"stack"')
			console.log(msg.substr(startIdx, endIdx - startIdx) === '' ? msg : msg.substr(startIdx, endIdx - startIdx), 'danger')
		})
}