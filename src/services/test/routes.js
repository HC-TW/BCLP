const express = require('express');
const controller = require('./controller');
const testRouter = express.Router();

/** GET /api/test */
testRouter.get("/decentralizedLogin", controller.decentralizedLogin);

testRouter.get("/deliver", controller.deliver);

testRouter.get("/issue", controller.issue);

testRouter.get("/redeem", controller.redeem);

testRouter.get("/redeem5000", controller.redeem5000);

testRouter.get("/realize", controller.realize);


module.exports = testRouter;