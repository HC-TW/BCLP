const express = require('express');

const authRouter = require('./auth');
const userRouter = require('./users');

const services = express.Router();

services.use('/auth', authRouter);
services.use('/users', userRouter);

module.exports = services;