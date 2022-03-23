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

	async handleRole() {
		const web3 = window.web3
		const rpToken = window.rpToken
		if (!await rpToken.methods._users(this.props.account).call({ from: this.props.account })) {
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
			if (Number(product.id) !== 0) {
				this.setState({
					products: [...this.state.products, product]
				})
			}
		}
	}

	async loadRP() {
		$('#rp').text(await window.rpToken.methods.balanceOf(this.props.account).call({ from: this.props.account }))
	}

	redeem = () => {
		window.rpToken.methods.redeem(this.state.redeem_merchant, this.state.redeem_name, this.state.redeem_quantity, this.state.redeem_amount).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			console.log(msg)
			this.loadRP()
			this.handleClose()
			this.successHandleShow()
		})
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

	handleClose = () => {
		this.setState({ show: false })
	}

	successHandleShow = () => {
		this.setState({ success_show: true })
	}

	successHandleClose = () => {
		this.setState({ success_show: false })
	}

	getInitialState = () => ({
		user: undefined,
		products: [],
		show: false,
		success_show: false,
		redeem_merchant: '',
		redeem_name: '',
		redeem_quantity: 1
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
				<div className="container px-4 px-lg-5 mt-5">
					<div className="row gx-4 gx-lg-5 row-cols-3 row-cols-md-4 row-cols-xl-5 justify-content-center">
						{this.state.products.map((product, idx) => {
							return (
								<div className="col mb-5" key={product.id}>
									<div className="card shadow h-100">
										{/* <!-- Product image--> */}
										<img className="card-img-top" src={`https://ipfs.infura.io/ipfs/${product.imgHash}`} alt="..." />
										{/* <!-- Product details--> */}
										<div className="card-body p-4">
											<div className="text-center">
												{/* <!-- Product merchant--> */}
												<h5 className="fw-bolder">{product.merchant}</h5>
												{/* <!-- Product name--> */}
												<h5 className="fw-bolder">{product.name}</h5>
												{/* <!-- Product description--> */}
												<h6>{product.description}</h6>
												{/* <!-- Product price--> */}
												<h6>{product.price} RP</h6>
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

				{/* Modal */}
				<Modal show={this.state.success_show} onHide={this.successHandleClose}>
					<Modal.Header closeButton>
						<Modal.Title>Redeem</Modal.Title>
					</Modal.Header>
					<Modal.Body>Redeem products successfully!</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.successHandleClose}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}
}

export default User;