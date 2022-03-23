import jwtDecode from 'jwt-decode';
import React, { Component } from 'react';
import { Form, Row, Col, InputGroup, Button, Nav, Tab, Collapse, Modal } from 'react-bootstrap';

import Navbar from './MyNavbar';
import Header from './Header';
import $ from 'jquery';

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

class Bank extends Component {

	async componentDidMount() {
		await this.loadUser();
		await this.loadRequests();
		await this.loadEvents();
		await this.loadRates();
	}

	componentWillUnmount() {
		this.setState(this.getInitialState())
	}

	async loadUser() {
		const { accessToken } = this.props.auth;
		const {
			payload: { id },
		} = jwtDecode(accessToken);

		const response = await fetch(`http://localhost:8080/api/users/${id}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})
		const user = await response.json()
		this.setState({ user })
		console.log(this.state.user)
	}

	async loadInfo() {
		const bankLiabilities = Number(await window.bankLiability.methods._liabilities(this.props.account).call({ from: this.props.account }))
		const totalSupply = Number(await window.rpToken.methods.totalSupply().call({ from: this.props.account }))
		const issuanceRatio = -bankLiabilities / (totalSupply ? totalSupply : 1) * 100
		$('#bankLiabilities').text(bankLiabilities + ' NTD')
		$('#totalSupply').text(totalSupply + ' RP')
		$('#issuanceRatio').text(issuanceRatio + '%')
		$('#issuanceRatioProgress').css('width', issuanceRatio + '%')
		$('#pendingRequest').text(this.state.transferRequests.length + this.state.confirmRemittances.length)
	}

	async loadRequests() {
		this.setState({ transferRequests: [] })
		this.setState({ confirmRemittances: [] })
		const transferRequestKeys = await window.bankLiability.methods.getTransferRequestKeys().call({ from: this.props.account })
		const confirmRemittanceKeys = await window.bankLiability.methods.getConfirmRemittanceKeys().call({ from: this.props.account })
		for (let i = 0; i < transferRequestKeys.length; i++) {
			this.setState({ transferRequests: [...this.state.transferRequests, [transferRequestKeys[i], await window.bankLiability.methods.getTransferRequest(transferRequestKeys[i]).call({ from: this.props.account })]] })
		}
		for (let i = 0; i < confirmRemittanceKeys.length; i++) {
			this.setState({ confirmRemittances: [...this.state.confirmRemittances, [confirmRemittanceKeys[i], await window.bankLiability.methods.getConfirmRemittance(confirmRemittanceKeys[i]).call({ from: this.props.account })]] })
		}
		this.loadInfo()
	}

	async loadRates() {
		this.setState({ rates: [] })
		const keys = await window.pointExchange.methods.getBankKeys().call({ from: this.props.account })
		for (let i = 0; i < keys.length; i++) {
			const rate = await window.pointExchange.methods._rates(keys[i]).call()
			this.setState({ rates: [...this.state.rates, rate] })
		}
	}

	loadEvents = () => {
		window.rpToken.events.Transfer({
			filter: { from: this.props.account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			this.setState({ deliverEvents: [...this.state.deliverEvents, [values.to, values.value, new Date(block.timestamp * 1000).toLocaleString()]] })
		})
		window.rpToken.events.Realize({
			filter: { bank: this.props.account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			this.setState({ realizeEvents: [...this.state.realizeEvents, [values.merchant, values.amount, new Date(block.timestamp * 1000).toLocaleString()]] })
		})
		window.bankLiability.events.Accept({
			filter: { sender: this.props.account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			this.setState({ realizeEvents: [...this.state.requestAcceptedEvents, [values.recipient, values.amount, new Date(block.timestamp * 1000).toLocaleString()]] })
		})
		window.bankLiability.events.Accept({
			filter: { recipient: this.props.account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			this.setState({ realizeEvents: [...this.state.realizeEvents, [values.sender, values.amount, new Date(block.timestamp * 1000).toLocaleString()]] })
		})
		window.pointExchange.events.ExchangeOther({
			filter: { bank: this.props.account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			this.setState({ exchangeOtherEvents: [...this.state.exchangeOtherEvents, [values.user, values.name, values.oldAmount, values.amount, new Date(block.timestamp * 1000).toLocaleString()]] })
		})
		window.pointExchange.events.ExchangeRP({
			filter: { bank: this.props.account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			this.setState({ exchangeRPEvents: [...this.state.exchangeRPEvents, [values.user, values.name, values.oldAmount, values.amount, new Date(block.timestamp * 1000).toLocaleString()]] })
		})
	}

	deliver = () => {
		const address = $('#issuerAddress').val()
		const amount = $('#deliverAmount').val()
		window.rpToken.methods.deliver(address, amount).send({ from: this.props.account })
			.on('receipt', receipt => {
				const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
				this.alert(msg, 'success')
				this.loadInfo()
			})
			.on('error', error => {
				const msg = error.message
				const startIdx = msg.indexOf('"reason":') + 10
				const endIdx = msg.indexOf('"},"stack"')
				this.error_alert(msg.substr(startIdx, endIdx - startIdx) === '' ? msg : msg.substr(startIdx, endIdx - startIdx), 'danger')
			})
	}

	transferRequest = () => {
		const address = $('#bankAddress').val()
		const amount = $('#transferRequestAmount').val()
		window.bankLiability.methods.transferRequest(address, amount).send({ from: this.props.account })
			.on('receipt', receipt => {
				const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
				this.alert(msg, 'success')
				this.loadRequests()
			})
			.on('error', error => {
				const msg = error.message
				const startIdx = msg.indexOf('"reason":') + 10
				const endIdx = msg.indexOf('"},"stack"')
				this.error_alert(msg.substr(startIdx, endIdx - startIdx) === '' ? msg : msg.substr(startIdx, endIdx - startIdx), 'danger')
			})
	}

	revokeRequest = (name) => {
		window.bankLiability.methods.revokeRequest(name).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
			this.loadRequests()
		})
	}

	accept = (name) => {
		window.bankLiability.methods.accept(name).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
			this.loadRequests()
		})
	}

	captureFile = event => {
		event.preventDefault()
		const file = event.target.files[0]
		const reader = new window.FileReader()
		if (file)
		{
			reader.readAsArrayBuffer(file)
			reader.onloadend = () => {
				this.setState({ buffer: Buffer(reader.result) })
				console.log('buffer', this.state.buffer)
			}
		}
	}

	addRPRate = () => {
		console.log("Submitting file to ipfs...")

		ipfs.add(this.state.buffer, (error, result) => {
			console.log('Ipfs result', result)
			if (error) {
				console.error(error)
				return
			}
			window.pointExchange.methods.addRPRate(result[0].hash, $('#pointsName').val(), $('#addRPRateAmount1').val(), $('#addRPRateAmount2').val()).send({ from: this.props.account }).on('receipt', receipt => {
				const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
				this.alert(msg, 'success')
				this.loadRates()
			})
			this.setState({ loading: false })
		})
	}

	removeRPRate = () => {
		window.pointExchange.methods.removeRPRate(this.state.removeRPRateId).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
			this.loadRates()
			this.removeRPRate_handleClose()
		})
	}

	updateRPRate = () => {
		window.pointExchange.methods.updateRPRate(this.state.updateRPRateId, $('#updateRPRateAmount1').val(), $('#updateRPRateAmount2').val()).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
			this.loadRates()
			this.updateRPRate_handleClose()
		})
	}

	alert = (message, type) => {
		$('<div><div class="row"><div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '</div>')
			.appendTo('#logs')
	};

	error_alert = (message, type) => {
		$('<div><div class="row"><div class="alert alert-' + type + ' d-flex align-items-center alert-dismissible" role="alert"><i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" style="font-size:24px;"></i>' + message + '</div>')
			.appendTo('#logs')
	}

	collapse = () => {
		this.setState(prevState => ({ collapse: !prevState.collapse }))
	}

	deliver_handleSubmit = (event) => {
		const form = event.currentTarget;
		event.preventDefault();
		if (form.checkValidity() === false) {
			event.stopPropagation();
		}
		else {
			this.deliver();
		}
		this.setState({ deliver_validated: true });
	};

	transferRequest_handleSubmit = (event) => {
		const form = event.currentTarget;
		event.preventDefault();
		if (form.checkValidity() === false) {
			event.stopPropagation();
		}
		else {
			this.transferRequest();
		}
		this.setState({ transferRequest_validated: true });
	};

	addRPRate_handleSubmit = (event) => {
		const form = event.currentTarget;
		event.preventDefault();
		if (form.checkValidity() === false) {
			event.stopPropagation();
		}
		else {
			this.setState({ loading: true })
			this.addRPRate();
		}
		this.setState({ addRPRate_validated: true });
	};

	updateRPRate_handleSubmit = (event) => {
		const form = event.currentTarget;
		event.preventDefault();
		if (form.checkValidity() === false) {
			event.stopPropagation();
		}
		else {
			this.updateRPRate();
		}
		this.setState({ updateRPRate_validated: true });
	};

	removeRPRate_handleShow = (removeRPRateId) => {
		this.setState({ removeRPRateId })
		this.setState({ removeRPRate_show: true })
	}

	removeRPRate_handleClose = () => {
		this.setState({ removeRPRate_show: false })
	}

	updateRPRate_handleShow = (updateRPRateId) => {
		this.setState({ updateRPRateId})
		this.setState({ updateRPRate_show: true })
	}

	updateRPRate_handleClose = () => {
		this.setState({ updateRPRate_show: false })
	}

	getInitialState = () => ({
		user: undefined,
		rates: [],
		deliverEvents: [],
		realizeEvents: [],
		requestAcceptedEvents: [],
		acceptRequestEvents: [],
		exchangeOtherEvents: [],
		exchangeRPEvents: [],
		transferRequests: [],
		confirmRemittances: [],
		deliver_validated: false,
		transferRequest_validated: false,
		addRPRate_validated: false,
		updateRPRate_validated: false,
		removeRPRate_show: false,
		updateRPRate_show: false,
		collapse: true,
		loading: false
	})

	constructor(props) {
		super(props)
		this.state = this.getInitialState()
	}

	render() {
		return (
			<div>
				<Navbar account={this.props.account} role={this.props.role} onLoggedOut={this.props.onLoggedOut} />
				<Header />
				<div className="container px-4 px-lg-5">

					{/* <!-- Page Heading --> */}
					<div className="d-sm-flex align-items-center justify-content-between mb-4">
						<h1 className="h3 mt-4 mb-0 text-gray-800">Bank</h1>
						<a href="/#" className="mt-4 d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
							className="fas fa-download fa-sm text-white-50"></i> Generate Report</a>
					</div>

					{/* <!-- Content Row --> */}
					<div className="row">

						{/* <!-- Earnings (Monthly) Card Example --> */}
						<div className="col-xl-3 col-md-6 mb-4">
							<div className="card border-left-primary shadow h-100 py-3">
								<div className="card-body">
									<div className="row no-gutters align-items-center">
										<div className="col mr-2">
											<div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
												Point Liabilities</div>
											<div className="h5 mb-0 font-weight-bold text-gray-800" id="bankLiabilities"></div>
										</div>
										<div className="col-auto">
											<i className="bi bi-cash-coin fa-2x text-gray-300"></i>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* <!-- Earnings (Monthly) Card Example --> */}
						<div className="col-xl-3 col-md-6 mb-4">
							<div className="card border-left-success shadow h-100 py-3">
								<div className="card-body">
									<div className="row no-gutters align-items-center">
										<div className="col mr-2">
											<div className="text-xs font-weight-bold text-success text-uppercase mb-1">
												Total supply</div>
											<div className="h5 mb-0 font-weight-bold text-gray-800" id="totalSupply"></div>
										</div>
										<div className="col-auto">
											<i className="bi bi-gem fa-2x text-gray-300"></i>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* <!-- Earnings (Monthly) Card Example --> */}
						<div className="col-xl-3 col-md-6 mb-4">
							<div className="card border-left-info shadow h-100 py-3">
								<div className="card-body">
									<div className="row no-gutters align-items-center">
										<div className="col mr-2">
											<div className="text-xs font-weight-bold text-info text-uppercase mb-1">Issuance ratio
											</div>
											<div className="row no-gutters align-items-center">
												<div className="col-auto">
													<div className="h5 mb-0 mr-3 font-weight-bold text-gray-800" id="issuanceRatio">0%</div>
												</div>
												<div className="col">
													<div className="progress progress-sm mr-2">
														<div className="progress-bar bg-info" role="progressbar"
															style={{ width: '0%' }} aria-valuenow="0" aria-valuemin="0"
															aria-valuemax="100" id="issuanceRatioProgress"></div>
													</div>
												</div>
											</div>
										</div>
										<div className="col-auto">
											<i className="bi bi-bar-chart fa-2x text-gray-300"></i>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* <!-- Pending Requests Card Example --> */}
						<div className="col-xl-3 col-md-6 mb-4">
							<div className="card border-left-warning shadow h-100 py-3">
								<div className="card-body">
									<div className="row no-gutters align-items-center">
										<div className="col mr-2">
											<div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
												Pending Requests</div>
											<div className="h5 mb-0 font-weight-bold text-gray-800" id="pendingRequest"></div>
										</div>
										<div className="col-auto">
											<i className="bi bi-chat-text fa-2x text-gray-300"></i>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* <!-- Content Row --> */}
					<div className="row">
						<div className="col-lg-12 mb-4">

							{/* <!-- Events --> */}
							<div className="card shadow mb-4">
								<Tab.Container defaultActiveKey="deliver">
									<div className="card-header">
										<h6 className="m-0 font-weight-bold text-secondary my-2">Events</h6>
										<Nav variant="pills">
											<Nav.Item>
												<Nav.Link eventKey="deliver">Deliver</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="realize">Realize</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="requestAccepted">Requests Accepted</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="acceptRequest">Accept Others' Requests</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="exchangeOther">Exchange Other Point</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="exchangeRP">Exchange RP</Nav.Link>
											</Nav.Item>
											<button type="button" className="ms-auto btn btn-sm float-end" onClick={this.collapse} aria-expanded={this.state.collapse}><i className="bi bi-caret-down-fill text-secondary"></i></button>
										</Nav>
									</div>
									<Collapse in={this.state.collapse}>
										<div className="card-body tab-content">
											<Tab.Pane eventKey="deliver">
												<div className="table-responsive">
													<table className="table table-striped table-hover align-middle">
														<thead>
															<tr>
																<th scope="col">#</th>
																<th scope="col">Issuer</th>
																<th scope="col">Amount</th>
																<th scope="col">Timestamp</th>
															</tr>
														</thead>
														<tbody>
															{this.state.deliverEvents.map((event, idx) => {
																return (
																	<tr key={event[0] + idx}>
																		<th scope="row">{idx + 1}</th>
																		<td>{event[0]}</td>
																		<td>+ {event[1]} Liabilities</td>
																		<td>{event[2]}</td>
																	</tr>
																)
															})}
														</tbody>
													</table>
												</div>
											</Tab.Pane>
											<Tab.Pane eventKey="realize">
												<div className="table-responsive">
													<table className="table table-striped table-hover align-middle">
														<thead>
															<tr>
																<th scope="col">#</th>
																<th scope="col">Merchant</th>
																<th scope="col">Amount</th>
																<th scope="col">Timestamp</th>
															</tr>
														</thead>
														<tbody>
															{this.state.realizeEvents.map((event, idx) => {
																return (
																	<tr key={event[0] + idx}>
																		<th scope="row">{idx + 1}</th>
																		<td>{event[0]}</td>
																		<td>- {event[1]} Liabilities</td>
																		<td>{event[2]}</td>
																	</tr>
																)
															})}
														</tbody>
													</table>
												</div>
											</Tab.Pane>
											<Tab.Pane eventKey="requestAccepted">
												<div className="table-responsive">
													<table className="table table-striped table-hover align-middle">
														<thead>
															<tr>
																<th scope="col">#</th>
																<th scope="col">Recipient</th>
																<th scope="col">Amount</th>
																<th scope="col">Timestamp</th>
															</tr>
														</thead>
														<tbody>
															{this.state.requestAcceptedEvents.map((event, idx) => {
																return (
																	<tr key={event[0] + idx}>
																		<th scope="row">{idx + 1}</th>
																		<td>{event[0]}</td>
																		<td>{event[1]} Liabilities</td>
																		<td>{event[2]}</td>
																	</tr>
																)
															})}
														</tbody>
													</table>
												</div>
											</Tab.Pane>
											<Tab.Pane eventKey="acceptRequest">
												<div className="table-responsive">
													<table className="table table-striped table-hover align-middle">
														<thead>
															<tr>
																<th scope="col">#</th>
																<th scope="col">Sender</th>
																<th scope="col">Amount</th>
																<th scope="col">Timestamp</th>
															</tr>
														</thead>
														<tbody>
															{this.state.acceptRequestEvents.map((event, idx) => {
																return (
																	<tr key={event[0] + idx}>
																		<th scope="row">{idx + 1}</th>
																		<td>{event[0]}</td>
																		<td>{event[1]} Liabilities</td>
																		<td>{event[2]}</td>
																	</tr>
																)
															})}
														</tbody>
													</table>
												</div>
											</Tab.Pane>
											<Tab.Pane eventKey="exchangeOther">
												<div className="table-responsive">
													<table className="table table-striped table-hover align-middle">
														<thead>
															<tr>
																<th scope="col">#</th>
																<th scope="col">User</th>
																<th scope="col">Content</th>
																<th scope="col">Result</th>
																<th scope="col">Timestamp</th>
															</tr>
														</thead>
														<tbody>
															{this.state.exchangeOtherEvents.map((event, idx) => {
																return (
																	<tr key={event[0] + idx}>
																		<th scope="row">{idx + 1}</th>
																		<td>{event[0]}</td>
																		<td>{event[2]} RP {<i className="bi bi-arrow-right-circle-fill"></i>} {event[3]} {event[1]}</td>
																		<td>- {event[2]} Liabilities</td>
																		<td>{event[4]}</td>
																	</tr>
																)
															})}
														</tbody>
													</table>
												</div>
											</Tab.Pane>
											<Tab.Pane eventKey="exchangeRP">
												<div className="table-responsive">
													<table className="table table-striped table-hover align-middle">
														<thead>
															<tr>
																<th scope="col">#</th>
																<th scope="col">User</th>
																<th scope="col">Content</th>
																<th scope="col">Timestamp</th>
															</tr>
														</thead>
														<tbody>
															{this.state.exchangeRPEvents.map((event, idx) => {
																return (
																	<tr key={event[0] + idx}>
																		<th scope="row">{idx + 1}</th>
																		<td>{event[0]}</td>
																		<td>{event[2]} {event[1]} {<i className="bi bi-arrow-right-circle-fill"></i>} {event[3]} RP</td>
																		<td>{event[4]}</td>
																	</tr>
																)
															})}
														</tbody>
													</table>
												</div>
											</Tab.Pane>
										</div>
									</Collapse>
								</Tab.Container>
							</div>

							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-danger">Rates</h6>
								</div>
								<div className="card-body">
									<div className="row gx-4 gx-lg-5 row-cols-3 row-cols-md-4 row-cols-xl-5">
										{this.state.rates.map((rate, idx) => {
											return (
												<div className="col mb-2" key={rate.id}>
													<div className="card shadow h-100">
														{/* <!-- Remove button--> */}
														<div className="col">
															<button type="button" className="btn btn-sm float-end" onClick={() => { this.removeRPRate_handleShow(rate.id) }}><i className="bi bi-x-circle-fill text-secondary"></i></button>
														</div>
														{/* <!-- Points image--> */}
														<img className="card-img-top" src={`https://ipfs.infura.io/ipfs/${rate.imgHash}`} alt="..." />
														{/* <!-- Points details--> */}
														<div className="card-body p-4">
															<div className="text-center">
																{/* <!-- Points name--> */}
																<h5 className="fw-bolder">{rate.name}</h5>
																{/* <!-- Points rate--> */}
																<h6>{rate.otherPoint} {rate.name} <i className="bi bi-arrow-right-circle-fill"></i> {rate.RP} RP</h6>
																<button type="button" className="btn btn-outline-dark" onClick={() => { this.updateRPRate_handleShow(rate.id) }}>Update Rate</button>
															</div>
														</div>

													</div>
												</div>
											)
										})}
									</div>
								</div>
							</div>

							{/* <!-- Illustrations --> */}
							<div className="card-group">
								<div className="card shadow mb-4">
									<div className="card-header py-3">
										<h6 className="m-0 font-weight-bold text-danger">Point Liabilities Transfer Requests</h6>
									</div>
									<div className="card-body">
										<div className="table-responsive">
											<table className="table table-striped table-hover align-middle">
												<thead>
													<tr>
														<th scope="col">#</th>
														<th scope="col">Recipient</th>
														<th scope="col">Amount</th>
														<th scope="col">Button</th>
													</tr>
												</thead>
												<tbody>
													{this.state.transferRequests.map((request, idx) => {
														return (
															<tr key={request[0]}>
																<th scope="row">{idx + 1}</th>
																<td>{request[0]}</td>
																<td>{request[1]}</td>
																<td><button type="button" className="btn btn-danger btn-sm" onClick={() => { this.revokeRequest(request[0]) }}>Revoke</button></td>
															</tr>
														)
													})}
												</tbody>
											</table>
										</div>
									</div>
								</div>
								<div className="card shadow mb-4">
									<div className="card-header py-3">
										<h6 className="m-0 font-weight-bold text-primary">Point Liabilities Remittance Confirmations</h6>
									</div>
									<div className="card-body">
										<div className="table-responsive">
											<table className="table table-striped table-hover align-middle">
												<thead>
													<tr>
														<th scope="col">#</th>
														<th scope="col">Sender</th>
														<th scope="col">Amount</th>
														<th scope="col">Button</th>
													</tr>
												</thead>
												<tbody>
													{this.state.confirmRemittances.map((request, idx) => {
														return (
															<tr key={request[0]}>
																<th scope="row">{idx + 1}</th>
																<td>{request[0]}</td>
																<td>{request[1]}</td>
																<td><button name={request[0]} type="button" className="btn btn-primary btn-sm" onClick={() => { this.accept(request[0]) }}>Accept</button></td>
															</tr>
														)
													})}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
							<div className="card shadow mb-4">
								<div className="d-flex justify-content-between card-header py-3">
									<h6 className="m-0 font-weight-bold text-primary">RP Related Functions</h6>
									<h6 className="m-0 text-secondary">Point Exchange Contract: {window.pointExchange._address}</h6>
								</div>
								<div className="card-body">
									<Form noValidate validated={this.state.deliver_validated} onSubmit={this.deliver_handleSubmit}>
										<Row className="mb-3">
											<Form.Group as={Col} md="4">
												<Form.Label>Issuer address</Form.Label>
												<InputGroup hasValidation>
													<InputGroup.Text>To</InputGroup.Text>
													<Form.Control
														type="text"
														placeholder="Issuer address"
														aria-describedby="inputGroupPrepend"
														id="issuerAddress"
														required
													/>
													<Form.Control.Feedback type="invalid">
														Please provide a valid address.
													</Form.Control.Feedback>
												</InputGroup>
											</Form.Group>
											<Form.Group as={Col} md="4">
												<Form.Label>Amount</Form.Label>
												<InputGroup hasValidation>
													<Form.Control
														type="number"
														placeholder="Amount"
														min="1"
														id="deliverAmount"
														required
													/>
													<InputGroup.Text>RP</InputGroup.Text>
													<Form.Control.Feedback type="invalid">
														Please provide a valid number.
													</Form.Control.Feedback>
												</InputGroup>
											</Form.Group>
										</Row>
										<Button type="submit">Deliver</Button>
									</Form>
								</div>
							</div>

							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-danger">Point Liabilities Related Functions</h6>
								</div>
								<div className="card-body">
									<Form noValidate validated={this.state.transferRequest_validated} onSubmit={this.transferRequest_handleSubmit}>
										<Row className="mb-3">
											<Form.Group as={Col} md="4">
												<Form.Label>Bank address </Form.Label>
												<InputGroup hasValidation>
													<InputGroup.Text>To</InputGroup.Text>
													<Form.Control
														type="text"
														placeholder="Bank address"
														aria-describedby="inputGroupPrepend"
														id="bankAddress"
														required
													/>
													<Form.Control.Feedback type="invalid">
														Please provide a valid address.
													</Form.Control.Feedback>
												</InputGroup>
											</Form.Group>
											<Form.Group as={Col} md="4">
												<Form.Label>Amount</Form.Label>
												<InputGroup hasValidation>
													<Form.Control
														type="number"
														placeholder="Amount"
														min="1"
														id="transferRequestAmount"
														required
													/>
													<InputGroup.Text>Liabilities</InputGroup.Text>
													<Form.Control.Feedback type="invalid">
														Please provide a valid number.
													</Form.Control.Feedback>
												</InputGroup>
											</Form.Group>
										</Row>
										<Button className="btn-danger" type="submit">Transfer Request</Button>
									</Form>
								</div>
							</div>

							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-primary">Point Exchange Related Functions</h6>
								</div>
								<div className="card-body">
									<Form noValidate validated={this.state.addRPRate_validated} onSubmit={this.addRPRate_handleSubmit}>
										<Row className="mb-3">
											<Form.Group as={Col} md="4">
												<Form.Label>Points name</Form.Label>
												<InputGroup hasValidation>
													<Form.Control
														type="text"
														placeholder="Points name"
														aria-describedby="inputGroupPrepend"
														id="pointsName"
														required
													/>
													<Form.Control.Feedback type="invalid">
														Please provide a valid name.
													</Form.Control.Feedback>
												</InputGroup>
											</Form.Group>
										</Row>
										<Row className="mb-3">
											<Form.Group as={Col} md="8">
												<Form.Label>Rate</Form.Label>
												<InputGroup hasValidation>
													<Form.Control
														type="number"
														placeholder="Amount"
														min="1"
														id="addRPRateAmount1"
														required
													/>
													<InputGroup.Text>Points</InputGroup.Text>
													<InputGroup.Text>{<i className="bi bi-arrow-right-circle-fill"></i>}</InputGroup.Text>
													<Form.Control
														type="number"
														placeholder="Amount"
														min="1"
														id="addRPRateAmount2"
														required
													/>
													<InputGroup.Text>RP</InputGroup.Text>
													<Form.Control.Feedback type="invalid">
														Please provide a valid number.
													</Form.Control.Feedback>
												</InputGroup>
											</Form.Group>
										</Row>
										<Form.Group as={Col} md="8" className="position-relative mb-3">
											<Form.Label>Image</Form.Label>
											<Form.Control
												type="file"
												accept=".jpg, .jpeg, .png, .bmp, .gif"
												onChange={this.captureFile}
												required
											/>
											<Form.Control.Feedback type="invalid">
												Please provide a valid image.
											</Form.Control.Feedback>
										</Form.Group>
										<Button className="btn-primary" type="submit">{this.state.loading ? "Loading..." : "Add RP Exchange Rate"}</Button>
									</Form>
								</div>
							</div>

							{/* <!-- Logs --> */}
							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-secondary">Logs</h6>
								</div>
								<div className="card-body" id="logs">
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Modal */}
				<Modal show={this.state.removeRPRate_show} onHide={this.removeRPRate_handleClose} centered>
					<Modal.Header closeButton>
						<Modal.Title>Remove RP Exchange Rate</Modal.Title>
					</Modal.Header>
					<Modal.Body>Are you sure you want to remove this rate?</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.removeRPRate_handleClose}>
							No
						</Button>
						<Button variant="primary" onClick={this.removeRPRate}>
							Yes
						</Button>
					</Modal.Footer>
				</Modal>

				{/* Modal */}
				<Modal show={this.state.updateRPRate_show} onHide={this.updateRPRate_handleClose} centered>
					<Modal.Header closeButton>
						<Modal.Title>Update RP Exchange Rate</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form noValidate validated={this.state.updateRPRate_validated} onSubmit={this.updateRPRate_handleSubmit}>
							<Row className="mb-3">
								<Form.Group as={Col} md="12">
									<Form.Label>Rate</Form.Label>
									<InputGroup hasValidation>
										<Form.Control
											type="number"
											placeholder="Amount"
											min="1"
											id="updateRPRateAmount1"
											required
										/>
										<InputGroup.Text>Points</InputGroup.Text>
										<InputGroup.Text>{<i className="bi bi-arrow-right-circle-fill"></i>}</InputGroup.Text>
										<Form.Control
											type="number"
											placeholder="Amount"
											min="1"
											id="updateRPRateAmount2"
											required
										/>
										<InputGroup.Text>RP</InputGroup.Text>
										<Form.Control.Feedback type="invalid">
											Please provide a valid number.
										</Form.Control.Feedback>
									</InputGroup>
								</Form.Group>
							</Row>
							<button className="btn btn-dark" type="submit">Update Rate</button>
						</Form>
					</Modal.Body>
				</Modal>
			</div>
		);
	}
}

export default Bank;