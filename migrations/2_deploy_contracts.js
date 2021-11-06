const RPToken = artifacts.require("RPToken");
const BankLiability = artifacts.require("BankLiability");
const Credit = artifacts.require("Credit");
const PointsExchange = artifacts.require("PointsExchange");

module.exports = function (deployer) {
  deployer.deploy(RPToken, "Rewarding Points", "RP").then(function () {
    return deployer.deploy(BankLiability, RPToken.address);
  }).then(function () {
    return deployer.deploy(Credit, RPToken.address);
  }).then(function () {
    return deployer.deploy(PointsExchange, RPToken.address);
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
  });
};
