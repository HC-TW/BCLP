const Web3 = require('web3');
const web3 = new Web3("ws://localhost:8545");

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("User", {
        publicAddress: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true,
            validate: {
                isAddress(value) {
                    if (!web3.utils.isAddress(value)) {
                        throw new Error('You are using an invalid ethereum address');
                    }
                }
            }
        },
        nonce: {
            allowNull: false,
            type: Sequelize.INTEGER,
            defaultValue: () => Math.floor(Math.random() * 1000000)
        }
    });

    return User;
};