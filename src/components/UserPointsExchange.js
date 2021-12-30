import React, { useCallback, useEffect, useState, Modal, Button } from 'react';
import { Tab, Nav, Collapse } from 'react-bootstrap';
import Navbar from './MyNavbar';
import Header from './Header';
import $ from 'jquery';

export const UserPointsExchange = ({ account, role, onLoggedOut }) => {
	const [orders, setOrders] = useState([]);
	const [finishedOrders, setFinishedOrders] = useState([]);

	const loadOrders = useCallback(async () => {
		setOrders([])
		setFinishedOrders([])
		let redemptionAmount = 0
		const orderParties = await window.productManager.methods.getOrderParties().call({ from: account })
		for (let i = 0; i < orderParties.length; i++) {
			const Orders = await window.productManager.methods.getOrders(account, orderParties[i]).call({ from: account })
			for (let j = 0; j < Orders.length; j++) {
				const order = Orders[j]
				if (!order.isFinished) {
					setOrders(oldOrders => [...oldOrders, [orderParties[i], order, j]])
				} else {
					setFinishedOrders(oldFinishedOrders => [...oldFinishedOrders, [orderParties[i], order]])
				}
				redemptionAmount += Number(order.amount)
			}
		}
		$('#redemptionAmount').text(redemptionAmount + ' RP')
	}, [account])

	const loadInfo = useCallback(() => {
		$('#orderQuantity').text(orders.length)
		$('#finishedOrderQuantity').text(finishedOrders.length)
	}, [orders.length, finishedOrders.length])

	/* const loadEvents = useCallback(() => {
		window.rpToken.events.Transfer({
			filter: { to: account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			setIssueEvents(oldIssueEvents => [...oldIssueEvents, [values.from, values.value, new Date(block.timestamp * 1000).toLocaleString()]])
		})
	}, [account]) */

	/* useEffect(() => {
		loadOrders()
	}, [loadOrders])

	useEffect(() => {
		loadInfo()
	}, [loadInfo])

	useEffect(() => {
		loadEvents()
	}, [loadEvents]) */

	const confirm = (merchant, amount, orderIdx) => {
		window.rpToken.methods.confirm(merchant, amount, orderIdx).send({ from: account }).on('receipt', receipt => {
			const msg = 'Transaction: ' + receipt.transactionHash + '<br>Gas usage: ' + receipt.gasUsed + '<br>Block Number: ' + receipt.blockNumber;
			alert(msg, 'success')
			loadOrders()
		})
	}

	const alert = (message, type) => {
		$('<div><div class="row"><div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '</div>')
			.appendTo('#logs')
	};

	/* const changeCollapse = () => {
		setCollapse(prevCollapse => !prevCollapse)
	} */

	return (
		<div>
			<Navbar account={account} role={role} onLoggedOut={onLoggedOut} />
			<Header />
			<div className="container px-4 px-lg-5 mt-4">
				<div className="row">
					<div className="col-lg-12 mb-4">

						{/* <!-- Events --> */}
						<Tab.Container defaultActiveKey="rp2other">
							<Nav variant="pills">
								<Nav.Item>
									<Nav.Link eventKey="rp2other">RP {<i class="bi bi-arrow-right-circle-fill"></i>} Other points</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="other2rp">Other points {<i class="bi bi-arrow-right-circle-fill"></i>} RP</Nav.Link>
								</Nav.Item>
							</Nav>
							<div className="tab-content">
								<Tab.Pane eventKey="rp2other">

								</Tab.Pane>
								<Tab.Pane eventKey="other2rp">

								</Tab.Pane>
							</div>
						</Tab.Container>


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
			{/* <Modal show={this.state.show} onHide={this.handleClose} centered>
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
			</Modal> */}
		</div>
	);
};
