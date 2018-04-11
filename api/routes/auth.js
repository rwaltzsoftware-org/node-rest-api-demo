const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //bcrypt package is used to encrypt password into hash
const jwt = require('jsonwebtoken'); // jsonwebtoken is used for creating tokens
const random = require('randomstring');
const appConfig = require('../../config');
const Joi = require('joi');
const router = express.Router();
const AuthController = require('../controllers/auth');
const User = require('../models/user');
const checkAuth = require('../middlewares/check-auth');


router.post("/signup", AuthController.signup);

router.post("/login", AuthController.login);

router.post('/forgotPassword', AuthController.forgotPassword);

router.post("/resetPassword", AuthController.resetPassword);

module.exports = router;