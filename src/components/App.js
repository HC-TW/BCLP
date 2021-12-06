import './App.css';
import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Web3 from 'web3';
import RPToken from '../abis/RPToken.json';
import BankLiability from '../abis/BankLiability.json'
import Main from './Main';
import Bank from './Bank';
import Issuer from './Issuer';
import Admin from './Admin';
import Footer from './Footer';
import NotFound from './NotFound';
import { Login } from './Login';
import { Adminconfig } from '../config';
import $ from 'jquery';

const LS_KEY = 'login-with-metamask:auth';

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

class App extends Component {

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    await this.loadAccessToken()
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
    if (RPToken_networkData && BankLiability_networkData) {
      window.rpToken = new web3.eth.Contract(RPToken.abi, RPToken_networkData.address)
      window.bankLiability = new web3.eth.Contract(BankLiability.abi, BankLiability_networkData.address)
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
    } else if (await rpToken.methods.isBank(this.state.account).call({ from: this.state.account })) {
      this.setState({ role: 'Bank' })
    } else if (await rpToken.methods.isIssuer(this.state.account).call({ from: this.state.account })) {
      this.setState({ role: 'Issuer' })
    } else if (await rpToken.methods.isMerchant(this.state.account).call({ from: this.state.account })) {
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
    }
  }

  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  uploadImage = description => {
    console.log("Submitting file to ipfs...")

    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if (error) {
        console.error(error)
        return
      }
      this.setState({ loading: true })
      this.state.decentragram.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  tipImageOwner = (id, tipAmount) => {
    this.setState({ loading: true })
    this.state.decentragram.methods.tipImageOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  handleLoggedIn = (auth) => {
    console.log(auth)
    localStorage.setItem(LS_KEY, JSON.stringify(auth))
    this.setState({ auth })
  }

  handleLoggedOut = () => {
    localStorage.removeItem(LS_KEY)
    this.setState({ auth: undefined })
  }

  alert = (message, type) => {
    $('<div id="appAlert"><div class="row"><div class="alert alert-' + type + ' d-flex align-items-center alert-dismissible fade show col-md-4 offset-md-4" role="alert"><i class="bi bi-check-circle-fill flex-shrink-0 me-2" style="font-size:24px;"></i>' + message + '</div>')
		.replaceAll('#appAlert')
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      role: '',
      auth: undefined,
      sequelize: null,
      images: [],
      loading: false
    }
  }



  render() {
    return (
      <Router>
        <div>
          {this.state.loading
            ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
            :
            this.state.auth
              ? <Routes>
                  <Route path="/" element={
                    (() => {
                      switch (this.state.role) {
                        case 'Bank': return <Bank account={this.state.account} role={this.state.role} auth={this.state.auth} onLoggedOut={this.handleLoggedOut} />;
                        case 'Issuer': return <Issuer account={this.state.account} role={this.state.role} auth={this.state.auth} onLoggedOut={this.handleLoggedOut} />;
                        case 'User': return <Main account={this.state.account} role={this.state.role} auth={this.state.auth} onLoggedOut={this.handleLoggedOut} />;
                        case 'Admin': return <Admin account={this.state.account} onLoggedOut={this.handleLoggedOut} />;
                        default: return <NotFound />;
                      }
                    })()
                  } />
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