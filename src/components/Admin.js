import jwtDecode from 'jwt-decode';
import React, { Component } from 'react';
import Header from './Header';
import $ from 'jquery';
import MyNavbar from './MyNavbar';

class Admin extends Component {

	async componentDidMount() {
		await this.loadUser()
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

	addBank = () => {
		const address = $('#addBankAddress').val()
		window.rpToken.methods.addBank(address).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
		})
	}

	addIssuer = () => {
		const address = $('#addIssuerAddress').val()
		window.rpToken.methods.addIssuer(address).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
		})
	}

	addUser = () => {
		const address = $('#addUserAddress').val()
		window.rpToken.methods.addUser(address).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
		})
	}

	addMerchant = () => {
		const address = $('#addMerchantAddress').val()
		window.rpToken.methods.addMerchant(address).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
		})
	}

	removeBank = () => {
		const address = $('#removeBankAddress').val()
		window.rpToken.methods.removeBank(address).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
		})
	}

	removeIssuer = () => {
		const address = $('#removeIssuerAddress').val()
		window.rpToken.methods.removeIssuer(address).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
		})
	}

	removeUser = () => {
		const address = $('#removeUserAddress').val()
		window.rpToken.methods.removeUser(address).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
		})
	}

	removeMerchant = () => {
		const address = $('#removeMerchantAddress').val()
		window.rpToken.methods.removeMerchant(address).send({ from: this.props.account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			this.alert(msg, 'success')
		})
	}

	alert = (message, type) => {
		$('<div><div class="row"><div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '</div>')
			.appendTo('#logs')
	};

	getInitialState = () => ({
		user: undefined
	})

	constructor(props) {
		super(props)
		this.state = this.getInitialState()
	}

	render() {
		return (
			<div>
				<MyNavbar account={this.props.account} role={this.props.role} onLoggedOut={this.props.onLoggedOut} />
				<Header />
				<div className="container px-4 px-lg-5">

					{/* <!-- Page Heading --> */}
					<div className="d-sm-flex align-items-center justify-content-between mb-4">
						<h1 className="h3 mt-4 mb-0 text-gray-800">Admin</h1>
						<a href="/#" className="mt-4 d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
							className="fas fa-download fa-sm text-white-50"></i> Generate Report</a>
					</div>

					<div className="row">
						<div className="col-lg-12 mb-4">
							<div className="card shadow mb-4">
								<div className="card-header py-3">
									<h6 className="m-0 font-weight-bold text-primary">Functions</h6>
								</div>
								<div className="card-body">
									<div className="input-group mb-3">
										<input type="text" className="form-control" placeholder="Bank's address" aria-label="Bank's address" id="addBankAddress"></input>
										<button className="btn btn-outline-primary" type="button" onClick={this.addBank}>addBank</button>
									</div>
									<div className="input-group mb-3">
										<input type="text" className="form-control" placeholder="Issuer's address" aria-label="Issuer's address" id="addIssuerAddress"></input>
										<button className="btn btn-outline-secondary" type="button" onClick={this.addIssuer}>addIssuer</button>
									</div>
									<div className="input-group mb-3">
										<input type="text" className="form-control" placeholder="User's address" aria-label="User's address" id="addUserAddress"></input>
										<button className="btn btn-outline-success" type="button" onClick={this.addUser}>addUser</button>
									</div>
									<div className="input-group mb-3">
										<input type="text" className="form-control" placeholder="Merchant's address" aria-label="Merchant's address" id="addMerchantAddress"></input>
										<button className="btn btn-outline-danger" type="button" onClick={this.addMerchant}>addMerchant</button>
									</div>
									<div className="input-group mb-3">
										<input type="text" className="form-control" placeholder="Bank's address" aria-label="Bank's address" id="removeBankAddress"></input>
										<button className="btn btn-outline-primary" type="button" onClick={this.removeBank}>removeBank</button>
									</div>
									<div className="input-group mb-3">
										<input type="text" className="form-control" placeholder="Issuer's address" aria-label="Issuer's address" id="removeIssuerAddress"></input>
										<button className="btn btn-outline-secondary" type="button" onClick={this.removeIssuer}>removeIssuer</button>
									</div>
									<div className="input-group mb-3">
										<input type="text" className="form-control" placeholder="User's address" aria-label="User's address" id="removeUserAddress"></input>
										<button className="btn btn-outline-success" type="button" onClick={this.removeUser}>removeUser</button>
									</div>
									<div className="input-group mb-3">
										<input type="text" className="form-control" placeholder="Merchant's address" aria-label="Merchant's address" id="removeMerchantAddress"></input>
										<button className="btn btn-outline-danger" type="button" onClick={this.removeMerchant}>removeMerchant</button>
									</div>
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

export default Admin;