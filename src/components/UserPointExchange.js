import React, { useCallback, useEffect, useState } from 'react';
import { Tab, Nav, Modal, Button } from 'react-bootstrap';
import Navbar from './MyNavbar';
import Header from './Header';
import { Adminconfig } from '../config';
import $ from 'jquery';
import RPImage from '../images/RP.png';

export const UserPointExchange = ({ account, role, onLoggedOut }) => {
	const [rates, setRates] = useState([]);
	const [other2otherRates, setOther2OtherRates] = useState([]);
	const [exchange_issuer, setExchangeIssuer] = useState('');
	const [exchange_name1, setExchangeName1] = useState('');
	const [exchange_name2, setExchangeName2] = useState('');
	const [exchange_old_amount, setExchangeOldAmount] = useState(0);
	const [exchange_amount, setExchangeAmount] = useState(0);
	const [rp2other_exchange_show, setRP2OtherExchangeShow] = useState(false);
	const [other2rp_exchange_show, setOther2RPExchangeShow] = useState(false);
	const [other2other_exchange_show, setOther2OtherExchangeShow] = useState(false);
	const [rp2other_exchange_success_show, setRP2OtherExchangeSuccessShow] = useState(false);
	const [other2rp_exchange_success_show, setOther2RPExchangeSuccessShow] = useState(false);
	const [other2other_exchange_success_show, setOther2OtherExchangeSuccessShow] = useState(false);

	const loadExchangeLists = useCallback(async () => {
		const gcd = (a, b) => {
			if (b === 0)
				return a;
			return gcd(b, a % b);
		}
		// Returns smallest integer k such that k * str becomes
		// natural. str is an input floating point number
		const findNum = (str) => {
			var n = str.length;
			var count_after_dot = 0;
			let dot_seen = false;
	 
			// To find numerator in fraction form of
			// given number. For example, for 30.25,
			// numerator would be 3025.
			var num = 0;
			for (let i = 0; i < n; i++) {
				if (str.charAt(i) !== '.') {
					num = num * 10 + (str.charAt(i) - '0');
					if (dot_seen === true)
						count_after_dot++;
				} else
					dot_seen = true;
			}
	 
			// If there was no dot, then number
			// is already a natural.
			if (dot_seen === false)
				return 1;
	 
			// Find denominator in fraction form. For example,
			// for 30.25, denominator is 100
			var dem = parseInt( Math.pow(10, count_after_dot));
	 
			// Result is denominator divided by
			// GCD-of-numerator-and-denominator. For example, for
			// 30.25, result is 100 / GCD(3025, 100) = 100/25 = 4
			return (dem / gcd(num, dem));
		}
		const rateCount = await window.pointExchange.methods._rateCount().call()
		for (let i = 1; i <= rateCount; i++) {
			const rate = await window.pointExchange.methods._rates(i).call()
			if (Number(rate.id) !== 0) {
				setRates(oldRates => [...oldRates, rate])
				for (let j = i+1; j <= rateCount; j++) {
					const anotherRate = await window.pointExchange.methods._rates(j).call()
					if (Number(anotherRate.id) !== 0) {
						const otherPointRate1 = Number(rate.RP) / Number(rate.otherPoint)
						const otherPointRate2 = Number(anotherRate.RP) / Number(anotherRate.otherPoint)
						const ratio1 = Math.round(((otherPointRate1 / otherPointRate2 + Number.EPSILON) * 100)) / 100
						const smallestMulNum1 = findNum(ratio1.toString())
						const ratio2 = Math.round(((otherPointRate2 / otherPointRate1 + Number.EPSILON) * 100)) / 100
						const smallestMulNum2 = findNum(ratio2.toString())
						if (otherPointRate1 >= otherPointRate2) {
							setOther2OtherRates(oldRates => [...oldRates, { imgHash: rate.imgHash, otherPoint1: Math.min(smallestMulNum1, smallestMulNum2), otherPoint2: smallestMulNum1 <= smallestMulNum2 ? ratio1*smallestMulNum1 : ratio2*smallestMulNum2, name1: rate.name, name2: anotherRate.name, bank: rate.bank }])
							setOther2OtherRates(oldRates => [...oldRates, { imgHash: anotherRate.imgHash, otherPoint1: smallestMulNum1 <= smallestMulNum2 ? ratio1*smallestMulNum1 : ratio2*smallestMulNum2, otherPoint2: Math.min(smallestMulNum1, smallestMulNum2), name1: anotherRate.name, name2: rate.name, bank: anotherRate.bank }])	
						} else {
							setOther2OtherRates(oldRates => [...oldRates, { imgHash: rate.imgHash, otherPoint1: smallestMulNum1 <= smallestMulNum2 ? ratio1*smallestMulNum1 : ratio2*smallestMulNum2, otherPoint2: Math.min(smallestMulNum1, smallestMulNum2), name1: rate.name, name2: anotherRate.name, bank: rate.bank }])
							setOther2OtherRates(oldRates => [...oldRates, { imgHash: anotherRate.imgHash, otherPoint1: Math.min(smallestMulNum1, smallestMulNum2), otherPoint2: smallestMulNum1 <= smallestMulNum2 ? ratio1*smallestMulNum1 : ratio2*smallestMulNum2, name1: anotherRate.name, name2: rate.name, bank: anotherRate.bank }])
						}
					}
				}
			}
		}
	}, [])

	useEffect(() => {
		loadExchangeLists()
	}, [loadExchangeLists])

	const loadRP = async () => {
		$('#rp').text(await window.rpToken.methods.balanceOf(account).call({ from: account }))
	}

	const rp2otherExchange = async () => {
		console.log(exchange_issuer)
		const web3 = window.web3
		const pointExchange = window.pointExchange
		const tx = {
			from: Adminconfig.address,
			to: pointExchange.options.address,
			gas: 6721975,
			data: pointExchange.methods.exchangeOther(exchange_issuer, account, exchange_name2, exchange_old_amount, exchange_amount).encodeABI()
		};
		const signedTx = await web3.eth.accounts.signTransaction(tx, Adminconfig.key)
		web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			console.log(msg)
			loadRP()
			rp2otherHandleClose()
			rp2otherSuccessHandleShow()
		})
		.on('error', error => {
			const msg = error.message
			const startIdx = msg.indexOf('"reason":') + 10
			const endIdx = msg.indexOf('"stack"') - 8
			window.alert(msg.substr(startIdx, endIdx - startIdx) === '' ? msg : msg.substr(startIdx, endIdx - startIdx))
		})
	}

	const other2rpExchange = async () => {
		console.log(exchange_issuer)
		const web3 = window.web3
		const pointExchange = window.pointExchange
		const tx = {
			from: Adminconfig.address,
			to: pointExchange.options.address,
			gas: 6721975,
			data: pointExchange.methods.exchangeRP(exchange_issuer, account, exchange_name1, exchange_old_amount, exchange_amount).encodeABI()
		};
		const signedTx = await web3.eth.accounts.signTransaction(tx, Adminconfig.key)
		web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			console.log(msg)
			loadRP()
			other2rpHandleClose()
			other2rpSuccessHandleShow()
		})
		.on('error', error => {
			const msg = error.message
			const startIdx = msg.indexOf('"reason":') + 10
			const endIdx = msg.indexOf('"},"stack"') - 8
			window.alert(msg.substr(startIdx, endIdx - startIdx) === '' ? msg : msg.substr(startIdx, endIdx - startIdx))
		})
	}

	const other2otherExchange = async () => {
		console.log(exchange_issuer)
		other2otherHandleClose()
		other2otherSuccessHandleShow()
	}

	const rp2otherHandleShow = (event, issuer, name, RP, otherPoint) => {
		const input = $(event.target.parentElement).find('input')
		if (input.val() === '') {
			input.val(1)
		}
		setExchangeIssuer(issuer)
		setExchangeName1('RP')
		setExchangeName2(name)
		setExchangeOldAmount(RP * input.val())
		setExchangeAmount(otherPoint * input.val())
		setRP2OtherExchangeShow(true)
	}

	const rp2otherHandleClose = () => {
		setRP2OtherExchangeShow(false)
	}

	const other2rpHandleShow = (event, issuer, name, otherPoint, RP) => {
		const input = $(event.target.parentElement).find('input')
		if (input.val() === '') {
			input.val(1)
		}
		setExchangeIssuer(issuer)
		setExchangeName1(name)
		setExchangeName2('RP')
		setExchangeOldAmount(otherPoint * input.val())
		setExchangeAmount(RP * input.val())
		setOther2RPExchangeShow(true)
	}

	const other2rpHandleClose = () => {
		setOther2RPExchangeShow(false)
	}

	const other2otherHandleShow = (event, issuer, name1, name2, otherPoint1, otherPoint2) => {
		const input = $(event.target.parentElement).find('input')
		if (input.val() === '') {
			input.val(1)
		}
		setExchangeIssuer(issuer)
		setExchangeName1(name1)
		setExchangeName2(name2)
		setExchangeOldAmount(otherPoint1 * input.val())
		setExchangeAmount(otherPoint2 * input.val())
		setOther2OtherExchangeShow(true)
	}

	const other2otherHandleClose = () => {
		setOther2OtherExchangeShow(false)
	}

	const rp2otherSuccessHandleShow = () => {
		setRP2OtherExchangeSuccessShow(true)
	}

	const rp2otherSuccessHandleClose = () => {
		setRP2OtherExchangeSuccessShow(false)
	}

	const other2rpSuccessHandleShow = () => {
		setOther2RPExchangeSuccessShow(true)
	}

	const other2rpSuccessHandleClose = () => {
		setOther2RPExchangeSuccessShow(false)
	}

	const other2otherSuccessHandleShow = () => {
		setOther2OtherExchangeSuccessShow(true)
	}

	const other2otherSuccessHandleClose = () => {
		setOther2OtherExchangeSuccessShow(false)
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
									<Nav.Link eventKey="rp2other">RP {<i className="bi bi-arrow-right-circle-fill"></i>} Other Point</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="other2rp">Other Point {<i className="bi bi-arrow-right-circle-fill"></i>} RP</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="other2other">Other Point {<i className="bi bi-arrow-right-circle-fill"></i>} Other Point</Nav.Link>
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
														<img className="card-img-top" src={RPImage} alt="..." />
														{/* <!-- Points details--> */}
														<div className="card-body p-4">
															<div className="text-center">
																{/* <!-- Points Issuer--> */}
																<h5 className="fw-bolder">{window.pointExchange._address}</h5>
																{/* <!-- Points name--> */}
																<h5 className="fw-bolder">RP</h5>
																{/* <!-- Points rate--> */}
																<h6>{rate.RP} <span className="text-secondary">RP</span> {<i className="bi bi-arrow-right-circle-fill"></i>} {rate.otherPoint} <span className="text-secondary">{rate.name}</span></h6>
															</div>
														</div>
														{/* <!-- Points actions--> */}
														<div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
															<div className="input-group text-center">
																<input type="number" className="form-control" min="1" max="100" />
																<button type="button" className="btn btn-outline-dark" onClick={(e) => rp2otherHandleShow(e, rate.bank, rate.name, rate.RP, rate.otherPoint)}>Exchange</button>
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
																<h6>{rate.otherPoint} <span className="text-secondary">{rate.name}</span> {<i className="bi bi-arrow-right-circle-fill"></i>} {rate.RP} <span className="text-secondary">RP</span></h6>
															</div>
														</div>
														{/* <!-- Points actions--> */}
														<div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
															<div className="input-group text-center">
																<input type="number" className="form-control" min="1" max="100" />
																<button type="button" className="btn btn-outline-dark" onClick={(e) => other2rpHandleShow(e, rate.bank, rate.name, rate.otherPoint, rate.RP)}>Exchange</button>
															</div>
														</div>
													</div>
												</div>
											)
										})}
									</div>
								</Tab.Pane>
								<Tab.Pane eventKey="other2other">
									<div className="row gx-4 gx-lg-5 row-cols-3 row-cols-md-4 row-cols-xl-5 justify-content-center">
										{other2otherRates.map((rate, idx) => {
											return (
												<div className="col mb-5" key={'other2other_' + idx}>
													<div className="card shadow h-100">
														{/* <!-- Points image--> */}
														<img className="card-img-top" src={`https://ipfs.infura.io/ipfs/${rate.imgHash}`} alt="..." />
														{/* <!-- Points details--> */}
														<div className="card-body p-4">
															<div className="text-center">
																{/* <!-- Points Issuer--> */}
																<h5 className="fw-bolder">{rate.bank}</h5>
																{/* <!-- Points name--> */}
																<h5 className="fw-bolder">{rate.name1}</h5>
																{/* <!-- Points rate--> */}
																<h6>{rate.otherPoint1} <span className="text-secondary">{rate.name1}</span> {<i className="bi bi-arrow-right-circle-fill"></i>} {rate.otherPoint2} <span className="text-secondary">{rate.name2}</span></h6>
															</div>
														</div>
														{/* <!-- Points actions--> */}
														<div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
															<div className="input-group text-center">
																<input type="number" className="form-control" min="1" max="100" />
																<button type="button" className="btn btn-outline-dark" onClick={(e) => other2otherHandleShow(e, rate.bank, rate.name1, rate.name2, rate.otherPoint1, rate.otherPoint2)}>Exchange</button>
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
			<Modal show={rp2other_exchange_show} onHide={rp2otherHandleClose} centered>
				<Modal.Header closeButton>
					<Modal.Title>Exchange</Modal.Title>
				</Modal.Header>
				<Modal.Body>Are you sure you want to exchange {exchange_old_amount} {exchange_name1} for {exchange_amount} {exchange_name2}?</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={rp2otherHandleClose}>
						No
					</Button>
					<Button variant="primary" onClick={rp2otherExchange}>
						Yes
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Modal */}
			<Modal show={other2rp_exchange_show} onHide={other2rpHandleClose} centered>
				<Modal.Header closeButton>
					<Modal.Title>Exchange</Modal.Title>
				</Modal.Header>
				<Modal.Body>Are you sure you want to exchange {exchange_old_amount} {exchange_name1} for {exchange_amount} {exchange_name2}?</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={other2rpHandleClose}>
						No
					</Button>
					<Button variant="primary" onClick={other2rpExchange}>
						Yes
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Modal */}
			<Modal show={other2other_exchange_show} onHide={other2otherHandleClose} centered>
				<Modal.Header closeButton>
					<Modal.Title>Exchange</Modal.Title>
				</Modal.Header>
				<Modal.Body>Are you sure you want to exchange {exchange_old_amount} {exchange_name1} for {exchange_amount} {exchange_name2}?</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={other2otherHandleClose}>
						No
					</Button>
					<Button variant="primary" onClick={other2otherExchange}>
						Yes
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Modal */}
			<Modal show={rp2other_exchange_success_show} onHide={rp2otherSuccessHandleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Exchange</Modal.Title>
				</Modal.Header>
				<Modal.Body>Exchange {exchange_old_amount} {exchange_name1} for {exchange_amount} {exchange_name2} successfully!</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={rp2otherSuccessHandleClose}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Modal */}
			<Modal show={other2rp_exchange_success_show} onHide={other2rpSuccessHandleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Exchange</Modal.Title>
				</Modal.Header>
				<Modal.Body>Exchange {exchange_old_amount} {exchange_name1} for {exchange_amount} {exchange_name2} successfully!</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={other2rpSuccessHandleClose}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Modal */}
			<Modal show={other2other_exchange_success_show} onHide={other2otherSuccessHandleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Exchange</Modal.Title>
				</Modal.Header>
				<Modal.Body>Exchange {exchange_old_amount} {exchange_name1} for {exchange_amount} {exchange_name2} successfully!</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={other2otherSuccessHandleClose}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};
