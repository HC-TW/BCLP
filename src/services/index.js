const express = require('express');

const authRouter = require('./auth');
const userRouter = require('./users');
const testRouter = require('./test')

const services = express.Router();

services.use('/auth', authRouter);
services.use('/users', userRouter);
services.use('/test', testRouter)

module.exports = services;