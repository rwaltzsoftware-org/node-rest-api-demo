"use strict"
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //bcrypt package is used to encrypt password into hash
const jwt = require('jsonwebtoken'); // jsonwebtoken is used for creating tokens
const random = require('randomstring');
const appConfig = require('../../config');
const Joi = require('joi'); 

const router = express.Router();

const User = require('../models/user');

router.post("/signup", (request, response, next) => {
    
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

});

router.post("/login", (request, response, next) => {

    const validationSchema = {
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }

    const validate = Joi.validate(request.body,validationSchema);
    if(validate.error)
    {
        return response.status(500).json({
            message:"Email address and Password is required"
        });
    }

    /*     console.log(validate);
    return; */

    /* Find out the user already exist or not */    

    User.findOne({
            email: request.body.email
        })
        .exec()
        .then((user) => {
            return new Promise((resolve, reject) => {
                if (!user) {
                    const error = new Error("Invalid User");
                    error.status = 404;
                    reject(error);
                } else {
                    resolve(user);
                }
            });
        })
        .then((user) => {
            /* compare password with database password  */
            return bcrypt.compare(request.body.password, user.password)
                .then((res) => {
                    if (!res) {
                        return response.status(404).json({
                            message: "Invalid Passwords"
                        });
                    }
                    // res == true      
                    const tokenPayload = {
                        _id: user._id
                    };

                    const token = jwt.sign(tokenPayload, appConfig.secretKey);
                    return response.status(200).json({
                        message: "Login Successful",
                        token: token
                    });
                });
        })
        .catch((error) => {
            response.status(error.status || 500).json({
                error: error.message
                //message: "Email address not found"
            });
        });
});

router.post('/forgotPassword', (request, response, next) => {

    const validationSchema = {
        email: Joi.string().email().required()       
    }

    const validate = Joi.validate(request.body,validationSchema);
    if(validate.error)
    {
        return response.status(500).json({
            message:"Email address is required"
        });
    }

    /* Find out the email address already exist or not */
    User.findOne({
            email: request.body.email
        })
        .exec()
        .then((user) => {
            return new Promise((resolve, reject) => {
                if (!user) {
                    const error = new Error("User with Email address not found");
                    error.status = 404;
                    reject(error);
                } else {
                    resolve(user);
                }
            });
        })
        .then((user) => {

            const resetcode = random.generate(appConfig.resetCodeLength);
            const resettime = new Date();

            resettime.setHours(resettime.getHours() + appConfig.addHours);

            /* update reset code and reset till valid time into database*/
            return User.update({
                    'email': request.body.email
                }, {
                    '$set': {
                        resetcode: resetcode,
                        resetvalidtill: resettime
                    }
                })
                .exec()
                .then((res) => {
                    if (res) {
                        return response.status(200).json({
                            resetcode: resetcode,
                            resetvalidtill: resettime
                        });
                    }
                });
        })
        .catch((error) => {
            response.status(error.status || 500).json({
                error: error.message
                //message: "Email address is invalid"
            });
        });
});


router.post("/resetPassword", (request, response, next) => {

    const validationSchema = {
        reset_code: Joi.string().required(),
        new_password:  Joi.string().required()
    }

    const validate = Joi.validate(request.body,validationSchema);
    if(validate.error)
    {
        return response.status(500).json({
            message:"Reset code and New Password is Required"
        });
    }

    /* find the reset code in database */
    User.findOne({
            resetcode: request.body.reset_code
        })
        .exec()
        .then((user) => {
            return new Promise((resolve, reject) => {
                if (!user) {
                    const error = new Error("Invalid Reset Request");
                    error.status = 404;
                    reject(error);
                } else {
                    resolve();
                }
            });
        })
        .then(()=>{
             /* generate hash of new password*/
            return bcrypt.hash(request.body.new_password, appConfig.saltRounds)
             .then((hash) => {
                 /* update new password into database*/

                 let updateCriteria = {
                     resetcode: request.body.reset_code
                 };
                 let updateData = {
                     $set: {
                         password: hash,
                         resetcode: null
                     }
                 };

                 User.update(updateCriteria, updateData)
                     .exec()
                     .then((res) => {
                         if (res) {
                             response.status(200).json({
                                 message: "Password Reset Succussfully"
                             });
                         }
                     })
             });
        })
        .catch((error) => {           
            response.status(error.status || 500).json({
                error: error.message
                //message: "Invalid Reset Code"
            });
        });
});

module.exports = router;