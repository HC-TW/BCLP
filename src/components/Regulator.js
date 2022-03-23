import jwtDecode from 'jwt-decode';
import React, { Component } from 'react';
import { Tab, Nav, Collapse, InputGroup, Row, Form } from 'react-bootstrap';

import Navbar from './MyNavbar';
import Header from './Header';
import $ from 'jquery';

class Regulator extends Component {

	async componentDidMount() {
		await this.loadUser();
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

	loadEvents = () => {
		this.setState({ redeemEvents: [] })
		this.setState({ realizeEvents: [] })
		const merchant = $('#merchant').val()
		window.rpToken.events.Redeem({
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			if (merchant === '' || values.merchant.includes(merchant)) {
				const block = await window.web3.eth.getBlock(events.blockNumber)
				this.setState({ redeemEvents: [...this.state.redeemEvents, [values.user, values.merchant, values.amount, new Date(block.timestamp * 1000).toLocaleString()]] })
			}
		})
		window.rpToken.events.Realize({
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			if (merchant === '' || values.merchant.includes(merchant)) {
				const block = await window.web3.eth.getBlock(events.blockNumber)
				this.setState({ realizeEvents: [...this.state.realizeEvents, [values.merchant, values.bank, values.amount, new Date(block.timestamp * 1000).toLocaleString()]] })
			}
		})
	}

	collapse = () => {
		this.setState(prevState => ({ collapse: !prevState.collapse }))
	}

	handleSubmit = (event) => {
		event.preventDefault();
		this.loadEvents();
	}

	getInitialState = () => ({
		user: undefined,
		redeemEvents: [],
		realizeEvents: [],
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
						<h1 className="h3 mt-4 mb-0 text-gray-800">Regulator</h1>
						<a href="/#" className="mt-4 d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
							className="fas fa-download fa-sm text-white-50"></i> Generate Report</a>
					</div>

					{/* <!-- Content Row --> */}
					<div className="row">
						<div className="col-lg-12 mb-4">

							{/* <!-- Events --> */}
							<div className="card shadow mb-4">
								<Tab.Container defaultActiveKey="redeem">
									<div className="card-header">
										<Row>
											<h6 className="col-md-4 m-0 font-weight-bold text-secondary my-2">Merchant Events</h6>
											<div className='col-md-4 ms-auto'>
												<Form onSubmit={this.handleSubmit}>
													<Form.Group>
														<InputGroup>
															<InputGroup.Text>Merchant</InputGroup.Text>
															<Form.Control
																type="text"
																placeholder="Merchant"
																id="merchant"
															/>
															<button className="btn btn-outline-secondary" type="submit">Refresh</button>
														</InputGroup>
													</Form.Group>
												</Form>
											</div>
										</Row>
										<Nav variant="pills">
											<Nav.Item>
												<Nav.Link eventKey="redeem">Redeem</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="realize">Realize</Nav.Link>
											</Nav.Item>
											<button type="button" className="ms-auto btn btn-sm" onClick={this.collapse} aria-expanded={this.state.collapse}><i className="bi bi-caret-down-fill text-secondary"></i></button>
										</Nav>
									</div>
									<Collapse in={this.state.collapse}>
										<div className="card-body tab-content">
											<Tab.Pane eventKey="redeem">
												<div className="table-responsive">
													<table className="table table-striped table-hover align-middle">
														<thead>
															<tr>
																<th scope="col">#</th>
																<th scope="col">User</th>
																<th scope="col">Merchant</th>
																<th scope="col">Amount</th>
																<th scope="col">Timestamp</th>
															</tr>
														</thead>
														<tbody>
															{this.state.redeemEvents.map((event, idx) => {
																return (
																	<tr key={event[1] + idx}>
																		<th scope="row">{idx + 1}</th>
																		<td>{event[0]}</td>
																		<td>{event[1]}</td>
																		<td>{event[2]} RP</td>
																		<td>{event[3]}</td>
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
																<th scope="col">Bank</th>
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
																		<td>{event[1]}</td>
																		<td>{event[2]} RP</td>
																		<td>{event[3]}</td>
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
						</div>
					</div>

				</div>

			</div>
		);
	}
}

export default Regulator;