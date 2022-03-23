const RPToken = artifacts.require("RPToken");
const BankLiability = artifacts.require("BankLiability");
const ProductManager = artifacts.require("ProductManager")
// const Credit = artifacts.require("Credit");
const PointExchange = artifacts.require("PointExchange");

module.exports = function (deployer) {
  deployer.deploy(RPToken, "Reward Points", "RP").then(function () {
    return deployer.deploy(BankLiability, RPToken.address);
  }).then(function () {
    return deployer.deploy(ProductManager, RPToken.address);
  }).then(function () {
    return deployer.deploy(PointExchange, RPToken.address);
  }).then(function () {
    return RPToken.deployed();
  }).then(function (instance) {     
    // Pre-defined role
    instance.addBank('0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0');
    instance.addBank('0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC');
    instance.addIssuer('0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b');
    instance.addUser('0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9');
    instance.addMerchant('0x28a8746e75304c0780E011BEd21C72cD78cd535E');
    // Point Exchange role
    instance.addIssuer(PointExchange.address);
    // load other contracts' information
    instance.loadBankLiability(BankLiability.address);
    instance.loadProductManager(ProductManager.address);
    instance.loadPointExchange(PointExchange.address);
  });

  /* deployer.deploy(RPToken, "Rewarding Points", "RP").then(function () {
    return deployer.deploy(BankLiability, RPToken.address);
  }).then(function () {
    return deployer.deploy(Credit, RPToken.address);
  }).then(function () {
    return deployer.deploy(PointExchange, RPToken.address);
  }).then(function () {
    return RPToken.deployed();
  }).then(function (instance) { // load other contracts' information
    instance.loadBankLiability(BankLiability.address);
    instance.setCreditAddr(Credit.address);
    return Credit.deployed();
  }).then(async function (instance) {
    instance.setBankLiabilityAddr(BankLiability.address);
    return BankLiability.deployed();
  }).then(function (instance) {
    return instance.loadCredit(Credit.address);
  }); */
};
