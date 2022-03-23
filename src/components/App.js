import './App.scss';
import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Web3 from 'web3';
import RPToken from '../abis/RPToken.json';
import BankLiability from '../abis/BankLiability.json'
import ProductManager from '../abis/ProductManager.json'
import PointExchange from '../abis/PointExchange.json'
import User from './User';
import Bank from './Bank';
import Issuer from './Issuer';
import Admin from './Admin';
import Footer from './Footer';
import NotFound from './NotFound';
import { Login } from './Login';
import { Adminconfig, Regulatorconfig } from '../config';
import $ from 'jquery';
import { UserOrder } from './UserOrder';
import Merchant from './Merchant';
import { UserPointExchange } from './UserPointExchange';
import Regulator from './Regulator';

const LS_KEY = 'login-with-metamask:auth';

class App extends Component {

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    await this.loadAccessToken()
  }

  componentWillUnmount() {
    this.setState(this.getInitialState())
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)

    } else {
      window.alert('You should install MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const RPToken_networkData = RPToken.networks[networkId]
    const BankLiability_networkData = BankLiability.networks[networkId]
    const ProductManager_networkData = ProductManager.networks[networkId]
    const PointExchange_networkData = PointExchange.networks[networkId]
    if (RPToken_networkData && BankLiability_networkData && ProductManager_networkData && PointExchange_networkData) {
      window.rpToken = new web3.eth.Contract(RPToken.abi, RPToken_networkData.address)
      window.bankLiability = new web3.eth.Contract(BankLiability.abi, BankLiability_networkData.address)
      window.productManager = new web3.eth.Contract(ProductManager.abi, ProductManager_networkData.address)
      window.pointExchange = new web3.eth.Contract(PointExchange.abi, PointExchange_networkData.address)
      this.loadRole();
      // console.log(RPToken_networkData.address)
    } else {
      window.alert('RPToken contract not deployed to detected network.')
    }
  }

  async loadAccessToken() {
    // Access token is stored in localstorage
    const ls = window.localStorage.getItem(LS_KEY);
    const auth = ls && JSON.parse(ls);
    this.setState({ auth });
  }

  async loadRole() {
    const rpToken = window.rpToken
    if (this.state.account === Adminconfig.address.toLowerCase()) {
      this.setState({ role: 'Admin' })
    } else if (this.state.account === Regulatorconfig.address.toLowerCase()) {
      this.setState({ role: 'Regulator' })
    } else if (await rpToken.methods._banks(this.state.account).call({ from: this.state.account })) {
      this.setState({ role: 'Bank' })
    } else if (await rpToken.methods._issuers(this.state.account).call({ from: this.state.account })) {
      this.setState({ role: 'Issuer' })
    } else if (await rpToken.methods._merchants(this.state.account).call({ from: this.state.account })) {
      this.setState({ role: 'Merchant' })
    } else {
      this.setState({ role: 'User' })
    }
    console.log(this.state.role)
  }

  // For now, 'eth_accounts' will continue to always return an array
  handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== this.state.account) {
      this.handleLoggedOut()
      this.setState({ account: accounts[0] })
      this.loadRole()
      this.alert('Account changed!', 'success')
      window.history.replaceState({}, null, '/');
    }
  }

  handleLoggedIn = (auth) => {
    console.log(auth)
    localStorage.setItem(LS_KEY, JSON.stringify(auth))
    this.setState({ auth })
  }

  handleLoggedOut = () => {
    localStorage.removeItem(LS_KEY)
    this.setState({ auth: undefined })
    window.history.replaceState({}, null, '/');
  }

  alert = (message, type) => {
    $('<div id="appAlert"><div class="row"><div class="alert alert-' + type + ' d-flex align-items-center alert-dismissible fade show col-md-4 offset-md-4" role="alert"><i class="bi bi-check-circle-fill flex-shrink-0 me-2" style="font-size:24px;"></i>' + message + '</div>')
      .replaceAll('#appAlert')
  }

  getInitialState = () => ({
    account: '',
    role: '',
    auth: undefined,
    sequelize: null
  })

  constructor(props) {
    super(props)
    this.state = this.getInitialState()
  }

  render() {
    return (
      <Router>
        <div>
          {this.state.auth
            ? <Routes>
              <Route path="/" element={
                (() => {
                  switch (this.state.role) {
                    case 'Bank': return <Bank account={this.state.account} role={this.state.role} auth={this.state.auth} onLoggedOut={this.handleLoggedOut} />;
                    case 'Issuer': return <Issuer account={this.state.account} role={this.state.role} auth={this.state.auth} onLoggedOut={this.handleLoggedOut} />;
                    case 'User': return <User account={this.state.account} role={this.state.role} auth={this.state.auth} onLoggedOut={this.handleLoggedOut} />;
                    case 'Merchant': return <Merchant account={this.state.account} role={this.state.role} auth={this.state.auth} onLoggedOut={this.handleLoggedOut} />;
                    case 'Admin': return <Admin account={this.state.account} role={this.state.role} auth={this.state.auth} onLoggedOut={this.handleLoggedOut} />;
                    case 'Regulator': return <Regulator account={this.state.account} role={this.state.role} auth={this.state.auth} onLoggedOut={this.handleLoggedOut} />;
                    default: return <NotFound />;
                  }
                })()
              } />
              <Route path="/UserOrder" element={this.state.role === 'User' ? <UserOrder account={this.state.account} role={this.state.role} onLoggedOut={this.handleLoggedOut} /> : <NotFound />} />
              <Route path="/UserPointExchange" element={this.state.role === 'User' ? <UserPointExchange account={this.state.account} role={this.state.role} onLoggedOut={this.handleLoggedOut} /> : <NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            : <Login account={this.state.account} onLoggedIn={this.handleLoggedIn} />
          }
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;