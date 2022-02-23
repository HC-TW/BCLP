import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Nav, Navbar, Modal, Button } from 'react-bootstrap';
import Identicon from 'identicon.js';
import $ from 'jquery';

class MyNavbar extends Component {

	async componentDidMount() {
		this.loadRP();
	}

	async loadRP() {
		if (this.props.role === 'User') {
			$('#rp').text(await window.rpToken.methods.balanceOf(this.props.account).call({ from: this.props.account }))
		} else if (this.props.role === 'Admin') {
			$('#rp').text(await window.rpToken.methods.balanceOf(window.pointExchange._address).call({ from: this.props.account }))
		}
	}

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
				<Navbar bg="light" expand="lg">
					<Container className="px-4 px-lg-5">
						<Navbar.Brand href="/">BCLP</Navbar.Brand>
						<Navbar.Toggle aria-controls="navbarScroll" />
						<Navbar.Collapse id="navbarScroll">
							<Nav
								className="me-auto mb-2 mb-lg-0 ms-lg-4"
								style={{ maxHeight: '100px' }}
								navbarScroll
							>
								<NavLink end to="/" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Home</NavLink>
								{this.props.role === 'User' ? <NavLink end to="/UserOrder" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Order</NavLink> : null}
								{this.props.role === 'User' ? <NavLink end to="/UserPointExchange" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Point Exchange</NavLink> : null}
								{/* <NavDropdown title="Shop" id="navbarScrollingDropdown">
									<NavDropdown.Item href="/#">All Products</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item href="/#">Popular Items</NavDropdown.Item>
									<NavDropdown.Item href="/#">New Arrivals</NavDropdown.Item>
								</NavDropdown> */}
								<Nav.Link href="#" onClick={this.handleShow}>Logout</Nav.Link>
							</Nav>
							<ul className="navbar-nav">
								<li className="nav-item text-nowrap">
									{(this.props.role === 'User' || this.props.role === 'Admin') ?
										<button type="button" className="btn btn-light btn-sm">
											<span className="badge bg-secondary" id="rp">0</span> RP
										</button> : null}
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
						</Navbar.Collapse>
					</Container>
				</Navbar>
				{/* <form className="d-flex">
							<button className="btn btn-outline-dark" type="submit">
								<i className="bi-cart-fill me-1"></i>
								Cart
								<span className="badge bg-dark text-white ms-1 rounded-pill">0</span>
							</button>
						</form> */}

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

export default MyNavbar;