const express = require('express');
const controller = require('./controller');
const testRouter = express.Router();

/** GET /api/test */
testRouter.get("/decentralizedLogin", controller.decentralizedLogin);

module.exports = testRouter;