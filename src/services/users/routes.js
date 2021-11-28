const express = require('express');
const jwt = require('express-jwt');

const { JWTconfig } = require('../../config');
const controller = require('./controller');

const userRouter = express.Router();

/** GET /api/users */
userRouter.route('/').get(controller.find);

/** GET /api/users/:userId */
/** Authenticated route */
userRouter.route('/:userId').get(jwt(JWTconfig), controller.get);

/** POST /api/users */
userRouter.route('/').post(controller.create);

/** PATCH /api/users/:userId */
/** Authenticated route */
userRouter.route('/:userId').patch(jwt(JWTconfig), controller.patch);

module.exports = userRouter;