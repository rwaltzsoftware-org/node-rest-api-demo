const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const router = express.Router();

const User = require('../models/user');

router.post("/signup", (req, res, next) => {

    User.findOne({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user) {

                return res.status(409).json({
                    message: "Mail exists"
                });

            }
            else {
                    bcrypt.hash(req.body.password, 15, (error, hash) => {

                    if (error) {
                        return res.status(500).json({
                            error: error
                        });
                    } else {
                        const user = new User({
                            name: req.body.name,
                            email: req.body.email,
                            password: hash
                        });

                        //  console.log(user);

                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "User created"
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        });
});

module.exports = router;