const express = require('express');
const controller = require('./controller');
const authRouter = express.Router();

/** POST /api/auth */
authRouter.post("/", controller.create);

module.exports = authRouter;