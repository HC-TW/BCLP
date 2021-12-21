import jwtDecode from 'jwt-decode';
import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Navbar from './MyNavbar';
import Header from './Header';
import { Adminconfig } from '../config';
import $ from 'jquery';

class User extends Component {

	async componentDidMount() {
		await this.loadUser();
		await this.handleRole();
		await this.loadProducts();
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

	async handleRole() {
		const web3 = window.web3
		const rpToken = window.rpToken
		if (!await rpToken.methods.isUser(this.props.account).call({ from: this.props.account })) {
			const tx = {
				from: Adminconfig.address,
				to: rpToken.options.address,
				gas: 6721975,
				data: rpToken.methods.addUser(this.props.account).encodeABI()
			};
			const signedTx = await web3.eth.accounts.signTransaction(tx, Adminconfig.key)
			web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', console.log)
		}
	}

	async loadProducts() {
		const productCount = await window.productManager.methods._productCount().call()
		for (let i = 1; i <= productCount; i++) {
			const product = await window.productManager.methods._products(i).call()
			if (product.id.toNumber() !== 0) {
				this.setState({
					products: [...this.state.products, product]
				})
			}
		}
	}

	redeem = () => {
		window.rpToken.methods.redeem(this.state.redeem_merchant, this.state.redeem_name, this.state.redeem_quantity, this.state.redeem_amount).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
		})
	}

	handleClose = () => {
		this.setState({ show: false })
	}

	handleShow = (event, redeem_merchant, redeem_name, redeem_price) => {
		const input = $(event.target.parentElement).find('input')
		if (input.val() === '') {
			input.val(1)
		}
		this.setState({ redeem_merchant })
		this.setState({ redeem_name })
		this.setState({ redeem_quantity: input.val() })
		this.setState({ redeem_amount: redeem_price * input.val() })
		this.setState({ show: true })
	}

	constructor(props) {
		super(props)
		this.state = {
			loading: false,
			user: undefined,
			products: [],
			show: false,
			redeem_merchant: '',
			redeem_name: '',
			redeem_quantity: 1
		}
	}

	render() {
		return (
			<div>
				<Navbar account={this.props.account} role={this.props.role} onLoggedOut={this.props.onLoggedOut} />
				<Header />
				<div className="container px-4 px-lg-5 mt-5">
					<div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
						{this.state.products.map(product => {
							return (
								<div className="col mb-5">
									<div className="card h-100">
										{/* <!-- Product image--> */}
										<img className="card-img-top" src={`https://ipfs.infura.io/ipfs/${product.imgHash}`} alt="..." />
										{/* <!-- Product details--> */}
										<div className="card-body p-4">
											<div className="text-center">
												{/* <!-- Product merchant--> */}
												<h4 className="fw-bolder">{product.merchant}</h4>
												{/* <!-- Product name--> */}
												<h5 className="fw-bolder">{product.name}</h5>
												{/* <!-- Product description--> */}
												<h6>{product.description}</h6>
												{/* <!-- Product price--> */}
												{product.price}
											</div>
										</div>
										{/* <!-- Product actions--> */}
										<div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
											<div className="input-group text-center">
												<input type="number" className="form-control" min="1" max="100" />
												<button type="button" className="btn btn-outline-dark" onClick={(e) => this.handleShow(e, product.merchant, product.name, product.price)}>Redeem</button>
											</div>
										</div>
									</div>
								</div>
							)
						})}
						<div className="col mb-5">
							<div className="card h-100">
								{/* <!-- Product image--> */}
								<img className="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
								{/* <!-- Product details--> */}
								<div className="card-body p-4">
									<div className="text-center">
										{/* <!-- Product merchant--> */}
										<h4 className="fw-bolder">Merchant</h4>
										{/* <!-- Product name--> */}
										<h5 className="fw-bolder">Fancy Product</h5>
										{/* <!-- Product name--> */}
										<h6>Description</h6>
										{/* <!-- Product price--> */}
										$40.00 - $80.00
									</div>
								</div>
								{/* <!-- Product actions--> */}
								<div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
									<div className="input-group text-center">
										<input type="number" className="form-control" min="1" max="100" />
										<button type="button" className="btn btn-outline-dark" onClick={this.handleShow}>Redeem</button>
									</div>
								</div>
							</div>
						</div>
						<div className="col mb-5">
							<div className="card h-100">
								{/* <!-- Sale badge--> */}
								<div className="badge bg-dark text-white position-absolute" style={{ top: 0.5 + 'rem', right: 0.5 + 'rem' }}>Sale</div>
								{/* <!-- Product image--> */}
								<img className="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
								{/* <!-- Product details--> */}
								<div className="card-body p-4">
									<div className="text-center">
										{/* <!-- Product name--> */}
										<h5 className="fw-bolder">Special Item</h5>
										{/* <!-- Product reviews--> */}
										<div className="d-flex justify-content-center small text-warning mb-2">
											<div className="bi-star-fill"></div>
											<div className="bi-star-fill"></div>
											<div className="bi-star-fill"></div>
											<div className="bi-star-fill"></div>
											<div className="bi-star-fill"></div>
										</div>
										{/* <!-- Product price--> */}
										<span className="text-muted text-decoration-line-through">$20.00</span>
										$18.00
									</div>
								</div>
								{/* <!-- Product actions--> */}
								<div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
									<div className="input-group text-center">
										<input type="number" className="form-control" min="1" max="100" />
										<button type="button" className="btn btn-outline-dark" onClick={this.handleShow}>Redeem</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Modal */}
				<Modal show={this.state.show} onHide={this.handleClose} centered>
					<Modal.Header closeButton>
						<Modal.Title>Redeem</Modal.Title>
					</Modal.Header>
					<Modal.Body>Are you sure you want to redeem {this.state.redeem_amount} RP for {this.state.redeem_quantity} {this.state.redeem_name}(s)?</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.handleClose}>
							No
						</Button>
						<Button variant="primary" onClick={this.redeem}>
							Yes
						</Button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}
}

export default User;