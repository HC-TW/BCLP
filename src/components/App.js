import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Web3 from 'web3';
import RPToken from '../abis/RPToken.json'
import Identicon from 'identicon.js';
import './App.css';
import LoginNavbar from './LoginNavbar';
import Navbar from './Navbar'
import Main from './Main'
import Header from './Header';
import Footer from './Footer';
import NotFound from './NotFound';
import { Profile } from './Profile';
import { Login } from './Login';

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
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    } else {
      window.alert('You should install MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = RPToken.networks[networkId]
    if (networkData) {
      const rpToken = new web3.eth.Contract(RPToken.abi, networkData.address)
      this.setState({ rpToken })
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

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      auth: undefined,
      sequelize: null,
      rpToken: null,
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
              ? <Main account={this.state.account} auth={this.state.auth} onLoggedOut={this.handleLoggedOut} />
              : <Login account={this.state.account} onLoggedIn={this.handleLoggedIn} />
            /* <Routes>
              <Route path="/" element={<Main/>}/>
              <Route path="*" element={<NotFound/>} />
            </Routes> */
          }
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;