const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const fetch = require('node-fetch');

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

}