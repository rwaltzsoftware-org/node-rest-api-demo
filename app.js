const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require("mongoose");

const config = require('./config');

const connection = config.dbConfig.connection;
const categoryModule = config.routeSlug.category;

const app = express();

/*  Mongoose Connect */
mongoose.connect(connection);

/*  Routes  */
const roleRoutes = require('./api/routes/role');
const userRoutes = require('./api/routes/user');
const categoryRoutes = require('./api/routes/category');

app.use(logger('dev'));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use("/roles", roleRoutes);
app.use("/users", userRoutes);
app.use('/' + categoryModule, categoryRoutes);

app.use((request,response,next) => {
    const error = new Error("Not Found");
    error.status = "404";
    next(error);
})


app.use((error,request,response,next) => {
    
    const status = error.status || 500;
    
    return response.status(status)
                    .json({error : {message: error.message}});
});


module.exports = app;
