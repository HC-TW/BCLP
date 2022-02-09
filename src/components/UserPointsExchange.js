import React, { useCallback, useEffect, useState } from 'react';
import { Tab, Nav, Modal, Button } from 'react-bootstrap';
import Navbar from './MyNavbar';
import Header from './Header';
import { Adminconfig } from '../config';
import $ from 'jquery';

export const UserPointsExchange = ({ account, role, onLoggedOut }) => {
	const [rates, setRates] = useState([]);
	const [rp_exchange_issuer, setRPExchangeIssuer] = useState('');
	const [rp_exchange_name, setRPExchangeName] = useState('');
	const [rp_exchange_old_amount, setRPExchangeOldAmount] = useState(0);
	const [rp_exchange_amount, setRPExchangeAmount] = useState(0);
	const [rp_exchange_show, setRPExchangeShow] = useState(false);
	const [success_show, setSuccessShow] = useState(false);

	const loadExchangeLists = useCallback(async () => {
		const rateCount = await window.pointsExchange.methods._rateCount().call()
		for (let i = 1; i <= rateCount; i++) {
			const rate = await window.pointsExchange.methods._rates(i).call()
			if (Number(rate.id) !== 0) {
				setRates(oldRates => [...oldRates, rate])
			}
		}
	}, [])

	useEffect(() => {
		loadExchangeLists()
	}, [loadExchangeLists])

	const loadRP = async () => {
		$('#rp').text(await window.rpToken.methods.balanceOf(account).call({ from: account }))
	}

	const rpExchange = async () => {
		console.log(rp_exchange_issuer)
		const web3 = window.web3
		const pointsExchange = window.pointsExchange
		const tx = {
			from: Adminconfig.address,
			to: pointsExchange.options.address,
			gas: 6721975,
			data: pointsExchange.methods.exchangeRP(rp_exchange_issuer, account, rp_exchange_name, rp_exchange_old_amount, rp_exchange_amount).encodeABI()
		};
		const signedTx = await web3.eth.accounts.signTransaction(tx, Adminconfig.key)
		web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			console.log(msg)
			loadRP()
			rpHandleClose()
			successHandleShow()
		})
	}

	const rpHandleShow = (event, issuer, name, oldAsset, newAsset) => {
		const input = $(event.target.parentElement).find('input')
		if (input.val() === '') {
			input.val(1)
		}
		setRPExchangeIssuer(issuer)
		setRPExchangeName(name)
		setRPExchangeOldAmount(oldAsset * input.val())
		setRPExchangeAmount(newAsset * input.val())
		setRPExchangeShow(true)
	}

	const rpHandleClose = () => {
		setRPExchangeShow(false)
	}

	const successHandleShow = () => {
		setSuccessShow(true)
	}

	const successHandleClose = () => {
		setSuccessShow(false)
	}

	return (
		<div>
			<Navbar account={account} role={role} onLoggedOut={onLoggedOut} />
			<Header />
			<div className="container px-4 px-lg-5 mt-4">
				<div className="row">
					<div className="col-lg-12 mb-4">
					<div className="card shadow mb-4">
						{/* <!-- Tabs --> */}
						<Tab.Container defaultActiveKey="rp2other">
							<Nav variant="pills">
								<Nav.Item>
									<Nav.Link eventKey="rp2other">RP {<i className="bi bi-arrow-right-circle-fill"></i>} Other points</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="other2rp">Other points {<i className="bi bi-arrow-right-circle-fill"></i>} RP</Nav.Link>
								</Nav.Item>
							</Nav>
							<div className="card-body tab-content">
								<Tab.Pane eventKey="rp2other">
								<div className="row gx-4 gx-lg-5 row-cols-3 row-cols-md-4 row-cols-xl-5 justify-content-center">
										{rates.map((rate) => {
											return (
												<div className="col mb-5" key={rate.id}>
													<div className="card shadow h-100">
														{/* <!-- Points image--> */}
														<img className="card-img-top" src={`https://ipfs.infura.io/ipfs/${rate.imgHash}`} alt="..." />
														{/* <!-- Points details--> */}
														<div className="card-body p-4">
															<div className="text-center">
																{/* <!-- Points Issuer--> */}
																<h5 className="fw-bolder">{rate.bank}</h5>
																{/* <!-- Points name--> */}
																<h5 className="fw-bolder">{rate.name}</h5>
																{/* <!-- Points rate--> */}
																<h6>{rate.RP} RP {<i className="bi bi-arrow-right-circle-fill"></i>} {rate.otherPoint} {rate.name}</h6>
															</div>
														</div>
														{/* <!-- Points actions--> */}
														<div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
															<div className="input-group text-center">
																<input type="number" className="form-control" min="1" max="100" />
																<button type="button" className="btn btn-outline-dark" onClick={(e) => rpHandleShow(e, rate.bank, rate.name, rate.otherPoint, rate.RP)}>Exchange</button>
															</div>
														</div>
													</div>
												</div>
											)
										})}
									</div>
								</Tab.Pane>
								<Tab.Pane eventKey="other2rp">
									<div className="row gx-4 gx-lg-5 row-cols-3 row-cols-md-4 row-cols-xl-5 justify-content-center">
										{rates.map((rate) => {
											return (
												<div className="col mb-5" key={'rp_' + rate.id}>
													<div className="card shadow h-100">
														{/* <!-- Points image--> */}
														<img className="card-img-top" src={`https://ipfs.infura.io/ipfs/${rate.imgHash}`} alt="..." />
														{/* <!-- Points details--> */}
														<div className="card-body p-4">
															<div className="text-center">
																{/* <!-- Points Issuer--> */}
																<h5 className="fw-bolder">{rate.bank}</h5>
																{/* <!-- Points name--> */}
																<h5 className="fw-bolder">{rate.name}</h5>
																{/* <!-- Points rate--> */}
																<h6>{rate.otherPoint} {rate.name} {<i className="bi bi-arrow-right-circle-fill"></i>} {rate.RP} RP</h6>
															</div>
														</div>
														{/* <!-- Points actions--> */}
														<div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
															<div className="input-group text-center">
																<input type="number" className="form-control" min="1" max="100" />
																<button type="button" className="btn btn-outline-dark" onClick={(e) => rpHandleShow(e, rate.bank, rate.name, rate.otherPoint, rate.RP)}>Exchange</button>
															</div>
														</div>
													</div>
												</div>
											)
										})}
									</div>
								</Tab.Pane>
							</div>
						</Tab.Container>
					</div>
					</div>

				</div>
			</div>

			{/* Modal */}
			<Modal show={rp_exchange_show} onHide={rpHandleClose} centered>
				<Modal.Header closeButton>
					<Modal.Title>Exchange</Modal.Title>
				</Modal.Header>
				<Modal.Body>Are you sure you want to exchange {rp_exchange_old_amount} {rp_exchange_name} for {rp_exchange_amount} RP?</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={rpHandleClose}>
						No
					</Button>
					<Button variant="primary" onClick={rpExchange}>
						Yes
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Modal */}
			<Modal show={success_show} onHide={successHandleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Exchange</Modal.Title>
				</Modal.Header>
				<Modal.Body>Points exchange successfully!</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={successHandleClose}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};
