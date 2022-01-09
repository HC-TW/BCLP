import jwtDecode from 'jwt-decode';
import React, { Component } from 'react';
import { Form, Row, Col, InputGroup, Button, Tab, Nav, Collapse } from 'react-bootstrap';

import Navbar from './MyNavbar';
import Header from './Header';
import $ from 'jquery';

class Issuer extends Component {

	async componentDidMount() {
		await this.loadUser();
		await this.loadInfo();
		await this.loadEvents();
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
		const balance = Number(await window.rpToken.methods.balanceOf(this.props.account).call({ from: this.props.account }))
		const totalSupply = Number(await window.rpToken.methods.totalSupply().call({ from: this.props.account }))
		const holdingRatio = balance / (totalSupply ? totalSupply : 1) * 100
		$('#rpHoldings').text(balance + ' RP')
		$('#totalSupply').text(totalSupply + ' RP')
		$('#holdingRatio').text(holdingRatio + '%')
		$('#holdingRatioProgress').css('width', holdingRatio + '%')
	}

	loadEvents = () => {
		window.rpToken.events.Transfer({
			filter: { to: this.props.account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			this.setState({ deliverEvents: [...this.state.deliverEvents, [values.from, values.value, new Date(block.timestamp * 1000).toLocaleString()]] })
		})
		window.rpToken.events.Transfer({
			filter: { from: this.props.account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			this.setState({ issueEvents: [...this.state.issueEvents, [values.to, values.value, new Date(block.timestamp * 1000).toLocaleString()]] })
		})
	}

	issue = () => {
		const address = $('#userAddress').val()
		const amount = $('#issueAmount').val()
		window.rpToken.methods.issue(address, amount).send({ from: this.props.account })
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

	handleSubmit = (event) => {
		const form = event.currentTarget;
		event.preventDefault();
		if (form.checkValidity() === false) {
			event.stopPropagation();
		}
		else {
			this.issue();
		}
		this.setState({ validated: true });
	};

	getInitialState = () => ({
		user: undefined,
		validated: false,
		deliverEvents: [],
		issueEvents: [],
		collapse: true
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
						<h1 className="h3 mt-4 mb-0 text-gray-800">Issuer</h1>
						<a href="/#" className="mt-4 d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
							className="fas fa-download fa-sm text-white-50"></i> Generate Report</a>
					</div>

					{/* <!-- Content Row --> */}
					<div className="row">

						{/* <!-- Earnings (Monthly) Card Example --> */}
						<div className="col-xl-4 col-md-6 mb-4">
							<div className="card border-left-primary shadow h-100 py-3">
								<div className="card-body">
									<div className="row no-gutters align-items-center">
										<div className="col mr-2">
											<div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
												RP holdings</div>
											<div className="h5 mb-0 font-weight-bold text-gray-800" id="rpHoldings"></div>
										</div>
										<div className="col-auto">
											<i className="bi bi-cash-coin fa-2x text-gray-300"></i>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* <!-- Earnings (Monthly) Card Example --> */}
						<div className="col-xl-4 col-md-6 mb-4">
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
						<div className="col-xl-4 col-md-6 mb-4">
							<div className="card border-left-info shadow h-100 py-3">
								<div className="card-body">
									<div className="row no-gutters align-items-center">
										<div className="col mr-2">
											<div className="text-xs font-weight-bold text-info text-uppercase mb-1">Holding ratio
											</div>
											<div className="row no-gutters align-items-center">
												<div className="col-auto">
													<div className="h5 mb-0 mr-3 font-weight-bold text-gray-800" id="holdingRatio">50%</div>
												</div>
												<div className="col">
													<div className="progress progress-sm mr-2">
														<div className="progress-bar bg-info" role="progressbar"
															style={{ width: '0%' }} aria-valuenow="0" aria-valuemin="0"
															aria-valuemax="100" id="holdingRatioProgress"></div>
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
												<Nav.Link eventKey="issue">Issue</Nav.Link>
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
																<th scope="col">Bank</th>
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
																		<td>+ {event[1]} RP</td>
																		<td>{event[2]}</td>
																	</tr>
																)
															})}
														</tbody>
													</table>
												</div>
											</Tab.Pane>
											<Tab.Pane eventKey="issue">
												<div className="table-responsive">
													<table className="table table-striped table-hover align-middle">
														<thead>
															<tr>
																<th scope="col">#</th>
																<th scope="col">User</th>
																<th scope="col">Amount</th>
																<th scope="col">Timestamp</th>
															</tr>
														</thead>
														<tbody>
															{this.state.issueEvents.map((event, idx) => {
																return (
																	<tr key={event[0] + idx}>
																		<th scope="row">{idx + 1}</th>
																		<td>{event[0]}</td>
																		<td>- {event[1]} RP</td>
																		<td>{event[2]}</td>
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

							{/* <!-- Illustrations --> */}
							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-primary">RP Related Functions</h6>
								</div>
								<div className="card-body">
									<Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
										<Row className="mb-3">
											<Form.Group as={Col} md="4">
												<Form.Label>User address </Form.Label>
												<InputGroup hasValidation>
													<InputGroup.Text>To</InputGroup.Text>
													<Form.Control
														type="text"
														placeholder="User address"
														aria-describedby="inputGroupPrepend"
														id="userAddress"
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
														id="issueAmount"
														required
													/>
													<InputGroup.Text>RP</InputGroup.Text>
													<Form.Control.Feedback type="invalid">
														Please provide a valid number.
													</Form.Control.Feedback>
												</InputGroup>
											</Form.Group>
										</Row>
										<Button type="submit">Issue</Button>
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

			</div>
		);
	}
}

export default Issuer;