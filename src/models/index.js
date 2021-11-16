const Web3 = require('web3');
const web3 = new Web3('ws://localhost:8545')
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:'
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize, web3);

module.exports = db;