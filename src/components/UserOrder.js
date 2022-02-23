import React, { useCallback, useEffect, useState } from 'react';
import { Tab, Nav, Collapse } from 'react-bootstrap';
import Navbar from './MyNavbar';
import Header from './Header';
import $ from 'jquery';

export const UserOrder = ({ account, role, onLoggedOut }) => {
	const [orders, setOrders] = useState([]);
	const [finishedOrders, setFinishedOrders] = useState([]);
	const [issueEvents, setIssueEvents] = useState([]);
	const [exchangeRPEvents, setExchangeRPEvents] = useState([]);
	const [exchangeOtherEvents, setExchangeOtherEvents] = useState([]);
	const [collapse, setCollapse] = useState(true);

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

	const loadEvents = useCallback(() => {
		window.rpToken.events.Transfer({
			filter: { to: account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			if (values.from !== window.pointExchange._address) {
				const block = await window.web3.eth.getBlock(events.blockNumber)
				setIssueEvents(oldIssueEvents => [...oldIssueEvents, [values.from, values.value, new Date(block.timestamp * 1000).toLocaleString()]])
			}
		})
		window.pointExchange.events.ExchangeRP({
			filter: { user: account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			setExchangeRPEvents(oldExchangeRPEvents => [...oldExchangeRPEvents, { bank: values.bank, name: values.name, oldAmount: values.oldAmount, amount: values.amount, timestamp: new Date(block.timestamp * 1000).toLocaleString() }])
		})
		window.pointExchange.events.ExchangeOther({
			filter: { user: account },
			fromBlock: 0
		}, async (error, events) => {
			const values = events.returnValues
			const block = await window.web3.eth.getBlock(events.blockNumber)
			setExchangeOtherEvents(oldExchangeOtherEvents => [...oldExchangeOtherEvents, { bank: values.bank, name: values.name, oldAmount: values.oldAmount, amount: values.amount, timestamp: new Date(block.timestamp * 1000).toLocaleString() }])
		})

	}, [account])

	useEffect(() => {
		loadOrders()
	}, [loadOrders])

	useEffect(() => {
		loadInfo()
	}, [loadInfo])

	useEffect(() => {
		loadEvents()
	}, [loadEvents])

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

	const changeCollapse = () => {
		setCollapse(prevCollapse => !prevCollapse)
	}

	return (
		<div>
			<Navbar account={account} role={role} onLoggedOut={onLoggedOut} />
			<Header />
			<div className="container px-4 px-lg-5">

				{/* <!-- Page Heading --> */}
				<div className="d-sm-flex align-items-center justify-content-between mb-4">
					<h1 className="h3 mt-4 mb-0 text-gray-800">User</h1>
					<a href="/#" className="mt-4 d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
						className="fas fa-download fa-sm text-white-50"></i> Generate Report</a>
				</div>

				{/* <!-- Content Row --> */}
				<div className="row">

					{/* <!-- Earnings (Monthly) Card Example --> */}
					<div className="col-xl-4 col-md-6 mb-4">
						<div className="card border-left-primary shadow h-100 py-3">
							<div className="card-body">
								<div className="row no-gutters align-items-center">
									<div className="col mr-2">
										<div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
											Redemption Amount</div>
										<div className="h5 mb-0 font-weight-bold text-gray-800" id="redemptionAmount"></div>
									</div>
									<div className="col-auto">
										<i className="bi bi-cash-coin fa-2x text-gray-300"></i>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* <!-- Earnings (Monthly) Card Example --> */}
					<div className="col-xl-4 col-md-6 mb-4">
						<div className="card border-left-success shadow h-100 py-3">
							<div className="card-body">
								<div className="row no-gutters align-items-center">
									<div className="col mr-2">
										<div className="text-xs font-weight-bold text-success text-uppercase mb-1">
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
					<div className="col-xl-4 col-md-6 mb-4">
						<div className="card border-left-info shadow h-100 py-3">
							<div className="card-body">
								<div className="row no-gutters align-items-center">
									<div className="col mr-2">
										<div className="text-xs font-weight-bold text-info text-uppercase mb-1">
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
							<Tab.Container defaultActiveKey="issue">
								<div className="card-header">
									<h6 className="m-0 font-weight-bold text-secondary my-2">Events</h6>
									<Nav variant="pills">
										<Nav.Item>
											<Nav.Link eventKey="issue">Issue</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="rp2other">RP {<i className="bi bi-arrow-right-circle-fill"></i>} Other Point</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="other2rp">Other Point {<i className="bi bi-arrow-right-circle-fill"></i>} RP</Nav.Link>
										</Nav.Item>
										<button type="button" className="ms-auto btn btn-sm float-end" onClick={changeCollapse} aria-expanded={collapse}><i className="bi bi-caret-down-fill text-secondary"></i></button>
									</Nav>
								</div>
								<Collapse in={collapse}>
									<div className="card-body tab-content">
										<Tab.Pane eventKey="issue">
											<div className="table-responsive">
												<table className="table table-striped table-hover align-middle">
													<thead>
														<tr>
															<th scope="col">#</th>
															<th scope="col">Issuer</th>
															<th scope="col">Amount</th>
															<th scope="col">Timestamp</th>
														</tr>
													</thead>
													<tbody>
														{issueEvents.map((event, idx) => {
															return (
																<tr key={event[0] + idx}>
																	<th scope="row">{idx + 1}</th>
																	<td>{event[0]}</td>
																	<td>+ {event[1]} RP</td>
																	<td>{event[2]}</td>
																</tr>
															)
														})}
													</tbody>
												</table>
											</div>
										</Tab.Pane>
										<Tab.Pane eventKey="rp2other">
											<div className="table-responsive">
												<table className="table table-striped table-hover align-middle">
													<thead>
														<tr>
															<th scope="col">#</th>
															<th scope="col">Bank</th>
															<th scope="col">RP</th>
															<th scope="col">Amount</th>
															<th scope="col">Timestamp</th>
														</tr>
													</thead>
													<tbody>
														{exchangeOtherEvents.map((event, idx) => {
															return (
																<tr key={event.name + idx}>
																	<th scope="row">{idx + 1}</th>
																	<td>{event.bank}</td>
																	<td>- {event.oldAmount} RP</td>
																	<td>+ {event.amount} {event.name}</td>
																	<td>{event.timestamp}</td>
																</tr>
															)
														})}
													</tbody>
												</table>
											</div>
										</Tab.Pane>
										<Tab.Pane eventKey="other2rp">
											<div className="table-responsive">
												<table className="table table-striped table-hover align-middle">
													<thead>
														<tr>
															<th scope="col">#</th>
															<th scope="col">Bank</th>
															<th scope="col">Other Point</th>
															<th scope="col">Amount</th>
															<th scope="col">Timestamp</th>
														</tr>
													</thead>
													<tbody>
														{exchangeRPEvents.map((event, idx) => {
															return (
																<tr key={event.name + idx}>
																	<th scope="row">{idx + 1}</th>
																	<td>{event.bank}</td>
																	<td>- {event.oldAmount} {event.name}</td>
																	<td>+ {event.amount} RP</td>
																	<td>{event.timestamp}</td>
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
												<th scope="col">Button</th>
											</tr>
										</thead>
										<tbody>
											{orders.map((order, idx) => {
												return (
													<tr key={order[0] + idx}>
														<th scope="row">{idx + 1}</th>
														<td>{order[0]}</td>
														<td>{order[1].name}</td>
														<td>{order[1].quantity}</td>
														<td>{order[1].amount} RP</td>
														<td>{new Date(order[1].timestamp * 1000).toLocaleString()}</td>
														<td><button type="button" className="btn btn-danger btn-sm" onClick={() => { confirm(order[0], order[1].amount, order[2]) }}>Confirm</button></td>
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
											{finishedOrders.map((order, idx) => {
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
			</div >
		</div >
	);
};
