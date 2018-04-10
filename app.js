const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // import the mongoose module

const authRoutes = require('./api/routes/auth');

const app = express();

mongoose.connect('mongodb://localhost:27017/nodeRestApi'); //setup mongoose connection with localhost mongodb

mongoose.Promise = global.Promise; //get mongoose to use the globle promise library

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.use('/auth',authRoutes);

module.exports = app;