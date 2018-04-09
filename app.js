const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');

const app = express();

const roleRoutes = require('./api/routes/role');

app.use(logger('dev'));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use("/roles", roleRoutes);

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
