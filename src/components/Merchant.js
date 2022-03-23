import jwtDecode from 'jwt-decode';
import React, { Component } from 'react';
import { Form, Row, Col, InputGroup, Button, Modal, Tab, Nav, Collapse } from 'react-bootstrap';

import Navbar from './MyNavbar';
import Header from './Header';
import $ from 'jquery';

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

class Merchant extends Component {

	async componentDidMount() {
		await this.loadUser();
		await this.loadOrders();
		await this.loadProducts();
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

	async loadProducts() {
		this.setState({ products: [] })
		const keys = await window.productManager.methods.getMerchantKeys().call({ from: this.props.account })
		for (let i = 0; i < keys.length; i++) {
			const product = await window.productManager.methods._products(keys[i]).call()
			this.setState({
				products: [...this.state.products, product]
			})
		}
		this.loadInfo()
	}

	async loadOrders() {
		const orderParties = await window.productManager.methods.getOrderParties().call({ from: this.props.account })
		for (let i = 0; i < orderParties.length; i++) {
			const orders = await window.productManager.methods.getOrders(orderParties[i], this.props.account).call({ from: this.props.account })
			for (let j = 0; j < orders.length; j++) {
				const order = orders[j]
				if (!order.isFinished) {
					this.setState({ orders: [...this.state.orders, [orderParties[i], order]] })
				} else {
					this.setState({ finishedOrders: [...this.state.finishedOrders, [orderParties[i], order]] })
				}
			}
		}
	}

	async loadInfo() {
		$('#rpHoldings').text(await window.rpToken.methods.balanceOf(this.props.account).call({ from: this.props.account }) + ' RP')
		$('#productQuantity').text(this.state.products.length)
		$('#orderQuantity').text(this.state.orders.length)
		$('#finishedOrderQuantity').text(this.state.finishedOrders.length)
	}

	loadEvents = () => {
		window.rpToken.events.Realize({
			filter: { merchant: this.props.account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			this.setState({ realizeEvents: [...this.state.realizeEvents, [values.bank, values.amount, new Date(block.timestamp * 1000).toLocaleString()]] })
		})
	}

	realize = () => {
		const address = $('#bankAddress').val()
		const amount = $('#realizeAmount').val()
		window.rpToken.methods.realize(address, amount).send({ from: this.props.account })
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

	uploadProduct = () => {
		console.log("Submitting file to ipfs...")

		ipfs.add(this.state.buffer, (error, result) => {
			console.log('Ipfs result', result)
			if (error) {
				console.error(error)
				return
			}
			window.productManager.methods.uploadProduct(result[0].hash, $('#productName').val(), $('#productDescription').val(), $('#productPrice').val()).send({ from: this.props.account })
				.on('receipt', receipt => {
					const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
					this.alert(msg, 'success')
					this.loadProducts()
				})
				.on('error', error => {
					const msg = error.message
					const startIdx = msg.indexOf('"reason":') + 10
					const endIdx = msg.indexOf('"},"stack"')
					this.error_alert(msg.substr(startIdx, endIdx - startIdx) === '' ? msg : msg.substr(startIdx, endIdx - startIdx), 'danger')
				})
			this.setState({ loading: false })
		})
	}

	removeProduct = () => {
		window.productManager.methods.removeProduct(this.state.removeProductId).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
			this.loadProducts()
			this.handleClose()
		})
	}

	alert = (message, type) => {
		$('<div><div class="row"><div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '</div>')
			.appendTo('#logs')
	}

	error_alert = (message, type) => {
		$('<div><div class="row"><div class="alert alert-' + type + ' d-flex align-items-center alert-dismissible" role="alert"><i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" style="font-size:24px;"></i>' + message + '</div>')
			.appendTo('#logs')
	}

	collapse = () => {
		this.setState(prevState => ({ collapse: !prevState.collapse }))
	}

	realize_handleSubmit = (event) => {
		const form = event.currentTarget;
		event.preventDefault();
		if (form.checkValidity() === false) {
			event.stopPropagation();
		}
		else {
			this.realize();
		}
		this.setState({ realize_validated: true });
	}

	upload_handleSubmit = (event) => {
		const form = event.currentTarget;
		event.preventDefault();
		if (form.checkValidity() === false) {
			event.stopPropagation();
		}
		else {
			this.setState({ loading: true })
			this.uploadProduct();
		}
		this.setState({ upload_validated: true });
	}

	handleShow = (removeProductId) => {
		this.setState({ removeProductId })
		this.setState({ show: true })
	}

	handleClose = () => {
		this.setState({ show: false })
	}

	getInitialState = () => ({
		user: undefined,
		realize_validated: false,
		upload_validated: false,
		show: false,
		products: [],
		orders: [],
		finishedOrders: [],
		realizeEvents: [],
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
						<h1 className="h3 mt-4 mb-0 text-gray-800">Merchant</h1>
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

						{/* <!-- Pending Requests Card Example --> */}
						<div className="col-xl-3 col-md-6 mb-4">
							<div className="card border-left-success shadow h-100 py-3">
								<div className="card-body">
									<div className="row no-gutters align-items-center">
										<div className="col mr-2">
											<div className="text-xs font-weight-bold text-success text-uppercase mb-1">
												Quantity of Products</div>
											<div className="h5 mb-0 font-weight-bold text-gray-800" id="productQuantity"></div>
										</div>
										<div className="col-auto">
											<i className="bi bi-gift fa-2x text-gray-300"></i>
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
											<div className="text-xs font-weight-bold text-info text-uppercase mb-1">
												Quantity of Orders</div>
											<div className="h5 mb-0 font-weight-bold text-gray-800" id="orderQuantity"></div>
										</div>
										<div className="col-auto">
											<i className="bi bi-box fa-2x text-gray-300"></i>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* <!-- Earnings (Monthly) Card Example --> */}
						<div className="col-xl-3 col-md-6 mb-4">
							<div className="card border-left-warning shadow h-100 py-3">
								<div className="card-body">
									<div className="row no-gutters align-items-center">
										<div className="col mr-2">
											<div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
												Quantity of Finished Orders</div>
											<div className="h5 mb-0 font-weight-bold text-gray-800" id="finishedOrderQuantity"></div>
										</div>
										<div className="col-auto">
											<i className="bi bi-box-seam fa-2x text-gray-300"></i>
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
								<Tab.Container defaultActiveKey="realize">
									<div className="card-header">
										<h6 className="m-0 font-weight-bold text-secondary my-2">Events</h6>
										<Nav variant="pills">
											<Nav.Item>
												<Nav.Link eventKey="realize">Realize</Nav.Link>
											</Nav.Item>
											<button type="button" className="ms-auto btn btn-sm float-end" onClick={this.collapse} aria-expanded={this.state.collapse}><i className="bi bi-caret-down-fill text-secondary"></i></button>
										</Nav>
									</div>
									<Collapse in={this.state.collapse}>
										<div className="card-body tab-content">
											<Tab.Pane eventKey="realize">
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
															{this.state.realizeEvents.map((event, idx) => {
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
									<h6 className="m-0 font-weight-bold text-danger">Products</h6>
								</div>
								<div className="card-body">
									<div className="row gx-4 gx-lg-5 row-cols-3 row-cols-md-4 row-cols-xl-5">
										{this.state.products.map((product, idx) => {
											return (
												<div className="col mb-2" key={product.id}>
													<div className="card shadow h-100">
														{/* <!-- Remove button--> */}
														<div className="col">
															<button type="button" className="btn btn-sm float-end" onClick={() => { this.handleShow(product.id) }}><i className="bi bi-x-circle-fill text-secondary"></i></button>
														</div>
														{/* <!-- Product image--> */}
														<img className="card-img-top" src={`https://ipfs.infura.io/ipfs/${product.imgHash}`} alt="..." />
														{/* <!-- Product details--> */}
														<div className="card-body p-4">
															<div className="text-center">
																{/* <!-- Product name--> */}
																<h5 className="fw-bolder">{product.name}</h5>
																{/* <!-- Product description--> */}
																<h6>{product.description}</h6>
																{/* <!-- Product price--> */}
																<h6>{product.price} RP</h6>
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
							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-primary">Orders</h6>
								</div>
								<div className="card-body">
									<div className="table-responsive">
										<table className="table table-striped table-hover align-middle">
											<thead>
												<tr>
													<th scope="col">#</th>
													<th scope="col">Merchant</th>
													<th scope="col">Product Name</th>
													<th scope="col">Quantity</th>
													<th scope="col">Amount</th>
													<th scope="col">Timestamp</th>
												</tr>
											</thead>
											<tbody>
												{this.state.orders.map((order, idx) => {
													return (
														<tr key={order[0] + idx}>
															<th scope="row">{idx + 1}</th>
															<td>{order[0]}</td>
															<td>{order[1].name}</td>
															<td>{order[1].quantity}</td>
															<td>{order[1].amount} RP</td>
															<td>{new Date(order[1].timestamp * 1000).toLocaleString()}</td>
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
									<h6 className="m-0 font-weight-bold text-danger">Finished Orders</h6>
								</div>
								<div className="card-body">
									<div className="table-responsive">
										<table className="table table-striped table-hover align-middle">
											<thead>
												<tr>
													<th scope="col">#</th>
													<th scope="col">Merchant</th>
													<th scope="col">Product Name</th>
													<th scope="col">Quantity</th>
													<th scope="col">Amount</th>
													<th scope="col">Timestamp</th>
												</tr>
											</thead>
											<tbody>
												{this.state.finishedOrders.map((order, idx) => {
													return (
														<tr key={order[0] + idx}>
															<th scope="row">{idx + 1}</th>
															<td>{order[0]}</td>
															<td>{order[1].name}</td>
															<td>{order[1].quantity}</td>
															<td>{order[1].amount} RP</td>
															<td>{new Date(order[1].timestamp * 1000).toLocaleString()}</td>
														</tr>
													)
												})}
											</tbody>
										</table>
									</div>
								</div>
							</div>

							{/* <!-- Illustrations --> */}
							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-primary">RP Related Functions</h6>
								</div>
								<div className="card-body">
									<Form noValidate validated={this.state.realize_validated} onSubmit={this.realize_handleSubmit}>
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
														id="realizeAmount"
														required
													/>
													<InputGroup.Text>RP</InputGroup.Text>
													<Form.Control.Feedback type="invalid">
														Please provide a valid number.
													</Form.Control.Feedback>
												</InputGroup>
											</Form.Group>
										</Row>
										<Button type="submit">Realize</Button>
									</Form>
								</div>
							</div>

							{/* <!-- Illustrations --> */}
							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-danger">Products Related Functions</h6>
								</div>
								<div className="card-body">
									<Form noValidate validated={this.state.upload_validated} onSubmit={this.upload_handleSubmit}>
										<Row className="mb-3">
											<Form.Group as={Col} md="4">
												<Form.Label>Product name</Form.Label>
												<InputGroup hasValidation>
													<Form.Control
														type="text"
														placeholder="Product name"
														aria-describedby="inputGroupPrepend"
														id="productName"
														required
													/>
													<Form.Control.Feedback type="invalid">
														Please provide a valid name.
													</Form.Control.Feedback>
												</InputGroup>
											</Form.Group>
											<Form.Group as={Col} md="4">
												<Form.Label>Price</Form.Label>
												<InputGroup hasValidation>
													<Form.Control
														type="number"
														placeholder="Price"
														min="1"
														id="productPrice"
														required
													/>
													<InputGroup.Text>RP</InputGroup.Text>
													<Form.Control.Feedback type="invalid">
														Please provide a valid number.
													</Form.Control.Feedback>
												</InputGroup>
											</Form.Group>
										</Row>
										<Row className="mb-3">
											<Form.Group as={Col} md="4">
												<Form.Label>Description</Form.Label>
												<Form.Control
													as="textarea"
													placeholder="Leave a description here"
													rows="4"
													maxLength="100"
													id="productDescription"
												/>
												<Form.Control.Feedback type="invalid">
													Please provide a valid city.
												</Form.Control.Feedback>
											</Form.Group>
										</Row>
										<Form.Group as={Col} md="8" className="position-relative mb-3">
											<Form.Label>Image</Form.Label>
											<Form.Control
												type="file"
												accept=".jpg, .jpeg, .png, .bmp, .gif"
												onChange={this.captureFile}
												id="productImage"
												required
											/>
											<Form.Control.Feedback type="invalid">
												Please provide a valid image.
											</Form.Control.Feedback>
										</Form.Group>
										<Button className="btn-danger" type="submit">{this.state.loading ? "Loading..." : "Upload Product"}</Button>
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
				<Modal show={this.state.show} onHide={this.handleClose} centered>
					<Modal.Header closeButton>
						<Modal.Title>Remove product</Modal.Title>
					</Modal.Header>
					<Modal.Body>Are you sure you want to remove this product?</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.handleClose}>
							No
						</Button>
						<Button variant="primary" onClick={this.removeProduct}>
							Yes
						</Button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}
}

export default Merchant;