import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import Identicon from 'identicon.js';

class Navbar extends Component {

	handleClose = () => {
		this.setState({ show: false })
	}

	handleShow = () => {
		this.setState({ show: true })
	}

	constructor(props) {
		super(props)
		this.state = {
			show: false
		}
	}
	render() {
		return (
			<div>
				<nav class="navbar navbar-expand-lg navbar-light bg-light">
					<div class="container px-4 px-lg-5">
						<a class="navbar-brand" href="/">BCOIP PRO</a>
						<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
						<div class="collapse navbar-collapse" id="navbarSupportedContent">
							<ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
								<li class="nav-item"><NavLink end to="/" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Home</NavLink></li>
								<li class="nav-item"><NavLink end to="/about" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>About</NavLink></li>
								<li class="nav-item dropdown">
									<a class="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Shop</a>
									<ul class="dropdown-menu" aria-labelledby="navbarDropdown">
										<li><a class="dropdown-item" href="#">All Products</a></li>
										<li><hr class="dropdown-divider" /></li>
										<li><a class="dropdown-item" href="#">Popular Items</a></li>
										<li><a class="dropdown-item" href="#">New Arrivals</a></li>
									</ul>
								</li>
								<li class="nav-item"><a class="nav-link" href="#" onClick={this.handleShow}>Logout</a></li>
							</ul>
							<ul className="navbar-nav px-3">
								<li className="nav-item text-nowrap">
									<small className="text-secondary">
										<small id="account">{this.props.account}</small>
									</small>
									{this.props.account
										? <img
											className='ml-2'
											width='30'
											height='30'
											src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString()}`}
										/>
										: <span></span>
									}
								</li>
							</ul>
							{/* <form class="d-flex">
							<button class="btn btn-outline-dark" type="submit">
								<i class="bi-cart-fill me-1"></i>
								Cart
								<span class="badge bg-dark text-white ms-1 rounded-pill">0</span>
							</button>
						</form> */}
						</div>
					</div>
				</nav>
				{/* Modal */}
				<Modal show={this.state.show} onHide={this.handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>Logout</Modal.Title>
					</Modal.Header>
					<Modal.Body>Are you sure you want to logout?</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.handleClose}>
							No
						</Button>
						<Button variant="primary" onClick={this.props.onLoggedOut}>
							Yes
						</Button>
					</Modal.Footer>
				</Modal>
			</div>

		);
	}
}

export default Navbar;