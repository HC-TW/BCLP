import React, { Component } from 'react';
import Header from './Header';
import $ from 'jquery';

class Admin extends Component {

	async componentDidMount() {

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


	constructor(props) {
		super(props)
		this.state = {

		}
	}

	render() {
		return (
			<div>
				<nav className="navbar navbar-expand-lg navbar-light bg-light">
					<div className="container px-4 px-lg-5">
						<a className="navbar-brand font-monospace" href="/#">BCOIP PRO</a>
						<div className="navbar-nav">
							<a className="nav-link" href="/#" onClick={this.props.onLoggedOut}>Logout</a>
						</div>
					</div>
				</nav>
				<Header />
				<div className="row justify-content-center">
					<div className="col-md-4">
						<div className="card">
							<div className="card-header">
								<h4 className="font-weight-bold" >Functions</h4>
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
					</div>
				</div>
				<div className="row justify-content-center mt-3">
					<div className="col-md-7">
						<div className="card">
							<div className="card-header">
								<h4 className="font-weight-bold" >Logs</h4>
							</div>
							<div className="card-body" id="logs">
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Admin;