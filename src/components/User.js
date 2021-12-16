import jwtDecode from 'jwt-decode';
import React, { Component } from 'react';
import Navbar from './MyNavbar';
import Header from './Header';
import { Adminconfig } from '../config';

class User extends Component {

	async componentDidMount() {
		await this.loadUser();
		await this.handleRole();
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
		if (!await rpToken.methods.isUser(this.props.account).call({from : this.props.account})) {
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

	constructor(props) {
		super(props)
		this.state = {
			loading: false,
			user: undefined,
		}
	}

	render() {
		return (
			<div>
				<Navbar account={this.props.account} role={this.props.role} onLoggedOut={this.props.onLoggedOut} />
				<Header />
				<div class="container px-4 px-lg-5 mt-5">
					<div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
						<div class="col mb-5">
							<div class="card h-100">
								{/* <!-- Product image--> */}
								<img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
								{/* <!-- Product details--> */}
								<div class="card-body p-4">
									<div class="text-center">
										{/* <!-- Product name--> */}
										<h5 class="fw-bolder">Fancy Product</h5>
										{/* <!-- Product price--> */}
										$40.00 - $80.00
									</div>
								</div>
								{/* <!-- Product actions--> */}
								<div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
									<div class="text-center"><a class="btn btn-outline-dark mt-auto" href="#">View options</a></div>
								</div>
							</div>
						</div>
						<div class="col mb-5">
							<div class="card h-100">
								{/* <!-- Sale badge--> */}
								<div class="badge bg-dark text-white position-absolute" style={{ top: 0.5 + 'rem', right: 0.5 + 'rem' }}>Sale</div>
								{/* <!-- Product image--> */}
								<img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
								{/* <!-- Product details--> */}
								<div class="card-body p-4">
									<div class="text-center">
										{/* <!-- Product name--> */}
										<h5 class="fw-bolder">Special Item</h5>
										{/* <!-- Product reviews--> */}
										<div class="d-flex justify-content-center small text-warning mb-2">
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
										</div>
										{/* <!-- Product price--> */}
										<span class="text-muted text-decoration-line-through">$20.00</span>
										$18.00
									</div>
								</div>
								{/* <!-- Product actions--> */}
								<div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
									<div class="text-center"><a class="btn btn-outline-dark mt-auto" href="#">Add to cart</a></div>
								</div>
							</div>
						</div>
						<div class="col mb-5">
							<div class="card h-100">
								{/* <!-- Sale badge--> */}
								<div class="badge bg-dark text-white position-absolute" style={{ top: 0.5 + 'rem', right: 0.5 + 'rem' }}>Sale</div>
								{/* <!-- Product image--> */}
								<img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
								{/* <!-- Product details--> */}
								<div class="card-body p-4">
									<div class="text-center">
										{/* <!-- Product name--> */}
										<h5 class="fw-bolder">Sale Item</h5>
										{/* <!-- Product price--> */}
										<span class="text-muted text-decoration-line-through">$50.00</span>
										$25.00
									</div>
								</div>
								{/* <!-- Product actions--> */}
								<div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
									<div class="text-center"><a class="btn btn-outline-dark mt-auto" href="#">Add to cart</a></div>
								</div>
							</div>
						</div>
						<div class="col mb-5">
							<div class="card h-100">
								{/* <!-- Product image--> */}
								<img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
								{/* <!-- Product details--> */}
								<div class="card-body p-4">
									<div class="text-center">
										{/* <!-- Product name--> */}
										<h5 class="fw-bolder">Popular Item</h5>
										{/* <!-- Product reviews--> */}
										<div class="d-flex justify-content-center small text-warning mb-2">
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
										</div>
										{/* <!-- Product price--> */}
										$40.00
									</div>
								</div>
								{/* <!-- Product actions--> */}
								<div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
									<div class="text-center"><a class="btn btn-outline-dark mt-auto" href="#">Add to cart</a></div>
								</div>
							</div>
						</div>
						<div class="col mb-5">
							<div class="card h-100">
								{/* <!-- Sale badge--> */}
								<div class="badge bg-dark text-white position-absolute" style={{ top: 0.5 + 'rem', right: 0.5 + 'rem' }}>Sale</div>
								{/* <!-- Product image--> */}
								<img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
								{/* <!-- Product details--> */}
								<div class="card-body p-4">
									<div class="text-center">
										{/* <!-- Product name--> */}
										<h5 class="fw-bolder">Sale Item</h5>
										{/* <!-- Product price--> */}
										<span class="text-muted text-decoration-line-through">$50.00</span>
										$25.00
									</div>
								</div>
								{/* <!-- Product actions--> */}
								<div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
									<div class="text-center"><a class="btn btn-outline-dark mt-auto" href="#">Add to cart</a></div>
								</div>
							</div>
						</div>
						<div class="col mb-5">
							<div class="card h-100">
								{/* <!-- Product image--> */}
								<img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
								{/* <!-- Product details--> */}
								<div class="card-body p-4">
									<div class="text-center">
										{/* <!-- Product name--> */}
										<h5 class="fw-bolder">Fancy Product</h5>
										{/* <!-- Product price--> */}
										$120.00 - $280.00
									</div>
								</div>
								{/* <!-- Product actions--> */}
								<div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
									<div class="text-center"><a class="btn btn-outline-dark mt-auto" href="#">View options</a></div>
								</div>
							</div>
						</div>
						<div class="col mb-5">
							<div class="card h-100">
								{/* <!-- Sale badge--> */}
								<div class="badge bg-dark text-white position-absolute" style={{ top: 0.5 + 'rem', right: 0.5 + 'rem' }}>Sale</div>
								{/* <!-- Product image--> */}
								<img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
								{/* <!-- Product details--> */}
								<div class="card-body p-4">
									<div class="text-center">
										{/* <!-- Product name--> */}
										<h5 class="fw-bolder">Special Item</h5>
										{/* <!-- Product reviews--> */}
										<div class="d-flex justify-content-center small text-warning mb-2">
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
										</div>
										{/* <!-- Product price--> */}
										<span class="text-muted text-decoration-line-through">$20.00</span>
										$18.00
									</div>
								</div>
								{/* <!-- Product actions--> */}
								<div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
									<div class="text-center"><a class="btn btn-outline-dark mt-auto" href="#">Add to cart</a></div>
								</div>
							</div>
						</div>
						<div class="col mb-5">
							<div class="card h-100">
								{/* <!-- Product image--> */}
								<img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
								{/* <!-- Product details--> */}
								<div class="card-body p-4">
									<div class="text-center">
										{/* <!-- Product name--> */}
										<h5 class="fw-bolder">Popular Item</h5>
										{/* <!-- Product reviews--> */}
										<div class="d-flex justify-content-center small text-warning mb-2">
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
											<div class="bi-star-fill"></div>
										</div>
										{/* <!-- Product price--> */}
										$40.00
									</div>
								</div>
								{/* <!-- Product actions--> */}
								<div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
									<div class="text-center"><a class="btn btn-outline-dark mt-auto" href="#">Add to cart</a></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default User;