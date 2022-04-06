const express = require('express');
const controller = require('./controller');
const testRouter = express.Router();

/** GET /api/test */
testRouter.get("/decentralizedLogin", controller.decentralizedLogin);
testRouter.get("/login", controller.login);
testRouter.get("/addUser", controller.addUser);

testRouter.get("/deliver", controller.deliver);
testRouter.get("/issue", controller.issue);
testRouter.get("/redeem", controller.redeem);
testRouter.get("/redeem5000", controller.redeem5000);
testRouter.get("/realize", controller.realize);

testRouter.get("/exchangeRP", controller.exchangeRP);
testRouter.get("/exchangeOther", controller.exchangeOther);

testRouter.get("/uploadProduct", controller.uploadProduct);
testRouter.get("/removeProduct", controller.removeProduct);
testRouter.get("/viewProduct", controller.viewProduct);


module.exports = testRouter;