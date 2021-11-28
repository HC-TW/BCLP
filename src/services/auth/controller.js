const Web3 = require('web3');
const web3 = new Web3('ws://localhost:8545');
const { bufferToHex } = require('ethereumjs-util');
const jwt = require('jsonwebtoken');

const { JWTconfig } = require('../../config');
const User = require('../../models').user;

module.exports.create = (req, res, next) => {
	const { publicAddress, signature } = req.body;
	if (!signature || !publicAddress)
		return res
			.status(400)
			.send({ error: 'Request should have signature and publicAddress' });

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

				const msg = `I am signing my one-time nonce: ${user.nonce}`;
				const address = web3.eth.accounts.recover(msg, signature);
				// The signature verification is successful if the address found with
				// sigUtil.recoverPersonalSignature matches the initial publicAddress
				if (address.toLowerCase() === publicAddress.toLowerCase()) {
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
								publicAddress,
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
			.then((accessToken) => res.json({ accessToken }))
			.catch(next)
	);
}