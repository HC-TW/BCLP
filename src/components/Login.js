import './Login.scss';

import React, { useState } from 'react';
import Identicon from 'identicon.js';
import LoginNavbar from './LoginNavbar';
import Header from './Header';

export const Login = ({ account, onLoggedIn }) => {
	const [loading, setLoading] = useState(false); // Loading button state

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
			const signature = await window.web3.eth.personal.sign(
				`I am signing my one-time nonce: ${user.nonce}`,
				publicAddress,
				'' // MetaMask will ignore the password argument here
			);

			return { publicAddress, signature };
		} catch (err) {
			throw new Error(
				'You need to sign the message to be able to log in.'
			);
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

	const handleClick = async () => {
		const coinbase = await window.web3.eth.getCoinbase();
		if (!coinbase) {
			window.alert('Please activate MetaMask first.');
			return;
		}

		const publicAddress = coinbase.toLowerCase();

		setLoading(true);

		// Look if user with current publicAddress is already present on backend
		fetch(
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
			// Pass accessToken back to parent component (to save it in localStorage)
			.then(onLoggedIn)
			.catch((err) => {
				window.alert(err);
				setLoading(false);
			});
	};

	return (
		<div>
			<LoginNavbar/>
			<Header/>
			<p class="my-4 text-center font-monospace">
				Your Ethereum address: {account}
				{account
					? <img
						className='ms-2'
						width='30'
						height='30'
						src={`data:image/png;base64,${new Identicon(account, 30).toString()}`}
					/>
					: <span></span>
				}
				<br/>
				<button className="btn btn-outline-primary btn-lg Login-button" onClick={handleClick}>
					{loading ? 'Loading...' : 'Login with MetaMask'}
				</button>
			</p>
		</div>
	);
};
