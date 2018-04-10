const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //bcrypt package is used to encrypt password into hash
const jwt = require('jsonwebtoken'); // jsonwebtoken is used for creating tokens
const random = require('randomstring');
const appConfig = require('../../config');
const Joi = require('joi');
const User = require('../models/user');

exports.user_signup = (request, response, next) => {
    
    const validationSchema = {
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }

    const validate = Joi.validate(request.body,validationSchema);
    if(validate.error)
    {
        return response.status(500).json({
            message:"Name, Email address and Password is required"
        });
    }

    /* Find out the user already exist or not */
    User.findOne({
            email: request.body.email
        })
        .exec()
        .then((user) => {
            return new Promise((resolve, reject) => {
                if (user) {

                    const error = new Error("Email Address Already Exists, Try with another Email Address");
                    error.status = 409;

                    reject(error);
                } else {
                    resolve();
                }
            });
        })
        .then(() => {
            /* Encrypt the password and save it in database */
            return bcrypt.hash(request.body.password, appConfig.saltRounds)
                .then((hash) => {

                    const user = new User({
                        name: request.body.name,
                        email: request.body.email,
                        password: hash
                    });

                    return user
                        .save();
                })
                .then((user) => {
                    response.status(201).json({
                        message: "User created"
                    });
                });
        })
        .catch((error) => {
            response.status(error.status || 500).json({
                error: error.message
            });
        });

};






