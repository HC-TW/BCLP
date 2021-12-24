import './Sub.css';
import React, { useCallback, useEffect, useState } from 'react';
import Navbar from './MyNavbar';
import Header from './Header';
import $ from 'jquery';

export const UserOrder = ({ account, role, onLoggedOut }) => {
	const [orders, setOrders] = useState([]); // Loading order state
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

	useEffect(() => {
		loadOrders()
	}, [loadOrders])

	useEffect(() => {
		loadInfo()
	}, [loadInfo])

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
