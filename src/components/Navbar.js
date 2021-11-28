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
				<nav className="navbar navbar-expand-lg navbar-light bg-light">
					<div className="container px-4 px-lg-5">
						<a className="navbar-brand" href="/">BCOIP PRO</a>
						<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon"></span></button>
						<div className="collapse navbar-collapse" id="navbarSupportedContent">
							<ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
								<li className="nav-item"><NavLink end to="/" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Home</NavLink></li>
								<li className="nav-item"><NavLink end to="/about" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>About</NavLink></li>
								<li className="nav-item dropdown">
									<a className="nav-link dropdown-toggle" id="navbarDropdown" href="/#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Shop</a>
									<ul className="dropdown-menu" aria-labelledby="navbarDropdown">
										<li><a className="dropdown-item" href="/#">All Products</a></li>
										<li><hr className="dropdown-divider" /></li>
										<li><a className="dropdown-item" href="/#">Popular Items</a></li>
										<li><a className="dropdown-item" href="/#">New Arrivals</a></li>
									</ul>
								</li>
								<li className="nav-item"><a className="nav-link" href="/#" onClick={this.handleShow}>Logout</a></li>
							</ul>
							<ul className="navbar-nav px-3">
								<li className="nav-item text-nowrap">
									<span className="me-2 badge bg-dark">{this.props.role}</span>
									<small className="text-secondary">
										<small id="account">{this.props.account}</small>
									</small>
									{this.props.account
										? <img
											alt="identicon"
											className='ms-2'
											width='30'
											height='30'
											src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString()}`}
										/>
										: <span></span>
									}
								</li>
							</ul>
							{/* <form className="d-flex">
							<button className="btn btn-outline-dark" type="submit">
								<i className="bi-cart-fill me-1"></i>
								Cart
								<span className="badge bg-dark text-white ms-1 rounded-pill">0</span>
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